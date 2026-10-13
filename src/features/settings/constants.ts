import type { MenuItem } from './types/settings';

export const MENU_ITEMS: MenuItem[] = [
  { label: 'Quyền riêng tư', icon: 'lock-closed-outline', path: null },
  { label: 'Tài khoản', icon: 'person-outline', path: null },
  { label: 'Thành viên', icon: 'trophy-outline', path: '/membership' },
  { label: 'Thống kê', icon: 'bar-chart-outline', path: null },
  { label: 'Đăng xuất', icon: 'log-out-outline', path: null },
];
