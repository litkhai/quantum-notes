# Quantum Shot Observatory

3큐비트 GHZ 회로의 반복 측정 결과와 노이즈 드리프트를 ClickHouse에서 직접
조회하며 이해하는 교육용 웹 UI다.

## 화면에서 설명하는 내용

- GHZ 회로가 `000`과 `111`을 기대하는 이유
- 단일 측정과 여러 shots의 차이
- 동일 회로를 시간별로 반복하는 관측성의 의미
- 동일 seed·동일 조건 반복의 한계
- ClickHouse가 측정 이후의 고전 데이터를 집계하는 역할

## Query presets

브라우저는 임의 SQL을 서버로 보내지 않는다. 다음 읽기 전용 preset 중 하나를
선택하며, 서버에 정의된 SQL만 ClickHouse에서 실행된다.

1. 실험 요약
2. 측정 분포
3. 노이즈 드리프트
4. 오류 상태
5. 실험 비교
6. 첫·마지막 구간 성능 저하
7. 측정 결과의 Shannon entropy

ClickHouse 접속 정보는 서버 환경변수로만 사용하며 브라우저 응답에 포함하지 않는다.

## Docker 실행

```bash
cp .env.example .env
```

기본 `.env.example`은 비밀번호 없이 실행되는 `sample` 모드다. ClickHouse Cloud의
실측 데이터를 조회하려면 `.env`에 접속 정보를 입력하고
`CLICKHOUSE_DEMO_MODE=live`로 바꾼다. `.env`는 Docker 이미지와 Git에 포함되지
않는다.

```bash
docker compose up --build
```

브라우저에서 `http://localhost:3000`을 연다. 종료할 때에는 다음을 실행한다.

```bash
docker compose down
```

## 로컬 개발

Node.js 22 이상이 필요하다.

```bash
npm install
npm run dev
```

ClickHouse 환경변수가 없으면 실제 Cloud 적재 결과를 바탕으로 한 sample mode로
동작한다. 실제 연결을 확인하려면 `.env`의 값을 현재 셸에 적용한 뒤 실행한다.

## 환경변수

| 이름 | 기본값 | 설명 |
|---|---|---|
| `CLICKHOUSE_HOST` | 없음 | ClickHouse Cloud hostname |
| `CLICKHOUSE_PORT` | `8443` | HTTPS 포트 |
| `CLICKHOUSE_SECURE` | `true` | TLS 사용 여부 |
| `CLICKHOUSE_USERNAME` | `default` | 접속 사용자 |
| `CLICKHOUSE_PASSWORD` | 없음 | 서버에서만 읽는 비밀번호 |
| `CLICKHOUSE_DATABASE` | `quantum` | 조회할 database |
| `CLICKHOUSE_TABLE` | `quantum_shots` | 조회할 table |
| `CLICKHOUSE_DEMO_MODE` | `sample` | `sample`이면 내장 데이터, `live`이면 Cloud 조회 |

## 검증

```bash
npm run build
npm test
```
