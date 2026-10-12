export const SLEEP_QUESTION = {
  title: 'Trong 4 tuần qua, giấc ngủ trung bình\nmỗi đêm của bạn đã thay đổi thế nào?',
  options: [
    'Dưới 5 tiếng',
    '5–6 tiếng',
    'Ngủ không đều / chập chờn',
    '7–8 tiếng (Ổn định, ngủ ngon)',
  ],
};

export const EXERCISE_QUESTION = {
  title: 'Tần suất bạn vận động / tập thể dục\ntrong tuần gần đây nhất?',
  options: [
    'Gần như không',
    '1–2 lần/tuần',
    '3–4 lần/tuần',
    'Gần như mỗi ngày',
  ],
};

export const STRESS_QUESTION = {
  title: 'Gần đây, bạn cảm thấy căng thẳng\nhoặc quá tải với tần suất thế nào?',
  options: [
    'Gần như mỗi ngày',
    'Vài lần/tuần',
    'Thỉnh thoảng',
    'Hiếm khi / Tâm trạng rất tích cực',
  ],
};

export const DISCIPLINE_QUESTION = {
  title: 'Bạn cảm thấy khả năng duy trì các\nthói quen tốt của mình hiện tại ra sao?',
  options: [
    'Vẫn hay bỏ cuộc sau vài ngày',
    'Duy trì được 1–2 tuần rồi ngắt quãng',
    'Đã có phản xạ tự giác mỗi ngày',
    'Thói quen đã trở thành một phần cuộc sống',
  ],
};

export type DynamicGoalConfig = {
  question: string;
  options: [string, string, string, string];
};

export const DYNAMIC_GOAL_QUESTIONS: Record<string, DynamicGoalConfig> = {
  'Bớt stress': {
    question: 'Bạn thấy tâm trạng của mình khi đối mặt với áp lực hiện tại thế nào?',
    options: [
      'Vẫn rất căng thẳng',
      'Đã bình tĩnh hơn một chút',
      'Kiểm soát cảm xúc tốt hơn',
      'Thư thái và tích cực rõ rệt',
    ],
  },
  'Ngủ Tốt Hơn': {
    question: 'Chất lượng giấc ngủ và cảm giác thức dậy buổi sáng của bạn?',
    options: [
      'Vẫn mệt mỏi',
      'Thỉnh thoảng ngủ ngon',
      'Dễ vào giấc hơn',
      'Tỉnh táo, tràn đầy năng lượng',
    ],
  },
  'Kỷ luật hơn': {
    question: 'Bạn đánh giá mức độ cam kết với kế hoạch của mình thế nào?',
    options: [
      'Thường trì hoãn',
      'Đã bớt lười hơn',
      'Hoàn thành phần lớn kế hoạch',
      'Rất kỷ luật và đúng giờ',
    ],
  },
  'Có năng lượng hơn': {
    question: 'Năng lượng hoạt động trong ngày của bạn ra sao?',
    options: [
      'Hay uể oải',
      'Năng lượng ổn định buổi sáng',
      'Sung sức cả ngày',
      'Rất tích cực và năng động',
    ],
  },
  'Cải thiện sức khỏe': {
    question: 'Cơ thể bạn cảm thấy thế nào sau 4 tuần qua?',
    options: [
      'Chưa thấy khác biệt',
      'Nhẹ nhõm hơn đôi chút',
      'Dẻo dai và khỏe khoắn hơn',
      'Thể lực cải thiện vượt trội',
    ],
  },
  'Tập trung học tốt hơn': {
    question: 'Khả năng tập trung làm việc/học tập của bạn hiện tại?',
    options: [
      'Dễ xao nhãng',
      'Tập trung được từng khoảng ngắn',
      'Tập trung sâu tốt hơn',
      'Hoàn thành việc nhanh và hiệu quả',
    ],
  },
};

export function getDynamicGoalConfig(goalName?: string): DynamicGoalConfig {
  if (goalName && DYNAMIC_GOAL_QUESTIONS[goalName]) {
    return DYNAMIC_GOAL_QUESTIONS[goalName];
  }
  return {
    question: `Bạn đánh giá mức độ tiến bộ của mình với mục tiêu "${goalName || 'này'}" thế nào?`,
    options: [
      'Chưa thấy nhiều thay đổi',
      'Đã bắt đầu có sự chuyển biến',
      'Hoàn thành tốt phần lớn kế hoạch',
      'Cải thiện vượt bậc và đạt kết quả rất tốt',
    ],
  };
}

export const NEW_GOAL_OPTIONS = [
  'Bớt stress',
  'Ngủ Tốt Hơn',
  'Có năng lượng hơn',
  'Kỷ luật hơn',
  'Cải thiện sức khỏe',
  'Tập trung học tốt hơn',
] as const;

export function getPerceptionMilestone(percent: number) {
  if (percent <= 25) {
    return {
      emoji: '🐢',
      label: 'Khởi động chậm, cần thêm thời gian',
      color: '#EA580C',
      bgColor: '#FFF7ED',
      borderColor: '#FDBA74',
    };
  }
  if (percent <= 50) {
    return {
      emoji: '🌱',
      label: 'Đang bắt nhịp, có cải thiện nhỏ',
      color: '#B45309',
      bgColor: '#FEF3C7',
      borderColor: '#FCD34D',
    };
  }
  if (percent <= 75) {
    return {
      emoji: '🚀',
      label: 'Tiến bộ rõ rệt, thấy tự tin hơn',
      color: '#1D4ED8',
      bgColor: '#EFF6FF',
      borderColor: '#93C5FD',
    };
  }
  return {
    emoji: '🌟',
    label: 'Chuyển hóa vượt mong đợi!',
    color: '#15803D',
    bgColor: '#F0FDF4',
    borderColor: '#86EFAC',
  };
}
