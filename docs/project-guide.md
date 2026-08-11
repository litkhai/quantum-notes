# Git 저장소 안내

[문서 사이트 홈](index.md) · [GitHub 저장소](https://github.com/litkhai/quantum-notes) · [기여 가이드](https://github.com/litkhai/quantum-notes/blob/main/CONTRIBUTING.md)

## 저장소의 목적

`litkhai/quantum-notes`는 양자컴퓨팅 강의와 학습·읽기 자료를 Markdown으로 관리하는 공개 Git 저장소다. 120분 비기너 코스는 입문 경로를 제공하고, 장문 본문과 심화 노트는 원리·하드웨어·보안·산업 주제를 지속해서 확장한다. 하나의 자료를 세 가지 방식으로 활용한다.

1. GitHub에서 Markdown 원문 열람
2. GitHub Pages에서 검색과 내비게이션을 갖춘 웹사이트 열람
3. 로컬 편집기에서 강의 준비·검토·수정

Git 커밋은 문서가 언제, 왜 바뀌었는지 기록한다. Pull Request와 Issue는 수정 제안, 근거 검토와 토론에 사용한다.

## 저장소와 문서 사이트의 관계

```text
docs/의 Markdown 원문
        ↓ push to main
GitHub Actions: MkDocs 빌드
        ↓
GitHub Pages 배포
        ↓
https://litkhai.github.io/quantum-notes/
```

`docs/`가 게시 문서의 원본이다. `main` 브랜치에 변경사항이 들어오면 [Pages 워크플로](https://github.com/litkhai/quantum-notes/actions/workflows/pages.yml)가 MkDocs로 HTML을 생성하고 GitHub Pages에 배포한다.

사이트에서 보이는 제목·표·수식·링크는 대응하는 Markdown 파일에서 관리한다. 생성된 HTML은 GitHub Actions가 관리하는 배포 산출물이다.

## 디렉터리 구조

```text
quantum-notes/
├── README.md                 # GitHub 저장소 첫 화면
├── CONTRIBUTING.md           # 작성·검토·Git 작업 규칙
├── mkdocs.yml                # 사이트 내비게이션과 테마 설정
├── requirements-docs.txt     # 문서 빌드 도구 버전
├── .github/workflows/
│   └── pages.yml             # GitHub Pages 자동 배포
├── docs-overrides/           # 사이트 템플릿 확장
└── docs/
    ├── index.md              # GitHub Pages 첫 화면
    ├── 01-beginner-lecture/  # 120분 입문 강의
    ├── 02-deep-dive/         # 원리·산업 심화 노트
    ├── 03-reference/         # FAQ·용어·출처
    ├── docs-assets/          # CSS·JavaScript·아이콘
    └── archive/              # 구조 개편 전 원문과 초안
```

### `README.md`와 `docs/index.md`

- 루트 `README.md`: 저장소의 목적, 주요 문서 링크, 복제와 빌드 방법
- `docs/index.md`: GitHub Pages 방문자를 위한 학습 경로와 빠른 탐색

두 파일은 독자의 진입 경로가 다르므로 각각 관리한다.

### 강의와 심화 자료

| 위치 | 역할 | 대표 문서 |
|---|---|---|
| `docs/01-beginner-lecture/` | 비전공자 대상 120분 세션 | 장문 강의 본문, 핸드아웃, 상세 진행표, 강사 가이드 |
| `docs/02-deep-dive/` | 수식·조건·예외·산업 근거 | 큐비트, 오류 정정, 보안, 주요 플레이어 |
| `docs/03-reference/` | 반복 참조 자료 | FAQ, 용어 사전, 공식 출처 |
| `docs/archive/` | 역사적 원문 보존 | 최초 초안과 구조 개편 전 문서 |

## 문서 수정 흐름

### 1. 저장소 복제

```bash
git clone https://github.com/litkhai/quantum-notes.git
cd quantum-notes
```

### 2. 작업 브랜치 생성

```bash
git switch -c docs/topic-name
```

브랜치 이름은 변경 목적을 나타내는 짧은 영문으로 작성한다.

### 3. 문서 수정

- 강의에서 직접 말할 내용: `docs/01-beginner-lecture/`
- 기술 조건과 상세 근거: `docs/02-deep-dive/`
- 용어·FAQ·출처: `docs/03-reference/`
- 사이트 메뉴와 표시 순서: `mkdocs.yml`
- 색상·간격·반응형 표시: `docs/docs-assets/stylesheets/extra.css`

시장 수치, 기업 성능과 로드맵에는 기준일과 1차 출처를 함께 기록한다.

### 4. 로컬 사이트 확인

```bash
python -m pip install -r requirements-docs.txt
mkdocs serve
```

기본 미리보기 주소는 `http://127.0.0.1:8000/quantum-notes/`다. 배포와 같은 엄격 검사를 실행할 때는 다음 명령을 사용한다.

```bash
mkdocs build --strict
```

### 5. 커밋과 Pull Request

```bash
git add docs mkdocs.yml README.md CONTRIBUTING.md
git commit -m "docs: describe the change"
git push -u origin docs/topic-name
```

Pull Request에는 변경 목적, 주요 근거, 기준일과 검증 명령을 적는다.

## 자동 배포 흐름

`main` 브랜치에 push가 발생하면 워크플로가 다음 순서로 실행된다.

1. 저장소 체크아웃
2. Python과 고정된 MkDocs 패키지 설치
3. `mkdocs build --strict` 실행
4. Pages 배포용 artifact 업로드
5. GitHub Pages 환경에 배포

배포 상태는 [Actions 페이지](https://github.com/litkhai/quantum-notes/actions)에서 확인한다. 성공한 실행에는 배포된 사이트 주소가 표시된다.

## 변경 이력과 버전 관리

Git 이력은 문서의 버전 기록으로 사용한다.

| 작업 | 확인 방법 |
|---|---|
| 최근 변경 | `git log --oneline -10` |
| 파일별 변경 | `git log --follow -- docs/경로/파일.md` |
| 두 버전 비교 | `git diff 이전커밋..현재커밋 -- 파일.md` |
| 특정 시점 내용 | `git show 커밋:docs/경로/파일.md` |
| 변경 작성자와 시점 | `git blame 파일.md` |

큰 구조 변경 전 원문은 `docs/archive/`에도 보존한다. Git 이력은 정확한 버전 복원에, 아카이브는 과거 자료의 맥락과 묶음을 살펴보는 데 사용한다.

## 문서 품질 기준

- 핵심 정의와 결론을 먼저 제시한다.
- 입문 강의와 심화 노트의 설명 수준을 구분한다.
- 과학적 결과, 기업 발표와 시장 전망을 별도 증거 수준으로 표시한다.
- 상대 링크와 수식 렌더링을 로컬 빌드에서 확인한다.
- 기업·시장 정보에는 기준일과 공식 출처를 기록한다.
- 기존 원문의 역사적 맥락은 `docs/archive/`에서 유지한다.

세부 작성 규칙은 [CONTRIBUTING.md](https://github.com/litkhai/quantum-notes/blob/main/CONTRIBUTING.md)를 따른다.

[문서 사이트 홈](index.md) · [GitHub 저장소](https://github.com/litkhai/quantum-notes) · [기여 가이드](https://github.com/litkhai/quantum-notes/blob/main/CONTRIBUTING.md)
