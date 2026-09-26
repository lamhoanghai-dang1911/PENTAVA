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
  description: string;
  owned: boolean;
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
};

export type InitTopupResponse = {
  transactionCode: string;
  amountVnd: number;
  rubyAmount: number;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  transferContent: string;
  qrCodeUrl: string;
  status: string;
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
