export type WalletResponse = {
  userId: number;
  rubyBalance: number;
};

export type ShopItem = {
  id: number;
  skinItemId: number;
  code: string;
  name: string;
  slot: string;
  priceRuby: number;
  imageUrl: string;
  itemBackgroundUrl?: string;
  thumbnailUrl?: string;
  thumbnailLayers?: string[];
  description: string;
  owned: boolean;
};

export type ShopItemThumbnail = {
  shopItemId: number;
  skinItemId: number;
  code: string;
  name: string;
  slot: string;
  itemBackgroundUrl: string;
  thumbnailUrl: string;
  thumbnailLayers: string[];
};

export type BuyShopItemResponse = {
  success: boolean;
  message: string;
  skinItemId: number;
  skinName: string;
  rubyDeducted: number;
  remainingRuby: number;
};

export type InitTopupRequest = {
  amountVnd: number;
  rubyAmount?: number;
  packageCode?: string;
};

export type InitTopupResponse = {
  transactionCode: string;
  amountVnd: number;
  rubyAmount: number;
  packageCode?: string;
  packageName?: string;
  description?: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  transferContent: string;
  qrCodeUrl: string;
  status: string;
};

export type TopupPackage = {
  code: string;
  name: string;
  rubyAmount: number;
  priceVnd: number;
  originalPriceVnd: number;
  discountVnd: number;
  bonusRuby: number;
  description: string;
  popular: boolean;
  bestValue: boolean;
};

export type TopupPackagesResponse = {
  baseRateVndPerRuby: number;
  minCustomTopupVnd: number;
  minCustomTopupRuby: number;
  customTopupRule: string;
  packages: TopupPackage[];
};

export type TopupHistoryItem = {
  id: number;
  transactionCode: string;
  amountVnd: number;
  rubyAmount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  completedAt: string | null;
};
