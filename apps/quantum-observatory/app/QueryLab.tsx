"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PRESETS, type PresetDefinition, type PresetId } from "../lib/presets";

type ResultRow = Record<string, string | number | null>;
type QueryResponse = {
  preset: PresetDefinition;
  experimentId: string;
  source: "sample" | "clickhouse";
  sql: string;
  data: ResultRow[];
  rows: number;
  elapsed: number;
  rowsRead?: number | null;
  error?: string;
};

const PERCENT_FIELDS = new Set([
  "probability", "success_rate", "error_rate", "share_of_errors",
  "first_success_rate", "last_success_rate", "degradation", "first_noise",
  "last_noise", "noise_level", "average_noise",
]);

function formatValue(key: string, value: string | number | null) {
  if (value === null) return "—";
  if (typeof value === "number") {
    if (PERCENT_FIELDS.has(key)) return `${(value * 100).toFixed(2)}%`;
    if (key === "entropy") return value.toFixed(3);
    return new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 4 }).format(value);
  }
  if (key === "experiment_id") return `${value.slice(0, 8)}…`;
  return value;
}

function numeric(row: ResultRow, key: string) {
  const value = row[key];
  return typeof value === "number" ? value : Number(value ?? 0);
}

function HorizontalBars({ data, preset }: { data: ResultRow[]; preset: PresetId }) {
  const valueKey = preset === "distribution" ? "probability" : "share_of_errors";
  const max = Math.max(...data.map((row) => numeric(row, valueKey)), .001);
  return (
    <div className="barChart" aria-label="결과별 비율 막대 그래프">
      {data.map((row) => {
        const expected = Number(row.expected ?? 0) === 1;
        const value = numeric(row, valueKey);
        return (
          <div className="barRow" key={String(row.bitstring)}>
            <code>{row.bitstring}</code>
            <div className="barTrack">
              <span className={expected ? "expectedBar" : "errorBar"} style={{ width: `${Math.max(2, value / max * 100)}%` }} />
            </div>
            <strong>{formatValue(valueKey, value)}</strong>
          </div>
        );
      })}
    </div>
  );
}

function ColumnChart({ data, preset }: { data: ResultRow[]; preset: PresetId }) {
  const valueKey = preset === "entropy" ? "entropy" : "success_rate";
  const max = preset === "entropy" ? 3 : 1;
  return (
    <div className="columnChart" aria-label="실행 구간별 변화 그래프">
      {data.map((row, index) => {
        const value = numeric(row, valueKey);
        return (
          <div className="columnItem" key={String(row.run_index ?? index)}>
            <strong>{preset === "entropy" ? value.toFixed(2) : `${Math.round(value * 100)}%`}</strong>
            <div className="columnTrack">
              <span style={{ height: `${Math.max(4, value / max * 100)}%` }} />
            </div>
            <small>{String(row.run_index ?? index).padStart(2, "0")}</small>
          </div>
        );
      })}
    </div>
  );
}

function SummaryCards({ data }: { data: ResultRow[] }) {
  const row = data[0] ?? {};
  const preferred = [
    "shots", "runs", "success_rate", "error_rate", "first_success_rate",
    "last_success_rate", "degradation", "first_noise", "last_noise", "entropy",
  ].filter((key) => key in row);
  return (
    <div className="resultCards">
      {preferred.map((key) => (
        <article key={key}>
          <span>{key.replaceAll("_", " ")}</span>
          <strong>{formatValue(key, row[key])}</strong>
        </article>
      ))}
    </div>
  );
}

function ResultTable({ data }: { data: ResultRow[] }) {
  const columns = useMemo(() => Object.keys(data[0] ?? {}), [data]);
  if (!columns.length) return <div className="emptyResult">조회된 행이 없습니다.</div>;
  return (
    <div className="tableWrap">
      <table>
        <thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => <td key={column}>{formatValue(column, row[column])}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function QueryLab() {
  const [selected, setSelected] = useState<PresetId>("distribution");
  const [result, setResult] = useState<QueryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const runQuery = useCallback(async (preset: PresetId) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/query?preset=${preset}&experiment=latest`, { cache: "no-store" });
      const payload = await response.json() as QueryResponse;
      if (!response.ok) throw new Error(payload.error || "쿼리를 실행하지 못했습니다.");
      setResult(payload);
    } catch (queryError) {
      setError(queryError instanceof Error ? queryError.message : "쿼리를 실행하지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void runQuery(selected); }, [runQuery, selected]);
  const definition = PRESETS.find((preset) => preset.id === selected) ?? PRESETS[0];

  return (
    <div className="queryLab" id="query-lab">
      <aside className="presetRail" aria-label="쿼리 preset 선택">
        {PRESETS.map((preset) => (
          <button
            type="button"
            key={preset.id}
            className={selected === preset.id ? "selected" : ""}
            onClick={() => setSelected(preset.id)}
          >
            <span>{preset.number}</span>
            <strong>{preset.label}</strong>
          </button>
        ))}
      </aside>

      <section className="resultPanel" aria-live="polite">
        <div className="resultHeader">
          <div>
            <span className="resultKicker">PRESET {definition.number}</span>
            <h3>{definition.question}</h3>
            <p>{definition.explanation}</p>
          </div>
          <button type="button" className="runButton" onClick={() => void runQuery(selected)} disabled={loading}>
            {loading ? "조회 중…" : "다시 실행"}
          </button>
        </div>

        <div className="notice"><span>관찰 포인트</span>{definition.notice}</div>

        {error && <div className="queryError"><strong>연결 오류</strong><span>{error}</span></div>}
        {!error && result && (
          <>
            <div className="liveMeta">
              <span className={result.source === "clickhouse" ? "liveDot" : "sampleDot"} />
              {result.source === "clickhouse" ? "CLICKHOUSE CLOUD 실측" : "샘플 데이터"}
              <code>{result.experimentId.slice(0, 8)}</code>
              <span>{result.rows} rows</span>
              <span>{(result.elapsed * 1000).toFixed(1)} ms</span>
            </div>

            <div className={loading ? "visualArea loading" : "visualArea"}>
              {(selected === "distribution" || selected === "errors") && <HorizontalBars data={result.data} preset={selected} />}
              {(selected === "drift" || selected === "entropy") && <ColumnChart data={result.data} preset={selected} />}
              {(selected === "summary" || selected === "degradation") && <SummaryCards data={result.data} />}
              {selected === "experiments" && <ResultTable data={result.data} />}
            </div>

            {selected !== "experiments" && (
              <details className="rawResults">
                <summary>원본 결과표 보기</summary>
                <ResultTable data={result.data} />
              </details>
            )}
            <details className="sqlPanel">
              <summary>실행한 SQL 보기</summary>
              <pre><code>{result.sql}</code></pre>
            </details>
          </>
        )}
      </section>
    </div>
  );
}
