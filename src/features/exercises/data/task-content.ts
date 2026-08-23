import type { ExerciseTask } from '@/src/features/exercises/types';

export const taskContent: Record<ExerciseTask['id'], ExerciseTask> = {
  task1: {
    id: 'task1',
    slug: 'avoid-food',
    title: 'Hướng dẫn nhiệm vụ',
    heroImage: require('@/assets/images/onboarding/meo_task1_1.jpg'),
    accentColor: '#34A853',
    buttonColor: '#2E7D32',
    nextRoute: '/task1/page2',
    steps: [
      {
        title: 'Xem món cần tránh',
        description: 'Kiểm tra danh sách thực phẩm bạn nên tránh trong hôm nay.',
      },
      {
        title: 'Đánh dấu đã tránh',
        description: 'Tick vào những món bạn đã tránh được để theo dõi tiến độ mỗi ngày.',
      },
      {
        title: 'Check-in bữa ăn',
        description: 'Chụp ảnh bữa ăn để ghi nhận thói quen ăn uống lành mạnh.',
      },
    ],
  },
  task2: {
    id: 'task2',
    slug: 'fruit-veg',
    title: 'Hướng dẫn nhiệm vụ',
    heroImage: require('@/assets/images/onboarding/meo_task2_1.png'),
    accentColor: '#34A853',
    buttonColor: '#2E7D32',
    nextRoute: '/task2/page2',
    steps: [
      {
        title: 'Ăn đủ rau quả',
        description: 'Cố gắng hoàn thành 5 khẩu phần rau củ quả trong hôm nay.',
      },
      {
        title: 'Cập nhật khẩu phần',
        description: 'Ghi lại số khẩu phần rau củ quả bạn đã ăn trong ngày.',
      },
      {
        title: 'Check-in bữa rau',
        description: 'Chụp một bữa ăn có rau củ quả để lưu lại tiến độ.',
      },
    ],
  },
  task3: {
    id: 'task3',
    slug: 'workout',
    title: 'Hướng dẫn nhiệm vụ',
    heroImage: require('@/assets/images/onboarding/meo_task3_1.png'),
    accentColor: '#16A34A',
    buttonColor: '#15803D',
    nextRoute: '/task3/page2',
    steps: [
      {
        title: 'Chọn bài tập',
        description: 'Chọn hoạt động phù hợp với bạn hôm nay như đi bộ, chạy hoặc gym.',
      },
      {
        title: 'Tập 30 phút',
        description: 'Bắt đầu vận động và duy trì ít nhất 30 phút để hoàn thành thử thách.',
      },
      {
        title: 'Check-in sau tập',
        description: 'Chụp ảnh sau khi tập để ghi nhận nỗ lực của bạn hôm nay.',
      },
    ],
  },
  task4: {
    id: 'task4',
    slug: 'bedtime-routine',
    title: 'Hướng dẫn nhiệm vụ',
    heroImage: require('@/assets/images/onboarding/meo_task4_1.png'),
    accentColor: '#16A34A',
    buttonColor: '#2D7F56',
    nextRoute: '/task4/page2',
    steps: [
      {
        title: 'Đặt giờ ngủ',
        description: 'Chọn thời gian bạn muốn đi ngủ hôm nay.',
      },
      {
        title: 'Vệ sinh trước khi ngủ',
        description: 'Thực hiện vệ sinh cá nhân trước khi ngủ.',
      },
      {
        title: 'Tắt thiết bị',
        description: 'Tắt màn hình để cơ thể sẵn sàng nghỉ ngơi.',
      },
    ],
  },
  task5: {
    id: 'task5',
    slug: 'sleep-time',
    title: 'Hướng dẫn nhiệm vụ',
    heroImage: require('@/assets/images/onboarding/meo_task5_1.png'),
    accentColor: '#34A853',
    buttonColor: '#2E7D32',
    nextRoute: '/task5/page2',
    steps: [
      {
        title: 'Chọn khung giờ ngủ',
        description: 'Đặt thời điểm bạn muốn đi ngủ để duy trì nhịp sinh học.',
      },
      {
        title: 'Chốt mục tiêu',
        description: 'Xác nhận giờ ngủ và cam kết thực hiện mỗi tối.',
      },
      {
        title: 'Theo dõi tiến độ',
        description: 'Theo dõi giờ ngủ để cải thiện chất lượng giấc ngủ theo thời gian.',
      },
    ],
  },
};

export const taskOrder: ExerciseTask['id'][] = ['task1', 'task2', 'task3', 'task4', 'task5'];
