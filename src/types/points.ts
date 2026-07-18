export type PointWalletResponse = {
  currentPoints: number;
  lifetimeEarnedPoints: number;
  lifetimeSpentPoints: number;
  updatedAt: string;
};

export type PointProductResponse = {
  id: number;
  name: string;
  priceTwd: number;
  basePoints: number;
  bonusPoints: number;
  points: number;
};

// 實測回傳字串（並非 openapi/v1.json 標記的 integer），已確認 "pending"／"paid"；
// 其餘失敗/取消態的字串值待跟後端確認
export type PointPurchaseStatus = string;

export type CreatePointPurchaseRequest = {
  pointProductId: number;
};

export type EcpayCheckoutFormResponse = {
  paymentActionUrl: string;
  paymentFormFields: Record<string, string>;
};

export type CreatePointPurchaseResponse = {
  orderId: number;
  merchantTradeNo: string;
  status: PointPurchaseStatus;
  checkout: EcpayCheckoutFormResponse;
};

export type PointPurchaseResponse = {
  orderId: number;
  merchantTradeNo: string;
  productName: string;
  amountTwd: number;
  points: number;
  status: PointPurchaseStatus;
  providerTradeNo: string | null;
  paidAt: string | null;
  createdAt: string;
};

export type DailyPointClaimResponse = {
  isClaimed: boolean;
  claimDate: string;
  points: number;
  currentPoints: number;
  createdAt: string;
};

// 註冊贈送=1; 每日登入=2; 建立委託=3; 積分加碼=4; 最佳留言積分=5; 讚數最高留言積分=6; 退還積分=7; 積分手續費=8
export type PointTransactionType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

// 委託=1; 留言=2; 每日登入=3; 註冊=4; 其他=0
export type PointReferenceType = 0 | 1 | 2 | 3 | 4;

export type PointTransactionResponse = {
  id: number;
  amount: number;
  transactionType: PointTransactionType;
  referenceType: PointReferenceType;
  referenceId: number | null;
  description: string;
  createdAt: string;
};

export type PagedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type PointTransactionQuery = {
  transactionType?: PointTransactionType;
  referenceType?: PointReferenceType;
  referenceId?: number;
  startAt?: string;
  endAt?: string;
  page?: number;
  pageSize?: number;
};
