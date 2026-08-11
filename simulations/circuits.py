"""Small circuits that support the conceptual explanations in the notes."""

from qiskit import QuantumCircuit


def hh_interference() -> QuantumCircuit:
    """Return H-H: both paths interfere back to |0>."""
    circuit = QuantumCircuit(1, 1, name="H-H")
    circuit.h(0)
    circuit.h(0)
    circuit.measure(0, 0)
    return circuit


def hzh_interference() -> QuantumCircuit:
    """Return H-Z-H: the relative phase changes the output to |1>."""
    circuit = QuantumCircuit(1, 1, name="H-Z-H")
    circuit.h(0)
    circuit.z(0)
    circuit.h(0)
    circuit.measure(0, 0)
    return circuit


def bell_state() -> QuantumCircuit:
    """Return a Bell-state circuit measured in the computational basis."""
    circuit = QuantumCircuit(2, 2, name="Bell")
    circuit.h(0)
    circuit.cx(0, 1)
    circuit.measure([0, 1], [0, 1])
    return circuit


def grover_two_qubit() -> QuantumCircuit:
    """Return one Grover iteration that marks the two-bit state |11>."""
    circuit = QuantumCircuit(2, 2, name="Grover-11")

    # Uniform superposition.
    circuit.h([0, 1])

    # Phase oracle: CZ changes only the phase of |11>.
    circuit.cz(0, 1)

    # Two-qubit diffuser: H X CZ X H.
    circuit.h([0, 1])
    circuit.x([0, 1])
    circuit.cz(0, 1)
    circuit.x([0, 1])
    circuit.h([0, 1])

    circuit.measure([0, 1], [0, 1])
    return circuit


def experiment_circuits() -> dict[str, QuantumCircuit]:
    """Return the ideal circuits in their report order."""
    return {
        "h_h": hh_interference(),
        "h_z_h": hzh_interference(),
        "bell_ideal": bell_state(),
        "grover_11": grover_two_qubit(),
    }
