import type { SkinSlot } from '@/src/types/api/skin';

export const SLOT_ORDER: Record<SkinSlot, number> = {
  BASE: 0,
  NECK: 1,
  EYES: 2,
  HEAD: 3,
  ACCESSORY: 4,
};

export const SLOT_NAMES: Record<SkinSlot, string> = {
  BASE: 'Thân',
  HEAD: 'Mũ',
  NECK: 'Khăn',
  EYES: 'Kính',
  ACCESSORY: 'Phụ kiện',
};
