"""Regression tests for the Qiskit Aer teaching experiments."""

import unittest

from simulations.circuits import (
    bell_state,
    grover_two_qubit,
    hh_interference,
    hzh_interference,
)
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


if __name__ == "__main__":
    unittest.main()
