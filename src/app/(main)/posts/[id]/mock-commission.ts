// Shared mock for the commission's 本次委託發佈積分 (publish points) chosen by the
// commissioner. Swap for the value on GET /api/v1/commissions/{commissionId}.
// Kept in one place so the post detail page and the comments page stay in sync:
// it is the minimum give-points amount shown in the give-points modal.
export const MOCK_PUBLISH_POINTS = 50;
