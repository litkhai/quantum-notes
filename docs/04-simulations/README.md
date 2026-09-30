# Qiskit Aer 시뮬레이션

[홈](../index.md) · [자동 실행 결과](results.md) · [입문 강의 본문](../01-beginner-lecture/lecture-notes.md)

이 영역은 강의의 핵심 회로를 코드로 재현하고 설명과 결과가 일치하는지 자동 검증한다. 비기너 코스는 이론과 산업 설명을 중심으로 진행하며, 시뮬레이션은 강의 후 확인과 심화 학습에 사용한다.

## 포함된 실험

| 실험 | 확인하는 개념 | 기대 결과 |
|---|---|---|
| `H-H` | 중첩 뒤의 보강·상쇄 | `0` 100% |
| `H-Z-H` | 상대위상이 출력에 주는 영향 | `1` 100% |
| Bell 상태 | 얽힌 두 큐비트의 상관관계 | `00`, `11`만 측정 |
| GHZ 상태 | 여러 큐비트로 확장한 상관관계 | 모든 비트가 `0` 또는 `1` |
| 잡음 Bell 상태 | 게이트·측정 오류의 영향 | `01`, `10` 출현 |
| 2큐비트 Grover | 오라클과 확산의 진폭 증폭 | 표시 상태 `11` 100% |

회로 정의는 [`simulations/circuits.py`](https://github.com/litkhai/quantum-notes/blob/main/simulations/circuits.py), 실행과 보고서 생성은 [`simulations/run.py`](https://github.com/litkhai/quantum-notes/blob/main/simulations/run.py)에서 관리한다.

## 로컬 실행

Python 3.12 환경을 권장한다.

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements-simulations.txt
python -m simulations.run
```

실행 결과는 다음 두 파일에 기록된다.

- [`results.md`](results.md): 사람이 읽는 결과와 해석
- [`results.json`](results.json): 후속 분석과 시각화용 구조화 데이터

shots와 seed를 바꿀 수 있다.

```bash
python -m simulations.run --shots 8192 --seed 7
```

## ClickHouse와 연결하는 양자 실험 관측성 데모

`simulations.clickhouse_demo`는 3큐비트 GHZ 회로를 여러 차례 실행하면서
게이트·측정 잡음이 점차 커지는 상황을 만든다. Qiskit Aer가 반환한 개별 shot을
고전적인 이벤트 행으로 변환한다.

```text
양자회로 → 측정 bitstring → JSONEachRow → ClickHouse → 확률·오류율·드리프트
```

ClickHouse 없이도 데이터 생성까지 실행할 수 있다.

```bash
python -m simulations.clickhouse_demo
```

기본 실행은 12개 시간 구간에서 각각 1,024 shots를 수행해 총 12,288행을
`artifacts/quantum-clickhouse/quantum_shots.jsonl`에 기록한다. `noise_level`이
0%에서 12%까지 증가하므로 시간에 따른 성공률 저하를 확인할 수 있다.

로컬 ClickHouse까지 포함한 전체 데모는 다음과 같이 실행한다.

```bash
docker run -d --name quantum-clickhouse-demo \
  -p 18123:8123 -p 19000:9000 \
  -e CLICKHOUSE_USER=demo \
  -e CLICKHOUSE_PASSWORD=demo_password \
  -e CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT=1 \
  clickhouse/clickhouse-server

CLICKHOUSE_PORT=18123 \
CLICKHOUSE_USERNAME=demo \
CLICKHOUSE_PASSWORD=demo_password \
  python -m simulations.clickhouse_demo --load-clickhouse

docker exec -i quantum-clickhouse-demo \
  clickhouse-client --user demo --password demo_password \
  --multiquery < sql/quantum-clickhouse.sql
```

위의 `demo_password`는 로컬 일회성 데모용 값이다. 공유 또는 운영 환경에서는
별도의 비밀 관리 방식으로 바꾼다.

ClickHouse Cloud를 사용할 때에는 접속 정보를 환경변수로 전달한다.

```bash
export CLICKHOUSE_HOST='<cloud-host>'
export CLICKHOUSE_PORT='8443'
export CLICKHOUSE_SECURE='true'
export CLICKHOUSE_USERNAME='default'
export CLICKHOUSE_PASSWORD='<password>'
python -m simulations.clickhouse_demo --load-clickhouse
```

비밀번호를 환경변수나 셸 기록에 남기지 않으려면 대화형 입력을 사용한다. 지정한
데이터베이스가 없을 때에는 함께 생성할 수 있다.

```bash
python -m simulations.clickhouse_demo \
  --load-clickhouse \
  --database quantum \
  --create-database \
  --password-prompt
```

저장소의 실행 래퍼를 사용하면 호스트만 지정하면 된다. 비밀번호는 화면에 표시되지
않는 대화형 프롬프트에서 입력한다.

```bash
export CLICKHOUSE_HOST='<cloud-host>'
./scripts/run-quantum-clickhouse-cloud.sh
```

반복 실행할 때 다른 시뮬레이션 표본을 만들려면 seed를 변경한다.

```bash
./scripts/run-quantum-clickhouse-cloud.sh --seed 20260820
```

분석 예제는 [`sql/quantum-clickhouse.sql`](../../sql/quantum-clickhouse.sql)에
정리되어 있다.

- bitstring별 측정 확률
- 시간과 noise level에 따른 성공률
- 가장 자주 나타난 오류 상태
- 실험별 shots·실행 구간·성공률
- 최초와 마지막 실행 구간의 성능 저하

이 데모에서 ClickHouse는 큐비트나 파동함수를 저장하지 않는다. 측정이 끝난 뒤
생성된 고전 데이터를 저장하고 집계한다. 실제 QPU를 연결할 때에도 이벤트 형식을
유지한 채 `backend`, calibration, gate error 등의 열을 추가할 수 있다.

기본 결과 파일은 `shots=4096`, `seed=42`로 유지한다. 다른 옵션은 별도 출력 디렉터리에 저장하면 기준 결과를 보존할 수 있다.

```bash
python -m simulations.run \
  --shots 8192 \
  --seed 7 \
  --output-dir .cache/simulation-run
```

## 자동 테스트

```bash
python -m unittest discover -s tests -v
```

테스트는 다음 조건을 확인한다.

1. `H-H`가 `0`으로 돌아오는가?
2. `H-Z-H`가 `1`을 만드는가?
3. 이상적 Bell 회로가 같은 비트만 출력하는가?
4. Grover 회로가 `11`을 보강하는가?
5. 교육용 잡음 모델에서 Bell 상관확률이 감소하는가?
6. GHZ 회로가 기대한 상관 상태만 만드는가?
7. 잡음 드리프트가 개별 shot 이벤트로 변환되는가?

GitHub Actions는 코드·의존성·결과 문서가 바뀔 때 테스트를 실행하고 보고서를 다시 생성한다. 생성 후 Git diff가 생기면 저장된 결과와 현재 코드가 서로 다른 상태로 판정한다.

## 시뮬레이터 결과의 범위

statevector 시뮬레이터의 메모리는 큐비트 수에 따라 `2ⁿ`으로 증가한다. density matrix 방식은 대략 `4ⁿ` 규모의 상태를 다룬다. 작은 회로의 원리 검증에는 유용하며 큰 회로의 실용 성능을 직접 나타내는 지표로 사용하지 않는다.

현재 잡음 실험은 개념 설명을 위한 고정 모델이다. 실제 QPU와 비교할 때에는 해당 장비의 게이트 집합, 연결성, 오류 분포와 보정 시점이 반영된 모델을 별도로 사용한다.

## 코드와 강의의 연결

- 간섭 설명: [입문 강의 본문 4장](../01-beginner-lecture/lecture-notes.md#4)
- 얽힘 설명: [입문 강의 본문 5장](../01-beginner-lecture/lecture-notes.md#5)
- Grover 설명: [입문 강의 본문 6장](../01-beginner-lecture/lecture-notes.md#6)
- 잡음과 오류 정정: [입문 강의 본문 8장](../01-beginner-lecture/lecture-notes.md#8)

[홈](../index.md) · [자동 실행 결과](results.md) · [입문 강의 본문](../01-beginner-lecture/lecture-notes.md)
