# Quantum Notes

양자컴퓨팅의 이론적 원리부터 하드웨어, 산업 생태계와 시장 전망까지 한글로 정리하는 문서 저장소다.

- GitHub: [litkhai/quantum-notes](https://github.com/litkhai/quantum-notes)
- 기본 브랜치: `main`
- 문서 기준일: 2026-08-11
- 대상: 일반인·비전공자·기술 및 산업 관계자
- 성격: Markdown 기반 강의·학습 노트

> 양자컴퓨터는 특정 문제의 구조를 확률진폭·위상·간섭·얽힘으로 처리하는 특수 가속기다.

## 두 개의 학습 경로

### 1. 비전공자를 위한 2시간 세션 강의

**이론 설명과 산업·시장 이해를 위한 120분 세션**이다.

- 전반부: 큐비트, 중첩, 위상, 간섭, 얽힘과 알고리즘의 한계
- 후반부: 하드웨어 방식, 오류 정정, 산업 가치사슬, 수익 모델과 시장 성숙도
- 선수지식: 없음
- 수식: 개념을 설명하는 최소 수준

**여기서 시작:** [01-beginner-lecture](docs/01-beginner-lecture/README.md)

주요 문서:

- [수강생 핸드아웃](docs/01-beginner-lecture/session-handout.md)
- [강사용 가이드](docs/01-beginner-lecture/instructor-guide.md)
- [120분 진행표](docs/01-beginner-lecture/runsheet.md)
- [슬라이드 구성안](docs/01-beginner-lecture/slide-outline.md)
- [산업·시장 브리프](docs/01-beginner-lecture/industry-market-brief.md)

### 2. 상세한 원리를 위한 심화 과정

입문 강의의 설명을 수식, 알고리즘의 조건과 예외, 물리 구현과 산업 근거까지 확장한다.

1. [양자이론의 출발](docs/02-deep-dive/01-quantum-origins.md)
2. [큐비트·게이트·측정](docs/02-deep-dive/02-qubits-gates-measurement.md)
3. [위상·간섭과 Grover 탐색](docs/02-deep-dive/03-interference-and-grover.md)
4. [텐서곱과 얽힘](docs/02-deep-dive/04-entanglement.md)
5. [물리적 구현과 오류 정정](docs/02-deep-dive/05-hardware-and-error-correction.md)
6. [클라우드·산업·양자 우위](docs/02-deep-dive/06-cloud-industry-and-advantage.md)
7. [Shor·PQC·양자 난수](docs/02-deep-dive/07-security-and-randomness.md)
8. [주요 플레이어 전략](docs/02-deep-dive/08-major-players.md)

**심화 과정 안내:** [02-deep-dive](docs/02-deep-dive/README.md)

## 저장소 구조

```text
quantum-notes/
├── README.md
├── CONTRIBUTING.md
├── mkdocs.yml
├── requirements-docs.txt
└── docs/
    ├── index.md
    ├── 01-beginner-lecture/
    ├── 02-deep-dive/
    ├── 03-reference/
    ├── docs-assets/
    └── archive/
```

구조, 수정 흐름과 GitHub Pages 자동 배포는 [Git 저장소 안내](docs/project-guide.md)에 정리했다.

## 공통 참고자료

- [FAQ](docs/03-reference/faq.md): 강의에서 나올 수 있는 심화 질문
- [용어 사전](docs/03-reference/glossary.md): 주요 개념의 짧은 정의
- [참고자료](docs/03-reference/references.md): 논문·공식 문서·산업 출처
- [원문 보관소](docs/archive/README.md): 구조 개편 전 자료와 초안

## 저장소 사용 방법

GitHub에서 Markdown 문서를 직접 읽어도 된다. 로컬에서 편집하려면 다음과 같이 복제한다.

```bash
git clone https://github.com/litkhai/quantum-notes.git
cd quantum-notes
```

문서는 GitHub에서 직접 읽거나 GitHub Pages 사이트에서 검색·탐색할 수 있다. GitHub에서는 Markdown 원문을 바로 제공한다.

- 문서 사이트: [Quantum Notes GitHub Pages](https://litkhai.github.io/quantum-notes/)
- 저장소: [litkhai/quantum-notes](https://github.com/litkhai/quantum-notes)

사이트를 로컬에서 미리 보려면 Python 3 환경에서 다음을 실행한다.

```bash
python -m pip install -r requirements-docs.txt
mkdocs serve
```

강의를 준비할 때는 다음 순서를 권장한다.

```text
docs/01-beginner-lecture/README.md
  → instructor-guide.md
  → runsheet.md
  → slide-outline.md
  → industry-market-brief.md의 최신 수치 확인
```

## 문서 작성 원칙

- 본문은 한글로 작성하고 중요한 영문 용어를 첫 등장에 병기한다.
- 초보 과정은 직관과 판단 기준을 중심으로 하고, 증명과 예외는 심화 과정에 둔다.
- 이론적 가속, 실험적 양자 우위, 제품 유용성과 경제적 가치를 구분한다.
- 기업 발표와 로드맵은 동료평가 논문과 다른 증거 수준으로 표시한다.
- 시장 수치에는 조사기관, 기준연도, 시장 범위와 전망 여부를 함께 쓴다.
- 시점에 민감한 내용에는 기준일과 1차 출처를 붙인다.
- 기존 원문은 `docs/archive/`에 보존한다.

## 업데이트 정책

다음 정보는 강의 일주일 전에 다시 확인한다.

- 공개적으로 접근 가능한 QPU와 클라우드 가격
- 주요 하드웨어 기업의 실제 제공 시스템과 로드맵
- 오류 정정·양자 우위 관련 최신 동료평가 결과
- QED-C 등에서 발표하는 산업 매출·시장 전망
- NIST의 PQC 표준과 전환 지침

문서 수정과 기여 방법은 [CONTRIBUTING.md](CONTRIBUTING.md)를 따른다.

## 범위와 주의사항

- 이 저장소는 교육·학습 자료다. 투자 판단에는 별도의 조사와 검증이 필요하다.
- 기업 사례는 산업 구조를 이해하기 위한 예시다.
- 시장 전망은 불확실하며 출처의 가정과 정의에 따라 달라진다.
- 양자컴퓨팅, 양자통신·보안과 양자센싱 시장은 별도 범주로 구분한다.
