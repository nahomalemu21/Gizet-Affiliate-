import type { AffiliateOrder, AffiliateProduct, Creator, Payout } from "@/lib/types";

export const currentCreator: Creator = {
  id: "cr_hana",
  name: "Hana Bekele",
  handle: "@hanalifestyle",
  platform: "TikTok",
  followers: 12400,
  tier: "Growth",
  commissionRate: 8,
  deliveredOrders: 18,
  deliveryRate: 72,
  pendingEarnings: 3328,
  availableEarnings: 5824,
  status: "Active",
};

export const creators: Creator[] = [
  currentCreator,
  { id: "cr_sami", name: "Sami Tech", handle: "@samitech", platform: "TikTok", followers: 20800, tier: "Pro", commissionRate: 10, deliveredOrders: 44, deliveryRate: 78, pendingEarnings: 4900, availableEarnings: 12150, status: "Active" },
  { id: "cr_meron", name: "Meron Home", handle: "@meronhome", platform: "Instagram", followers: 8900, tier: "Starter", commissionRate: 7, deliveredOrders: 7, deliveryRate: 64, pendingEarnings: 1220, availableEarnings: 1680, status: "Active" },
  { id: "cr_nati", name: "Nati Reviews", handle: "@natireviews", platform: "TikTok", followers: 15100, tier: "Starter", commissionRate: 7, deliveredOrders: 0, deliveryRate: 0, pendingEarnings: 0, availableEarnings: 0, status: "Pending" },
  { id: "cr_liya", name: "Liya Finds", handle: "@liyafinds", platform: "TikTok", followers: 6700, tier: "Growth", commissionRate: 8, deliveredOrders: 15, deliveryRate: 69, pendingEarnings: 2660, availableEarnings: 3940, status: "Paused" },
];

export const products: AffiliateProduct[] = [
  { id: "p1", title: "Portable Smoothie Blender", slug: "portable-smoothie-blender", category: "Kitchen", price: 5490, commissionRate: 8, payout: 439, stock: 42, conversionRate: 4.8, image: "BL", featured: true },
  { id: "p2", title: "Smart LED Desk Lamp", slug: "smart-led-desk-lamp", category: "Home", price: 6290, commissionRate: 7, payout: 440, stock: 18, conversionRate: 3.9, image: "DL", featured: true },
  { id: "p3", title: "Wireless Mini Microphone", slug: "wireless-mini-microphone", category: "Tech", price: 7190, commissionRate: 10, payout: 719, stock: 31, conversionRate: 5.2, image: "MIC", featured: true },
  { id: "p4", title: "Car Phone Vacuum Mount", slug: "car-phone-vacuum-mount", category: "Auto", price: 3890, commissionRate: 7, payout: 272, stock: 66, conversionRate: 4.1, image: "CAR" },
  { id: "p5", title: "Electric Makeup Brush Cleaner", slug: "electric-makeup-brush-cleaner", category: "Beauty", price: 4890, commissionRate: 8, payout: 391, stock: 24, conversionRate: 4.5, image: "BE" },
  { id: "p6", title: "Digital Kitchen Scale", slug: "digital-kitchen-scale", category: "Kitchen", price: 3290, commissionRate: 7, payout: 230, stock: 53, conversionRate: 3.4, image: "KG" },
];

export const orders: AffiliateOrder[] = [
  { id: "GZ-10842", customer: "M. Tadesse", product: "Portable Smoothie Blender", amount: 5490, status: "Delivered", commission: 439, creator: "Hana Bekele", date: "Today, 10:24", source: "TikTok link" },
  { id: "GZ-10838", customer: "S. Alemu", product: "Wireless Mini Microphone", amount: 7190, status: "Out for delivery", commission: 575, creator: "Hana Bekele", date: "Today, 09:11", source: "Code HANA" },
  { id: "GZ-10811", customer: "R. Kassa", product: "Electric Makeup Brush Cleaner", amount: 4890, status: "Confirmed", commission: 391, creator: "Hana Bekele", date: "Yesterday", source: "TikTok link" },
  { id: "GZ-10792", customer: "B. Kebede", product: "Smart LED Desk Lamp", amount: 6290, status: "Rejected", commission: 0, creator: "Hana Bekele", date: "Yesterday", source: "Code HANA" },
  { id: "GZ-10745", customer: "H. Getachew", product: "Car Phone Vacuum Mount", amount: 3890, status: "Delivered", commission: 272, creator: "Hana Bekele", date: "Jul 14", source: "Instagram bio" },
  { id: "GZ-10709", customer: "Y. Abebe", product: "Portable Smoothie Blender", amount: 5490, status: "Delivered", commission: 439, creator: "Hana Bekele", date: "Jul 13", source: "TikTok link" },
];

export const payouts: Payout[] = [
  { id: "PO-204", creator: "Hana Bekele", amount: 5824, orders: 14, method: "Bank transfer", status: "Approved", date: "Jul 17" },
  { id: "PO-199", creator: "Sami Tech", amount: 12150, orders: 22, method: "Telebirr", status: "Pending", date: "Jul 17" },
  { id: "PO-186", creator: "Meron Home", amount: 1680, orders: 4, method: "Bank transfer", status: "Paid", date: "Jul 2" },
  { id: "PO-175", creator: "Hana Bekele", amount: 4280, orders: 11, method: "Bank transfer", status: "Paid", date: "Jun 30" },
];
