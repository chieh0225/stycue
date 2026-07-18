export type PointWalletResponse = {
  currentPoints: number;
  lifetimeEarnedPoints: number;
  lifetimeSpentPoints: number;
  updatedAt: string;
};

export type DailyPointClaimResponse = {
  isClaimed: boolean;
  claimDate: string;
  points: number;
  currentPoints: number;
  createdAt: string;
};

// Backend C# enum PointTransactionType, serialized as camelCase strings.
export type PointTransactionType =
  | 'registrationReward' // 註冊贈送
  | 'dailyReward' // 每日登入
  | 'commissionCreate' // 建立委託
  | 'commissionBoost' // 積分加碼
  | 'commissionBestCommentReward' // 最佳留言積分
  | 'commissionAutoReward' // 讚數最高留言積分
  | 'commissionRefund' // 退還積分
  | 'commissionFee' // 積分手續費
  | 'pointPurchase'; // 購買積分

// Backend C# enum PointReferenceType, serialized as camelCase strings.
export type PointReferenceType =
  | 'none'
  | 'commission'
  | 'comment'
  | 'dailyClaim'
  | 'registration'
  | 'pointPurchaseOrder';

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
