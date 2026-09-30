-- Quantum experiment observability demo for ClickHouse.
-- The Python loader creates quantum_shots automatically. These queries explain
-- what the analytics database contributes after the quantum circuit is measured.

USE quantum;

-- 1. Measurement probability distribution for every experiment.
SELECT
    experiment_id,
    circuit,
    bitstring,
    count() AS observations,
    round(observations / sum(observations) OVER (PARTITION BY experiment_id), 4)
        AS probability
FROM quantum_shots
GROUP BY experiment_id, circuit, bitstring
ORDER BY experiment_id, observations DESC;

-- 2. Noise drift: a GHZ result is successful only when every bit is 0 or every bit is 1.
SELECT
    experiment_id,
    event_time,
    noise_level,
    count() AS shots,
    round(avg(is_expected), 4) AS success_rate,
    round(1 - success_rate, 4) AS observed_error_rate
FROM quantum_shots
GROUP BY experiment_id, event_time, noise_level
ORDER BY experiment_id, event_time;

-- 3. Which unexpected outcomes dominate as noise rises?
SELECT
    experiment_id,
    bitstring,
    count() AS errors,
    round(avg(noise_level), 4) AS average_noise
FROM quantum_shots
WHERE is_expected = 0
GROUP BY experiment_id, bitstring
ORDER BY experiment_id, errors DESC
LIMIT 20 BY experiment_id;

-- 4. Compact experiment scorecard for a dashboard.
SELECT
    experiment_id,
    any(backend) AS backend,
    any(circuit) AS circuit,
    min(event_time) AS started_at,
    max(event_time) AS finished_at,
    uniqExact(run_id) AS runs,
    count() AS shots,
    round(avg(is_expected), 4) AS success_rate
FROM quantum_shots
GROUP BY experiment_id
ORDER BY started_at DESC;

-- 5. Compare the first and last simulated calibration windows.
WITH window_scores AS
(
    SELECT
        experiment_id,
        run_index,
        noise_level,
        avg(is_expected) AS success_rate
    FROM quantum_shots
    GROUP BY experiment_id, run_index, noise_level
)
SELECT
    experiment_id,
    argMin(success_rate, run_index) AS first_success_rate,
    argMax(success_rate, run_index) AS last_success_rate,
    round(first_success_rate - last_success_rate, 4) AS degradation
FROM window_scores
GROUP BY experiment_id;
