# Qiskit Aer 시뮬레이션

[홈](../index.md) · [자동 실행 결과](results.md) · [입문 강의 본문](../01-beginner-lecture/lecture-notes.md)

이 영역은 강의의 핵심 회로를 코드로 재현하고 설명과 결과가 일치하는지 자동 검증한다. 비기너 코스는 이론과 산업 설명을 중심으로 진행하며, 시뮬레이션은 강의 후 확인과 심화 학습에 사용한다.

## 포함된 실험

| 실험 | 확인하는 개념 | 기대 결과 |
|---|---|---|
| `H-H` | 중첩 뒤의 보강·상쇄 | `0` 100% |
| `H-Z-H` | 상대위상이 출력에 주는 영향 | `1` 100% |
| Bell 상태 | 얽힌 두 큐비트의 상관관계 | `00`, `11`만 측정 |
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
