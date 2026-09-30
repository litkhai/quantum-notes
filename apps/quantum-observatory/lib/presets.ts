export type PresetId =
  | "summary"
  | "distribution"
  | "drift"
  | "errors"
  | "experiments"
  | "degradation"
  | "entropy";

export type PresetDefinition = {
  id: PresetId;
  number: string;
  label: string;
  question: string;
  explanation: string;
  notice: string;
  needsExperiment: boolean;
};

export const PRESETS: PresetDefinition[] = [
  {
    id: "summary",
    number: "01",
    label: "실험 요약",
    question: "이번 실험은 얼마나 많이 측정했고, 얼마나 성공했나?",
    explanation:
      "shots, 실행 구간, 시작·종료 시각과 전체 성공률을 한 행으로 압축합니다.",
    notice: "성공은 GHZ의 기대 상태인 000 또는 111이 나온 경우입니다.",
    needsExperiment: true,
  },
  {
    id: "distribution",
    number: "02",
    label: "측정 분포",
    question: "000과 111은 실제로 얼마나 자주 나왔나?",
    explanation:
      "모든 bitstring을 GROUP BY 하여 관측 횟수와 경험적 확률을 계산합니다.",
    notice: "노이즈가 없다면 막대는 000과 111 두 개만 보여야 합니다.",
    needsExperiment: true,
  },
  {
    id: "drift",
    number: "03",
    label: "노이즈 드리프트",
    question: "노이즈가 높아질수록 상관관계는 어떻게 무너졌나?",
    explanation:
      "각 실행 구간의 noise level과 성공률을 시간순으로 집계합니다.",
    notice: "현재 실습은 0%에서 12%까지 인위적으로 노이즈를 높입니다.",
    needsExperiment: true,
  },
  {
    id: "errors",
    number: "04",
    label: "오류 상태",
    question: "어떤 잘못된 bitstring이 가장 자주 등장했나?",
    explanation:
      "기대 상태를 제외하고 오류 결과의 빈도와 평균 노이즈를 비교합니다.",
    notice: "특정 상태가 유독 많으면 대칭적이지 않은 오류를 의심할 수 있습니다.",
    needsExperiment: true,
  },
  {
    id: "experiments",
    number: "05",
    label: "실험 비교",
    question: "seed나 실행 시각이 다른 실험은 서로 얼마나 달랐나?",
    explanation:
      "experiment_id 단위로 shots, runs, 성공률과 기간을 비교합니다.",
    notice: "동일 seed와 동일 노이즈라면 반복 결과가 사실상 재현될 수 있습니다.",
    needsExperiment: false,
  },
  {
    id: "degradation",
    number: "06",
    label: "성능 저하",
    question: "첫 구간과 마지막 구간 사이에 얼마나 나빠졌나?",
    explanation:
      "argMin과 argMax로 첫·마지막 window의 성공률을 선택해 차이를 계산합니다.",
    notice: "한 숫자로 요약하기 좋지만 중간의 급격한 변동은 감출 수 있습니다.",
    needsExperiment: true,
  },
  {
    id: "entropy",
    number: "07",
    label: "결과 엔트로피",
    question: "측정 결과는 시간에 따라 얼마나 무질서해졌나?",
    explanation:
      "각 구간의 bitstring 확률로 Shannon entropy를 계산합니다.",
    notice: "3큐비트 결과가 8개 상태에 균등해질수록 엔트로피는 3에 가까워집니다.",
    needsExperiment: true,
  },
];

export function isPresetId(value: string | null): value is PresetId {
  return PRESETS.some((preset) => preset.id === value);
}

export function presetById(id: PresetId): PresetDefinition {
  return PRESETS.find((preset) => preset.id === id) ?? PRESETS[0];
}
