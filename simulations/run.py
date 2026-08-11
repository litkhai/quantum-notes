"""Run the Qiskit Aer experiments and generate site-ready result files."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator
from qiskit_aer.noise import NoiseModel, ReadoutError, depolarizing_error

from simulations.circuits import bell_state, experiment_circuits

DEFAULT_SHOTS = 4096
DEFAULT_SEED = 42

EXPERIMENT_LABELS = {
    "h_h": "H-H 간섭",
    "h_z_h": "H-Z-H 위상 간섭",
    "bell_ideal": "Bell 상태",
    "bell_noisy": "Bell 상태와 잡음",
    "grover_11": "2큐비트 Grover",
}

INTERPRETATIONS = {
    "h_h": "두 H 게이트의 경로가 0 상태에서 보강돼 입력 상태로 돌아간다.",
    "h_z_h": "Z가 바꾼 상대위상을 마지막 H가 측정 가능한 1 상태로 변환한다.",
    "bell_ideal": "각 비트는 무작위이며 두 비트를 함께 보면 00과 11의 상관관계가 나타난다.",
    "bell_noisy": "게이트·측정 잡음이 01과 10 결과를 만들며 이상적 상관관계를 낮춘다.",
    "grover_11": "한 번의 오라클과 확산 연산이 표시된 상태 11의 진폭을 보강한다.",
}


def teaching_noise_model() -> NoiseModel:
    """Return a deliberately visible noise model for the Bell comparison."""
    model = NoiseModel()
    model.add_all_qubit_quantum_error(depolarizing_error(0.02, 1), ["h", "x"])
    model.add_all_qubit_quantum_error(depolarizing_error(0.05, 2), ["cx", "cz"])
    model.add_all_qubit_readout_error(
        ReadoutError([[0.98, 0.02], [0.03, 0.97]])
    )
    return model


def run_counts(
    circuit: QuantumCircuit,
    *,
    shots: int = DEFAULT_SHOTS,
    seed: int = DEFAULT_SEED,
    noise_model: NoiseModel | None = None,
) -> dict[str, int]:
    """Execute one circuit with reproducible transpiler and simulator seeds."""
    simulator = AerSimulator(method="statevector", noise_model=noise_model)
    compiled = transpile(
        circuit,
        simulator,
        optimization_level=1,
        seed_transpiler=seed,
    )
    result = simulator.run(
        compiled,
        shots=shots,
        seed_simulator=seed,
    ).result()
    counts = result.get_counts()
    return dict(sorted(counts.items()))


def probabilities(counts: dict[str, int], shots: int) -> dict[str, float]:
    """Convert counts to probabilities rounded for stable serialization."""
    return {state: round(count / shots, 6) for state, count in counts.items()}


def correlation_probability(counts: dict[str, int], shots: int) -> float:
    """Return the probability of equal bits for a two-qubit result."""
    return round((counts.get("00", 0) + counts.get("11", 0)) / shots, 6)


def simulate_suite(
    *, shots: int = DEFAULT_SHOTS, seed: int = DEFAULT_SEED
) -> dict[str, Any]:
    """Run all ideal experiments plus the noisy Bell comparison."""
    if shots <= 0:
        raise ValueError("shots must be a positive integer")

    experiments: dict[str, Any] = {}
    for key, circuit in experiment_circuits().items():
        counts = run_counts(circuit, shots=shots, seed=seed)
        experiments[key] = {
            "label": EXPERIMENT_LABELS[key],
            "counts": counts,
            "probabilities": probabilities(counts, shots),
            "interpretation": INTERPRETATIONS[key],
        }

    noisy_counts = run_counts(
        bell_state(),
        shots=shots,
        seed=seed,
        noise_model=teaching_noise_model(),
    )
    experiments["bell_noisy"] = {
        "label": EXPERIMENT_LABELS["bell_noisy"],
        "counts": noisy_counts,
        "probabilities": probabilities(noisy_counts, shots),
        "interpretation": INTERPRETATIONS["bell_noisy"],
    }

    experiments["bell_ideal"]["correlation_probability"] = correlation_probability(
        experiments["bell_ideal"]["counts"], shots
    )
    experiments["bell_noisy"]["correlation_probability"] = correlation_probability(
        noisy_counts, shots
    )

    return {
        "configuration": {"shots": shots, "seed": seed},
        "experiments": experiments,
    }


def format_counts(counts: dict[str, int]) -> str:
    """Format a count dictionary for a compact Markdown table cell."""
    return ", ".join(f"`{state}`: {count}" for state, count in counts.items())


def markdown_report(payload: dict[str, Any]) -> str:
    """Render deterministic experiment results as a Markdown document."""
    configuration = payload["configuration"]
    experiments = payload["experiments"]
    lines = [
        "# Qiskit Aer 자동 실행 결과",
        "",
        "[시뮬레이션 안내](README.md) · [입문 강의 본문](../01-beginner-lecture/lecture-notes.md)",
        "",
        "> 이 문서는 `python -m simulations.run`으로 생성한다. "
        f"shots={configuration['shots']}, seed={configuration['seed']}를 사용했다.",
        "",
        "## 결과 요약",
        "",
        "| 실험 | 측정 counts | 해석 |",
        "|---|---|---|",
    ]

    for key in ("h_h", "h_z_h", "bell_ideal", "bell_noisy", "grover_11"):
        item = experiments[key]
        lines.append(
            f"| {item['label']} | {format_counts(item['counts'])} | "
            f"{item['interpretation']} |"
        )

    ideal_corr = experiments["bell_ideal"]["correlation_probability"]
    noisy_corr = experiments["bell_noisy"]["correlation_probability"]
    lines.extend(
        [
            "",
            "## Bell 상관관계와 잡음",
            "",
            f"- 이상적 Bell 회로의 동일 비트 확률: **{ideal_corr:.3%}**",
            f"- 교육용 잡음 모델의 동일 비트 확률: **{noisy_corr:.3%}**",
            "",
            "잡음 모델은 한 큐비트 게이트 2%, 두 큐비트 게이트 5%의 "
            "depolarizing error와 비대칭 readout error를 사용한다. 실제 QPU의 "
            "잡음은 장비·큐비트·보정 시점에 따라 달라진다.",
            "",
            "## 재현 명령",
            "",
            "```bash",
            "python -m pip install -r requirements-simulations.txt",
            "python -m simulations.run",
            "python -m unittest discover -s tests -v",
            "```",
            "",
            "기계 판독용 전체 결과는 [results.json](results.json)에서 확인한다.",
            "",
            "[시뮬레이션 안내](README.md) · [입문 강의 본문](../01-beginner-lecture/lecture-notes.md)",
            "",
        ]
    )
    return "\n".join(lines)


def write_reports(payload: dict[str, Any], output_dir: Path) -> None:
    """Write stable JSON and Markdown reports."""
    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / "results.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    (output_dir / "results.md").write_text(
        markdown_report(payload),
        encoding="utf-8",
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Run the Qiskit Aer teaching experiments."
    )
    parser.add_argument("--shots", type=int, default=DEFAULT_SHOTS)
    parser.add_argument("--seed", type=int, default=DEFAULT_SEED)
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("docs/04-simulations"),
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    payload = simulate_suite(shots=args.shots, seed=args.seed)
    write_reports(payload, args.output_dir)
    print(f"Wrote simulation reports to {args.output_dir}")


if __name__ == "__main__":
    main()
