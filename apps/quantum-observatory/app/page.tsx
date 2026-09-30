import QueryLab from "./QueryLab";

const metrics = [
  { label: "측정 shots", value: "12,288", detail: "12 runs × 1,024" },
  { label: "전체 성공률", value: "84.31%", detail: "000 또는 111" },
  { label: "첫 구간", value: "100%", detail: "noise 0%" },
  { label: "마지막 구간", value: "71.29%", detail: "noise 12%" },
];

export default function Home() {
  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Quantum Shot Observatory 홈">
          <span className="brandMark" aria-hidden="true">Q</span>
          <span>QUANTUM SHOT OBSERVATORY</span>
        </a>
        <div className="status"><span />CLICKHOUSE CLOUD · LIVE</div>
      </header>

      <section className="hero" id="top">
        <div className="heroContent">
          <div className="eyebrow">GHZ NOISE DRIFT LAB / EXPERIMENT 7C9B</div>
          <h1>한 번의 측정은 우연이지만,<br /><em>반복하면 변화가 보입니다.</em></h1>
          <p className="heroCopy">
            3개의 큐비트를 얽힌 뒤 12,288번 측정했습니다. 정상이라면 결과는
            <strong> 000 또는 111</strong>뿐입니다. 이제 노이즈가 높아질수록
            상관관계가 무너지는 순간을 데이터로 관찰합니다.
          </p>
          <a className="heroCta" href="#query-lab">실측 데이터 탐색 <span>↘</span></a>
        </div>

        <div className="circuitCard" aria-label="3큐비트 GHZ 회로">
          <div className="circuitHeader">
            <span>GHZ / 3 QUBITS</span>
            <span>EXPECTED → 000 · 111</span>
          </div>
          <div className="circuit">
            {[0, 1, 2].map((q) => (
              <div className="wire" key={q}>
                <span className="qLabel">q{q}</span>
                <span className={q === 0 ? "gate active" : "gate ghost"}>{q === 0 ? "H" : "·"}</span>
                <span className={q < 2 ? "gate link" : "gate ghost"}>{q < 2 ? "●" : "·"}</span>
                <span className={q > 0 ? "gate target" : "gate ghost"}>{q > 0 ? "⊕" : "·"}</span>
                <span className="measure">M</span>
              </div>
            ))}
          </div>
          <div className="circuitNote">
            <span>01 중첩</span><b>→</b><span>02 얽힘</span><b>→</b><span>03 측정</span><b>→</b><span>04 집계</span>
          </div>
        </div>
      </section>

      <section className="metricGrid" aria-label="현재 실험 핵심 지표">
        {metrics.map((metric) => (
          <article className="metric" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.detail}</small>
          </article>
        ))}
      </section>

      <section className="storySection">
        <div>
          <div className="sectionLabel">WHY THIS LAB?</div>
          <h2>반복은 두 가지 의미를 가집니다.</h2>
        </div>
        <div className="storyGrid">
          <article>
            <span className="storyNumber">A</span>
            <h3>Shot 반복은 필수</h3>
            <p>양자회로 한 번의 측정은 답이 아니라 표본입니다. 수천 번 반복해야 확률 분포를 추정할 수 있습니다.</p>
          </article>
          <article>
            <span className="storyNumber">B</span>
            <h3>시간 반복은 관측</h3>
            <p>동일한 기준 회로를 시간별로 실행하면 노이즈와 보정 상태의 변화를 데이터베이스에서 비교할 수 있습니다.</p>
          </article>
          <article className="warningStory">
            <span className="storyNumber">!</span>
            <h3>똑같은 재실행은 무의미</h3>
            <p>같은 seed와 같은 노이즈를 그대로 반복하면 새 정보가 없습니다. 조건이나 실제 하드웨어 상태가 달라져야 합니다.</p>
          </article>
        </div>
      </section>

      <section className="querySection">
        <div className="queryIntro">
          <div>
            <div className="sectionLabel">LIVE QUERY PRESETS</div>
            <h2>숫자에 질문을<br />던져보세요.</h2>
          </div>
          <div className="queryIntroCopy">
            <p>미리 준비된 안전한 읽기 전용 쿼리로 실측 데이터의 의미를 한 단계씩 살펴봅니다.</p>
            <a className="queryJump" href="#query-lab">첫 프리셋부터 살펴보기 <span>↓</span></a>
          </div>
        </div>
        <QueryLab />
      </section>

      <footer>
        <span>QISKIT AER → JSONEACHROW → CLICKHOUSE</span>
        <span>EDUCATIONAL OBSERVABILITY LAB</span>
      </footer>
    </main>
  );
}
