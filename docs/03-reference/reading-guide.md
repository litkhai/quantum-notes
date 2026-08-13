# 추천 읽기 경로

[홈](../index.md) · [참고자료 전체 목록](references.md) · [FAQ](faq.md) · [용어 사전](glossary.md)

양자컴퓨팅 자료는 물리학, 계산이론, 하드웨어 공학, 산업 분석이 한 목록에 섞이기 쉽다. 이 문서는 학습 목적과 난이도에 따라 읽을 순서를 정리한다. 논문 제목을 모두 이해하는 것보다 각 자료가 답하는 질문을 먼저 확인하는 방식으로 사용한다.

## 먼저 읽을 10개 자료

| 순서 | 자료 | 읽을 때 확인할 질문 | 난이도 |
|---|---|---|---|
| 1 | [IBM Quantum Learning: Quantum computing fundamentals](https://quantum.cloud.ibm.com/learning/en/courses/quantum-business-foundations/quantum-computing-fundamentals) | 고전컴퓨터와 양자컴퓨터의 역할은 어떻게 구분되는가? | 입문 |
| 2 | [Google Quantum AI: What is quantum computing?](https://quantumai.google/static/site-assets/downloads/what-is-quantum-computing.pdf) | 큐비트, 간섭, 오류 정정이 하나의 시스템에서 어떻게 연결되는가? | 입문 |
| 3 | [John Preskill: Quantum Computation lecture notes](https://www.preskill.caltech.edu/ph219/) | 양자정보의 수학적 언어는 어떤 순서로 쌓이는가? | 중급 |
| 4 | [Michael Nielsen: Quantum Computing for the Very Curious](https://quantum.country/qcvc) | 간단한 회로를 반복해서 계산하면 진폭과 위상이 어떻게 보이는가? | 입문·중급 |
| 5 | [Scott Aaronson: Quantum Computing Since Democritus 강의 자료](https://www.scottaaronson.com/democritus/) | 양자 계산의 가능성과 계산복잡도상의 한계는 무엇인가? | 중급 |
| 6 | [John Preskill: Quantum Computing in the NISQ era and beyond](https://doi.org/10.22331/q-2018-08-06-79) | 현재 장비의 잡음과 장기적인 오류내성 계산을 어떻게 구분하는가? | 중급 |
| 7 | [Fowler et al.: Surface codes](https://doi.org/10.1103/PhysRevA.86.032324) | 물리 큐비트와 논리 큐비트 사이에 어떤 자원 비용이 생기는가? | 심화 |
| 8 | [Google Quantum AI: Below-threshold surface-code experiment](https://www.nature.com/articles/s41586-024-08449-y) | 코드 거리를 늘렸을 때 논리 오류가 감소했다는 말은 무엇을 뜻하는가? | 심화 |
| 9 | [QED-C: State of the Global Quantum Industry 2026](https://quantumconsortium.org/publication/2026-state-of-the-global-quantum-industry-report/) | 시장 규모, 투자, 인력과 기업 수는 어떤 방법으로 집계되는가? | 산업 |
| 10 | [NIST: Post-Quantum Cryptography](https://csrc.nist.gov/Projects/Post-Quantum-Cryptography) | 양자컴퓨터의 완성 시점과 무관하게 지금 진행되는 보안 전환은 무엇인가? | 정책·보안 |

## 경로 A: 120분 강의를 들은 뒤

강의의 핵심 문장을 다른 설명 방식으로 다시 확인하는 경로다. 수식보다 개념과 전체 구조를 우선한다.

1. [Quantum Computing for the Very Curious](https://quantum.country/qcvc)에서 큐비트와 게이트 부분을 읽는다.
2. [IBM Basics of quantum information](https://quantum.cloud.ibm.com/learning/en/courses/basics-of-quantum-information)에서 단일·다중 시스템의 표기법을 확인한다.
3. [Quirk](https://algassert.com/quirk)에서 `H-H`, `H-Z-H`, Bell 회로를 직접 구성한다.
4. 이 저장소의 [Qiskit Aer 결과](../04-simulations/results.md)와 측정 분포를 비교한다.
5. [NIST의 PQC 소개](https://www.nist.gov/cybersecurity-and-privacy/what-post-quantum-cryptography)로 보안 전환의 현재 상태를 읽는다.

이 경로를 마치면 다음 질문에 답할 수 있어야 한다.

- 중첩과 측정은 어떻게 다른가?
- 위상은 왜 바로 측정되지 않으며 간섭을 통해 어떻게 드러나는가?
- 얽힘은 두 개의 독립된 확률분포와 무엇이 다른가?
- 물리 큐비트 수가 제품 성능을 단독으로 설명하지 못하는 이유는 무엇인가?
- PQC와 QKD는 어떤 문제를 서로 다른 방식으로 다루는가?

## 경로 B: 수식과 알고리즘

### 1단계: 선형대수와 회로

- [IBM: Basics of quantum information](https://quantum.cloud.ibm.com/learning/en/courses/basics-of-quantum-information): 상태벡터, 측정, 텐서곱과 회로를 순서대로 다룬다.
- [John Watrous: The Theory of Quantum Information](https://cs.uwaterloo.ca/~watrous/TQI/): 밀도행렬, 채널, 얽힘과 정보이론을 엄밀하게 전개한다.
- [John Preskill 강의 노트](https://www.preskill.caltech.edu/ph219/): 물리와 정보이론을 함께 연결할 때 사용한다.

### 2단계: 대표 알고리즘

- [Deutsch, 1985](https://doi.org/10.1098/rspa.1985.0070): 보편적 양자 계산 모델의 초기 형태를 확인한다.
- [Shor, 1994](https://doi.org/10.1109/SFCS.1994.365700): 주기 찾기가 소인수분해와 이산로그에 연결되는 구조를 읽는다.
- [Grover, 1996](https://doi.org/10.1145/237814.237866): 진폭 증폭이 탐색 횟수를 어떻게 줄이는지 확인한다.
- [Brassard et al.: Quantum amplitude amplification and estimation](https://arxiv.org/abs/quant-ph/0005055): Grover 탐색을 더 일반적인 틀로 확장한다.
- [Montanaro: Quantum algorithms—an overview](https://doi.org/10.1038/npjqi.2015.23): 알고리즘 계열과 알려진 가속을 지도처럼 훑는다.
- [Quantum Algorithm Zoo](https://quantumalgorithmzoo.org/): 문제 유형별 알고리즘과 논문을 찾아가는 색인으로 사용한다.

### 3단계: NISQ와 변분 알고리즘

- [Preskill: NISQ era](https://doi.org/10.22331/q-2018-08-06-79): NISQ라는 문제 설정의 원문이다.
- [Peruzzo et al.: VQE](https://doi.org/10.1038/ncomms5213): 변분 양자 고유값 해법의 초기 실험을 다룬다.
- [Farhi et al.: QAOA](https://arxiv.org/abs/1411.4028): 조합 최적화를 위한 변분 회로의 기본 제안이다.
- [Cerezo et al.: Variational quantum algorithms](https://doi.org/10.1038/s42254-021-00348-9): 학습 지형, barren plateau와 측정 비용을 포함한 리뷰다.
- [Bharti et al.: Noisy intermediate-scale quantum algorithms](https://doi.org/10.1103/RevModPhys.94.015004): NISQ 알고리즘을 분야별로 정리한 장문 리뷰다.

## 경로 C: 하드웨어와 오류 정정

하드웨어 자료를 읽을 때에는 큐비트 수와 함께 게이트 충실도, 연결성, 측정, 제어, 냉각, 모듈 간 연결과 논리 오류율을 확인한다.

### 하드웨어 방식별 리뷰

| 방식 | 시작 자료 | 중점 질문 |
|---|---|---|
| 초전도 | [Kjaergaard et al.: Superconducting qubits](https://doi.org/10.1146/annurev-conmatphys-031119-050605) | 빠른 게이트와 배선·누화·극저온 제어 사이의 교환관계는 무엇인가? |
| 포획 이온 | [Bruzewicz et al.: Trapped-ion quantum computing](https://doi.org/10.1063/1.5088164) | 높은 충실도와 긴 결맞음 시간에 비해 게이트 속도와 확장은 어떻게 다른가? |
| 중성 원자 | [Saffman: Quantum computing with atomic qubits](https://doi.org/10.1093/nsr/nww078) | 광학 트랩, 원자 재배열과 Rydberg 상호작용은 어떤 구조를 만드는가? |
| 광자 | [Slussarenko and Pryde: Photonic quantum information processing](https://doi.org/10.1063/1.5115814) | 광자의 이동성과 손실, 결정적 상호작용의 어려움은 어떻게 연결되는가? |
| 반도체 스핀 | [Burkard et al.: Semiconductor spin qubits](https://doi.org/10.1103/RevModPhys.95.025003) | 반도체 제조 기반과 균일도·제어 배선 문제를 어떻게 평가하는가? |
| 양자 어닐링 | [Albash and Lidar: Adiabatic quantum computation](https://doi.org/10.1103/RevModPhys.90.015002) | 게이트 모델과 문제 표현·성능 비교 기준이 어떻게 다른가? |

### 오류 정정의 읽기 순서

1. [Shor, 1995](https://doi.org/10.1103/PhysRevA.52.R2493): 중복 복사 없이 양자 오류를 교정하는 최초 구조를 본다.
2. [Steane, 1996](https://doi.org/10.1103/PhysRevLett.77.793): 고전 오류정정 코드와 양자 코드의 연결을 확인한다.
3. [Dennis et al., 2002](https://doi.org/10.1063/1.1499754): 위상학적 메모리와 임계값의 의미를 읽는다.
4. [Fowler et al., 2012](https://doi.org/10.1103/PhysRevA.86.032324): surface code의 동작과 자원 비용을 정리한다.
5. [Google Quantum AI, 2024/2025](https://www.nature.com/articles/s41586-024-08449-y): 실제 장비에서 코드 거리와 논리 오류의 관계를 본다.

## 경로 D: 산업·시장과 기업 전략

시장 자료는 기술 논문의 성능 주장과 분리해서 읽는다. 총시장 전망보다 현재 매출, 고객 유형, 공급망, 장비 접근 방식과 조사 방법을 먼저 확인한다.

### 산업 구조

- [QED-C: State of the Global Quantum Industry 2026](https://quantumconsortium.org/publication/2026-state-of-the-global-quantum-industry-report/): 기업·투자·인력·지식재산을 동일한 프레임으로 추적한다.
- [QED-C: Quantum Computing Market Forecast 2026](https://quantumconsortium.org/publication/2026-market-forecast-quantum-computing/): 매출 범위와 전망 가정을 확인한다.
- [EPO/OECD: Mapping the global quantum ecosystem](https://www.oecd.org/en/publications/mapping-the-global-quantum-ecosystem_010c37da-en.html): 특허, 기업, 투자와 국제 생태계를 정책 관점에서 비교한다.
- [QED-C: Assessing the Workforce Needs of the Quantum Industry](https://quantumconsortium.org/publication/assessing-the-needs-of-the-quantum-industry/): 물리학자 외에 필요한 공학·소프트웨어·사업 직무를 살펴본다.

### 기업 자료를 읽는 방법

1. 회사의 기술 페이지에서 큐비트 방식과 시스템 경계를 확인한다.
2. 로드맵에서 목표 연도, 성능 단위와 의존 조건을 기록한다.
3. 논문에서 실험 규모, 오류 막대와 비교 대상을 확인한다.
4. 클라우드 문서에서 실제 접근 가능 여부와 가격을 확인한다.
5. 재무자료에서 연구 계약, 클라우드 사용료, 장비 판매와 예약 매출을 구분한다.

[주요 플레이어 전략](../02-deep-dive/08-major-players.md)에는 IBM, Google, Microsoft, AWS, NVIDIA, IonQ, Quantinuum, Rigetti, D-Wave, QuEra, Atom Computing, Pasqal, PsiQuantum, Xanadu와 Intel의 역할을 같은 기준으로 정리했다.

## 경로 E: 보안과 정책

- [Shor 알고리즘 원문](https://doi.org/10.1109/SFCS.1994.365700): RSA와 ECC에 영향을 주는 계산 구조를 확인한다.
- [Gidney and Ekerå: RSA-2048 resource estimate](https://doi.org/10.22331/q-2021-04-15-433): 암호 해독에 필요한 논리·물리 자원과 시간 가정이 어떻게 계산되는지 본다.
- [NIST PQC 프로젝트](https://csrc.nist.gov/Projects/Post-Quantum-Cryptography): 표준과 추가 알고리즘 선정 상태를 확인한다.
- [NIST NCCoE PQC Migration](https://www.nccoe.nist.gov/applied-cryptography/migration-to-pqc): 암호 자산 발견, 상호운용성과 이전 절차를 읽는다.
- [NIST PQC Migration FAQ](https://pages.nist.gov/nccoe-migration-post-quantum-cryptography/): 조직이 준비 단계에서 묻는 질문을 주제별로 확인한다.
- [국가법령정보센터: 양자과학기술 및 양자산업 육성에 관한 법률](https://law.go.kr/LSW/lsInfoP.do?lsiSeq=255777): 국내 정책에서 양자과학기술·지원기술·산업을 어떻게 정의하는지 확인한다.

## 경로 F: 직접 실행하고 검증하기

- [Qiskit 문서](https://quantum.cloud.ibm.com/docs): 회로, transpilation, primitives와 실행 모델의 기준 문서다.
- [Qiskit Aer 시뮬레이션 가이드](https://quantum.cloud.ibm.com/docs/en/guides/simulate-with-qiskit-aer): 이상적 회로와 잡음 모델을 로컬에서 비교한다.
- [Cirq 기본 안내](https://quantumai.google/cirq/start/intro): Google의 회로·게이트·moment 추상화를 비교한다.
- [Amazon Braket Developer Guide](https://docs.aws.amazon.com/braket/latest/developerguide/braket-using.html): 서로 다른 공급자의 장비를 API로 실행하는 구조를 확인한다.
- [Microsoft Quantum Resource Estimator](https://learn.microsoft.com/azure/quantum/how-to-submit-re-jobs): 논리 연산을 물리 큐비트와 실행 시간으로 변환하는 가정을 실험한다.
- [OpenQASM 3 specification](https://openqasm.com/): 회로와 고전 제어를 표현하는 개방형 중간 언어를 확인한다.

이 저장소의 [Qiskit Aer 시뮬레이션](../04-simulations/README.md)은 설치부터 결과 생성과 자동 테스트까지 하나의 재현 가능한 예제로 제공한다.

## 논문과 기업 발표를 메모하는 틀

새 자료를 읽을 때 다음 항목을 함께 기록하면 서로 다른 주장을 비교하기 쉽다.

```text
자료 제목 / 발표일:
출처 유형: 동료평가 논문 | preprint | 공식 문서 | 기업 발표 | 시장 보고서
무엇을 측정했는가:
비교 기준은 무엇인가:
핵심 수치와 단위:
실험된 결과와 향후 목표:
숨은 비용: 입력 | 오류 정정 | 반복 측정 | 고전 전후처리 | 냉각·제어
후속 검증 자료:
강의에서 사용할 문장:
```

[홈](../index.md) · [참고자료 전체 목록](references.md) · [FAQ](faq.md) · [용어 사전](glossary.md)
