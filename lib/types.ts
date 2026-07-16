export type OrderStatus = "Pending" | "Confirmed" | "Out for delivery" | "Delivered" | "Rejected" | "Cancelled" | "Returned";

export type CreatorTier = "Starter" | "Growth" | "Pro";

export type Creator = {
  id: string;
  name: string;
  handle: string;
  platform: string;
  followers: number;
  tier: CreatorTier;
  commissionRate: number;
  deliveredOrders: number;
  deliveryRate: number;
  pendingEarnings: number;
  availableEarnings: number;
  status: "Active" | "Pending" | "Paused";
};

export type AffiliateProduct = {
  id: string;
  title: string;
  slug: string;
  category: string;
  price: number;
  commissionRate: number;
  payout: number;
  stock: number;
  conversionRate: number;
  image: string;
  featured?: boolean;
};

export type AffiliateOrder = {
  id: string;
  customer: string;
  product: string;
  amount: number;
  status: OrderStatus;
  commission: number;
  creator: string;
  date: string;
  source: string;
};

export type Payout = {
  id: string;
  creator: string;
  amount: number;
  orders: number;
  method: string;
  status: "Pending" | "Approved" | "Paid";
  date: string;
};
