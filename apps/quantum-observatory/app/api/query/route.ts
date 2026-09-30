import { isPresetId, presetById, type PresetId } from "../../../lib/presets";

type ResultRow = Record<string, string | number | null>;

type ClickHouseResponse = {
  meta?: { name: string; type: string }[];
  data?: ResultRow[];
  rows?: number;
  statistics?: { elapsed?: number; rows_read?: number; bytes_read?: number };
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function identifier(value: string, fallback: string) {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(value) ? value : fallback;
}

function config() {
  const host = (process.env.CLICKHOUSE_HOST ?? "").replace(/^https?:\/\//, "").split("/")[0];
  const password = process.env.CLICKHOUSE_PASSWORD ?? "";
  return {
    host,
    password,
    port: process.env.CLICKHOUSE_PORT ?? "8443",
    secure: (process.env.CLICKHOUSE_SECURE ?? "true").toLowerCase() !== "false",
    username: process.env.CLICKHOUSE_USERNAME ?? "default",
    database: identifier(process.env.CLICKHOUSE_DATABASE ?? "quantum", "quantum"),
    table: identifier(process.env.CLICKHOUSE_TABLE ?? "quantum_shots", "quantum_shots"),
    sample: process.env.CLICKHOUSE_DEMO_MODE === "sample" || !host || !password,
  };
}

async function clickhouseQuery(
  sql: string,
  parameters: Record<string, string> = {},
): Promise<ClickHouseResponse> {
  const settings = config();
  const protocol = settings.secure ? "https" : "http";
  const url = new URL(`${protocol}://${settings.host}:${settings.port}/`);
  url.searchParams.set("database", settings.database);
  url.searchParams.set("default_format", "JSON");
  for (const [key, value] of Object.entries(parameters)) {
    url.searchParams.set(`param_${key}`, value);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${settings.username}:${settings.password}`)}`,
        "Content-Type": "text/plain; charset=utf-8",
      },
      body: `${sql}\nFORMAT JSON`,
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) {
      const detail = (await response.text()).slice(0, 400);
      throw new Error(`ClickHouse ${response.status}: ${detail}`);
    }
    return (await response.json()) as ClickHouseResponse;
  } finally {
    clearTimeout(timer);
  }
}

function presetSql(id: PresetId) {
  const settings = config();
  const table = `\`${settings.database}\`.\`${settings.table}\``;
  const scoped = `WHERE experiment_id = {experiment_id:String}`;

  const queries: Record<PresetId, string> = {
    summary: `
SELECT
    any(circuit) AS circuit,
    any(qubits) AS qubits,
    uniqExact(run_id) AS runs,
    count() AS shots,
    round(avg(is_expected), 4) AS success_rate,
    round(1 - success_rate, 4) AS error_rate,
    round(min(toFloat64(noise_level)), 4) AS first_noise,
    round(max(toFloat64(noise_level)), 4) AS last_noise,
    min(event_time) AS started_at,
    max(event_time) AS finished_at
FROM ${table}
${scoped}`.trim(),
    distribution: `
SELECT
    bitstring,
    count() AS observations,
    round(observations / sum(observations) OVER (), 4) AS probability,
    max(is_expected) AS expected
FROM ${table}
${scoped}
GROUP BY bitstring
ORDER BY observations DESC`.trim(),
    drift: `
SELECT
    run_index,
    any(event_time) AS event_time,
    round(any(toFloat64(noise_level)), 4) AS noise_level,
    count() AS shots,
    round(avg(is_expected), 4) AS success_rate,
    round(1 - success_rate, 4) AS error_rate
FROM ${table}
${scoped}
GROUP BY run_index
ORDER BY run_index`.trim(),
    errors: `
SELECT
    bitstring,
    count() AS errors,
    round(count() / sum(count()) OVER (), 4) AS share_of_errors,
    round(avg(toFloat64(noise_level)), 4) AS average_noise
FROM ${table}
${scoped} AND is_expected = 0
GROUP BY bitstring
ORDER BY errors DESC`.trim(),
    experiments: `
SELECT
    experiment_id,
    argMax(circuit, event_time) AS circuit,
    uniqExact(run_id) AS runs,
    count() AS shots,
    round(avg(is_expected), 4) AS success_rate,
    min(event_time) AS started_at,
    max(event_time) AS finished_at
FROM ${table}
GROUP BY experiment_id
ORDER BY finished_at DESC
LIMIT 20`.trim(),
    degradation: `
WITH window_scores AS
(
    SELECT
        run_index,
        round(avg(is_expected), 4) AS success_rate,
        round(any(toFloat64(noise_level)), 4) AS noise_level
    FROM ${table}
    ${scoped}
    GROUP BY run_index
)
SELECT
    argMin(success_rate, run_index) AS first_success_rate,
    argMax(success_rate, run_index) AS last_success_rate,
    round(first_success_rate - last_success_rate, 4) AS degradation,
    argMin(noise_level, run_index) AS first_noise,
    argMax(noise_level, run_index) AS last_noise
FROM window_scores`.trim(),
    entropy: `
WITH probabilities AS
(
    SELECT
        run_index,
        any(event_time) AS event_time,
        bitstring,
        count() / sum(count()) OVER (PARTITION BY run_index) AS probability
    FROM ${table}
    ${scoped}
    GROUP BY run_index, bitstring
)
SELECT
    run_index,
    any(event_time) AS event_time,
    round(sum(-probability * log2(probability)), 4) AS entropy
FROM probabilities
GROUP BY run_index
ORDER BY run_index`.trim(),
  };
  return queries[id];
}

async function latestExperimentId() {
  const settings = config();
  const table = `\`${settings.database}\`.\`${settings.table}\``;
  const payload = await clickhouseQuery(
    `SELECT argMax(experiment_id, event_time) AS experiment_id FROM ${table}`,
  );
  const value = payload.data?.[0]?.experiment_id;
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) {
    throw new Error("No experiment is available in the configured table.");
  }
  return value;
}

const SAMPLE_EXPERIMENT = "7c9b9687-28fb-4aaa-b1a5-a91ac797940e";
const SAMPLE: Record<PresetId, ResultRow[]> = {
  summary: [{
    circuit: "ghz_3", qubits: 3, runs: 12, shots: 12288,
    success_rate: 0.8431, error_rate: 0.1569, first_noise: 0, last_noise: 0.12,
    started_at: "2026-08-19 15:36:33", finished_at: "2026-08-19 16:31:33",
  }],
  distribution: [
    ["000", 5258, .4279, 1], ["111", 5102, .4152, 1], ["001", 409, .0333, 0],
    ["110", 407, .0331, 0], ["010", 298, .0243, 0], ["011", 295, .024, 0],
    ["101", 262, .0213, 0], ["100", 257, .0209, 0],
  ].map(([bitstring, observations, probability, expected]) => ({ bitstring, observations, probability, expected })),
  drift: [1, .9727, .9346, .8984, .8838, .8643, .8486, .7881, .7627, .7334, .7178, .7129]
    .map((success_rate, run_index) => ({
      run_index, noise_level: Number((run_index * .12 / 11).toFixed(4)), shots: 1024,
      success_rate, error_rate: Number((1 - success_rate).toFixed(4)),
    })),
  errors: [
    ["001", 409, .2121], ["110", 407, .2111], ["010", 298, .1546],
    ["011", 295, .153], ["101", 262, .1359], ["100", 257, .1333],
  ].map(([bitstring, errors, share_of_errors]) => ({ bitstring, errors, share_of_errors, average_noise: .088 })),
  experiments: [{
    experiment_id: SAMPLE_EXPERIMENT, circuit: "ghz_3", runs: 12, shots: 12288,
    success_rate: .8431, started_at: "2026-08-19 15:36:33", finished_at: "2026-08-19 16:31:33",
  }],
  degradation: [{ first_success_rate: 1, last_success_rate: .7129, degradation: .2871, first_noise: 0, last_noise: .12 }],
  entropy: [1, 1.18, 1.34, 1.49, 1.63, 1.78, 1.91, 2.06, 2.18, 2.29, 2.38, 2.45]
    .map((entropy, run_index) => ({ run_index, entropy })),
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const requestedPreset = url.searchParams.get("preset");
  const id: PresetId = isPresetId(requestedPreset) ? requestedPreset : "distribution";
  const definition = presetById(id);
  const settings = config();

  try {
    const requestedExperiment = url.searchParams.get("experiment") ?? "latest";
    const experimentId = requestedExperiment === "latest"
      ? (settings.sample ? SAMPLE_EXPERIMENT : await latestExperimentId())
      : requestedExperiment;
    if (definition.needsExperiment && !UUID_PATTERN.test(experimentId)) {
      return Response.json({ error: "Invalid experiment id." }, { status: 400 });
    }

    const sql = presetSql(id);
    if (settings.sample) {
      return Response.json({
        preset: definition,
        experimentId,
        source: "sample",
        sql,
        data: SAMPLE[id],
        rows: SAMPLE[id].length,
        elapsed: 0,
      });
    }

    const payload = await clickhouseQuery(
      sql,
      definition.needsExperiment ? { experiment_id: experimentId } : {},
    );
    return Response.json({
      preset: definition,
      experimentId,
      source: "clickhouse",
      sql,
      data: payload.data ?? [],
      rows: payload.rows ?? payload.data?.length ?? 0,
      elapsed: payload.statistics?.elapsed ?? 0,
      rowsRead: payload.statistics?.rows_read ?? null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Query failed.";
    return Response.json(
      { error: message.replace(/Basic\s+[A-Za-z0-9+/=]+/g, "Basic [redacted]") },
      { status: 502 },
    );
  }
}
