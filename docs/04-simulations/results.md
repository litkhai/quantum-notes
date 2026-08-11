# Qiskit Aer 자동 실행 결과

[시뮬레이션 안내](README.md) · [입문 강의 본문](../01-beginner-lecture/lecture-notes.md)

> 이 문서는 `python -m simulations.run`으로 생성한다. shots=4096, seed=42를 사용했다.

## 결과 요약

| 실험 | 측정 counts | 해석 |
|---|---|---|
| H-H 간섭 | `0`: 4096 | 두 H 게이트의 경로가 0 상태에서 보강돼 입력 상태로 돌아간다. |
| H-Z-H 위상 간섭 | `1`: 4096 | Z가 바꾼 상대위상을 마지막 H가 측정 가능한 1 상태로 변환한다. |
| Bell 상태 | `00`: 2022, `11`: 2074 | 각 비트는 무작위이며 두 비트를 함께 보면 00과 11의 상관관계가 나타난다. |
| Bell 상태와 잡음 | `00`: 1862, `01`: 147, `10`: 146, `11`: 1941 | 게이트·측정 잡음이 01과 10 결과를 만들며 이상적 상관관계를 낮춘다. |
| 2큐비트 Grover | `11`: 4096 | 한 번의 오라클과 확산 연산이 표시된 상태 11의 진폭을 보강한다. |

## Bell 상관관계와 잡음

- 이상적 Bell 회로의 동일 비트 확률: **100.000%**
- 교육용 잡음 모델의 동일 비트 확률: **92.847%**

잡음 모델은 한 큐비트 게이트 2%, 두 큐비트 게이트 5%의 depolarizing error와 비대칭 readout error를 사용한다. 실제 QPU의 잡음은 장비·큐비트·보정 시점에 따라 달라진다.

## 재현 명령

```bash
python -m pip install -r requirements-simulations.txt
python -m simulations.run
python -m unittest discover -s tests -v
```

기계 판독용 전체 결과는 [results.json](results.json)에서 확인한다.

[시뮬레이션 안내](README.md) · [입문 강의 본문](../01-beginner-lecture/lecture-notes.md)
