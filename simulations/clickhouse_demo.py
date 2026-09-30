"""Generate noisy quantum-shot events and optionally load them into ClickHouse."""

from __future__ import annotations

import argparse
import getpass
import json
import os
import re
import uuid
from dataclasses import asdict, dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Iterable

from simulations.circuits import ghz_state
from simulations.run import configurable_noise_model, run_memory

DEFAULT_RUNS = 12
DEFAULT_SHOTS_PER_RUN = 1024
DEFAULT_QUBITS = 3
DEFAULT_SEED = 42

TABLE_COLUMNS = [
    "event_time",
    "experiment_id",
    "run_id",
    "backend",
    "circuit",
    "qubits",
    "run_index",
    "shot_index",
    "bitstring",
    "is_expected",
    "noise_level",
    "seed",
]


@dataclass(frozen=True)
class ShotEvent:
    """One classical measurement emitted by a simulated quantum circuit."""

    event_time: datetime
    experiment_id: str
    run_id: str
    backend: str
    circuit: str
    qubits: int
    run_index: int
    shot_index: int
    bitstring: str
    is_expected: int
    noise_level: float
    seed: int

    def json_dict(self) -> dict[str, Any]:
        payload = asdict(self)
        payload["event_time"] = self.event_time.isoformat(timespec="milliseconds")
        return payload

    def clickhouse_row(self) -> list[Any]:
        payload = asdict(self)
        return [payload[column] for column in TABLE_COLUMNS]


def linear_noise_schedule(runs: int, start: float, end: float) -> list[float]:
    """Return an inclusive linear drift schedule."""
    if runs <= 0:
        raise ValueError("runs must be a positive integer")
    if not 0.0 <= start <= 1.0 or not 0.0 <= end <= 1.0:
        raise ValueError("noise probabilities must be between 0 and 1")
    if runs == 1:
        return [round(start, 6)]
    step = (end - start) / (runs - 1)
    return [round(start + index * step, 6) for index in range(runs)]


def generate_shot_events(
    *,
    runs: int = DEFAULT_RUNS,
    shots_per_run: int = DEFAULT_SHOTS_PER_RUN,
    qubits: int = DEFAULT_QUBITS,
    seed: int = DEFAULT_SEED,
    noise_start: float = 0.0,
    noise_end: float = 0.12,
    experiment_id: str | None = None,
    start_time: datetime | None = None,
) -> list[ShotEvent]:
    """Simulate GHZ measurements while the hardware noise gradually increases."""
    if shots_per_run <= 0:
        raise ValueError("shots_per_run must be a positive integer")
    if qubits < 2:
        raise ValueError("qubits must be at least two")

    experiment_id = experiment_id or str(uuid.uuid4())
    start_time = start_time or datetime.now(timezone.utc).replace(microsecond=0)
    if start_time.tzinfo is None:
        start_time = start_time.replace(tzinfo=timezone.utc)

    circuit = ghz_state(qubits)
    expected = {"0" * qubits, "1" * qubits}
    events: list[ShotEvent] = []

    for run_index, noise_level in enumerate(
        linear_noise_schedule(runs, noise_start, noise_end)
    ):
        run_seed = seed + run_index
        run_time = start_time + timedelta(minutes=run_index * 5)
        run_id = f"{experiment_id}-{run_index:03d}"

        model = configurable_noise_model(
            one_qubit_error=noise_level * 0.4,
            two_qubit_error=noise_level,
            readout_0_to_1=noise_level * 0.5,
            readout_1_to_0=noise_level * 0.6,
        )
        memory = run_memory(
            circuit,
            shots=shots_per_run,
            seed=run_seed,
            noise_model=model,
        )

        for shot_index, bitstring in enumerate(memory):
            events.append(
                ShotEvent(
                    event_time=run_time,
                    experiment_id=experiment_id,
                    run_id=run_id,
                    backend="aer_simulator",
                    circuit=f"ghz_{qubits}",
                    qubits=qubits,
                    run_index=run_index,
                    shot_index=shot_index,
                    bitstring=bitstring,
                    is_expected=int(bitstring in expected),
                    noise_level=noise_level,
                    seed=run_seed,
                )
            )

    return events


def write_jsonl(events: Iterable[ShotEvent], output: Path) -> int:
    """Write events as JSONEachRow, which ClickHouse can ingest directly."""
    rows = [
        json.dumps(event.json_dict(), ensure_ascii=False, separators=(",", ":"))
        for event in events
    ]
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text("\n".join(rows) + "\n", encoding="utf-8")
    return len(rows)


def _identifier(value: str) -> str:
    if not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", value):
        raise ValueError(f"unsafe ClickHouse identifier: {value!r}")
    return value


def clickhouse_client(
    *,
    database: str | None = None,
    password: str | None = None,
) -> Any:
    """Create the official ClickHouse Python client from environment variables."""
    try:
        import clickhouse_connect
    except ImportError as exc:
        raise RuntimeError(
            "clickhouse-connect is required for --load-clickhouse; "
            "install requirements-simulations.txt"
        ) from exc

    port = int(os.getenv("CLICKHOUSE_PORT", "8123"))
    secure_value = os.getenv("CLICKHOUSE_SECURE")
    secure = port == 8443 if secure_value is None else secure_value.lower() in {
        "1",
        "true",
        "yes",
    }
    return clickhouse_connect.get_client(
        host=os.getenv("CLICKHOUSE_HOST", "localhost"),
        port=port,
        username=os.getenv("CLICKHOUSE_USERNAME", "default"),
        password=(
            password
            if password is not None
            else os.getenv("CLICKHOUSE_PASSWORD", "")
        ),
        database=database or os.getenv("CLICKHOUSE_DATABASE", "default"),
        secure=secure,
    )


def create_table_and_insert(
    events: list[ShotEvent],
    table: str,
    *,
    database: str | None = None,
    password: str | None = None,
    create_database: bool = False,
) -> tuple[int, float]:
    """Create a MergeTree table, insert the events, and return count/success rate."""
    table = _identifier(table)
    database = _identifier(database or os.getenv("CLICKHOUSE_DATABASE", "default"))
    if create_database:
        bootstrap_client = clickhouse_client(database="default", password=password)
        bootstrap_client.command(f"CREATE DATABASE IF NOT EXISTS {database}")
        bootstrap_client.close()

    client = clickhouse_client(database=database, password=password)
    client.command(
        f"""
        CREATE TABLE IF NOT EXISTS {table}
        (
            event_time DateTime64(3, 'UTC'),
            experiment_id LowCardinality(String),
            run_id String,
            backend LowCardinality(String),
            circuit LowCardinality(String),
            qubits UInt8,
            run_index UInt16,
            shot_index UInt32,
            bitstring String,
            is_expected UInt8,
            noise_level Float32,
            seed UInt64
        )
        ENGINE = MergeTree
        PARTITION BY toYYYYMM(event_time)
        ORDER BY (experiment_id, circuit, event_time, run_id, shot_index)
        """
    )
    client.insert(
        table,
        [event.clickhouse_row() for event in events],
        column_names=TABLE_COLUMNS,
    )
    experiment_id = events[0].experiment_id
    result = client.query(
        f"""
        SELECT count(), avg(is_expected)
        FROM {table}
        WHERE experiment_id = {{experiment_id:String}}
        """,
        parameters={"experiment_id": experiment_id},
    ).first_row
    return int(result[0]), float(result[1])


def summarize(events: list[ShotEvent]) -> dict[str, Any]:
    """Return the small local summary that should match the ClickHouse query."""
    expected = sum(event.is_expected for event in events)
    return {
        "experiment_id": events[0].experiment_id,
        "rows": len(events),
        "runs": len({event.run_id for event in events}),
        "success_rate": expected / len(events),
        "first_noise": events[0].noise_level,
        "last_noise": events[-1].noise_level,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Simulate noisy GHZ shots, write JSONEachRow, and optionally load ClickHouse."
        )
    )
    parser.add_argument("--runs", type=int, default=DEFAULT_RUNS)
    parser.add_argument("--shots-per-run", type=int, default=DEFAULT_SHOTS_PER_RUN)
    parser.add_argument("--qubits", type=int, default=DEFAULT_QUBITS)
    parser.add_argument("--seed", type=int, default=DEFAULT_SEED)
    parser.add_argument("--noise-start", type=float, default=0.0)
    parser.add_argument("--noise-end", type=float, default=0.12)
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("artifacts/quantum-clickhouse/quantum_shots.jsonl"),
    )
    parser.add_argument("--load-clickhouse", action="store_true")
    parser.add_argument(
        "--database",
        default=os.getenv("CLICKHOUSE_DATABASE", "default"),
    )
    parser.add_argument("--create-database", action="store_true")
    parser.add_argument(
        "--password-prompt",
        action="store_true",
        help="Read the ClickHouse password without echoing or storing it.",
    )
    parser.add_argument(
        "--table",
        default=os.getenv("CLICKHOUSE_TABLE", "quantum_shots"),
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    events = generate_shot_events(
        runs=args.runs,
        shots_per_run=args.shots_per_run,
        qubits=args.qubits,
        seed=args.seed,
        noise_start=args.noise_start,
        noise_end=args.noise_end,
    )
    write_jsonl(events, args.output)
    summary = summarize(events)

    print(json.dumps(summary, ensure_ascii=False, indent=2))
    print(f"JSONEachRow written to {args.output}")

    if args.load_clickhouse:
        password = (
            getpass.getpass("ClickHouse password: ")
            if args.password_prompt
            else None
        )
        count, success_rate = create_table_and_insert(
            events,
            args.table,
            database=args.database,
            password=password,
            create_database=args.create_database,
        )
        print(
            f"ClickHouse table {args.database}.{args.table}: rows={count}, "
            f"success_rate={success_rate:.2%}"
        )


if __name__ == "__main__":
    main()
