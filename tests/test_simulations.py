"""Regression tests for the Qiskit Aer teaching experiments."""

import unittest
from datetime import datetime, timezone

from simulations.circuits import (
    bell_state,
    ghz_state,
    grover_two_qubit,
    hh_interference,
    hzh_interference,
)
from simulations.clickhouse_demo import generate_shot_events, linear_noise_schedule
from simulations.run import (
    correlation_probability,
    run_counts,
    teaching_noise_model,
)


class SimulationTests(unittest.TestCase):
    shots = 2048
    seed = 42

    def test_hh_returns_zero(self) -> None:
        counts = run_counts(hh_interference(), shots=self.shots, seed=self.seed)
        self.assertEqual(counts, {"0": self.shots})

    def test_hzh_returns_one(self) -> None:
        counts = run_counts(hzh_interference(), shots=self.shots, seed=self.seed)
        self.assertEqual(counts, {"1": self.shots})

    def test_bell_has_only_correlated_ideal_results(self) -> None:
        counts = run_counts(bell_state(), shots=self.shots, seed=self.seed)
        self.assertEqual(set(counts), {"00", "11"})
        self.assertEqual(correlation_probability(counts, self.shots), 1.0)

    def test_grover_marks_eleven(self) -> None:
        counts = run_counts(grover_two_qubit(), shots=self.shots, seed=self.seed)
        self.assertEqual(counts, {"11": self.shots})

    def test_noise_reduces_bell_correlation(self) -> None:
        counts = run_counts(
            bell_state(),
            shots=self.shots,
            seed=self.seed,
            noise_model=teaching_noise_model(),
        )
        correlation = correlation_probability(counts, self.shots)
        self.assertGreater(correlation, 0.75)
        self.assertLess(correlation, 0.99)
        self.assertTrue({"01", "10"}.intersection(counts))

    def test_ghz_has_only_all_zero_or_all_one_results(self) -> None:
        counts = run_counts(ghz_state(3), shots=self.shots, seed=self.seed)
        self.assertEqual(set(counts), {"000", "111"})

    def test_noise_schedule_includes_both_endpoints(self) -> None:
        self.assertEqual(linear_noise_schedule(3, 0.0, 0.1), [0.0, 0.05, 0.1])

    def test_clickhouse_demo_emits_one_row_per_shot(self) -> None:
        events = generate_shot_events(
            runs=2,
            shots_per_run=256,
            qubits=3,
            seed=self.seed,
            noise_start=0.0,
            noise_end=0.2,
            experiment_id="test-experiment",
            start_time=datetime(2026, 1, 1, tzinfo=timezone.utc),
        )
        first = [event for event in events if event.run_index == 0]
        last = [event for event in events if event.run_index == 1]

        self.assertEqual(len(events), 512)
        self.assertTrue(all(event.is_expected for event in first))
        self.assertTrue(any(not event.is_expected for event in last))
        self.assertEqual(len(events[0].bitstring), 3)


if __name__ == "__main__":
    unittest.main()
