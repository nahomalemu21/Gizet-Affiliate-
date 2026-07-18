import { PageHeader } from "@/components/UI";
import { ProductLibrary } from "@/components/creator/ProductLibrary";
import { requireSession } from "@/lib/auth";
import { getCreator, listProductsForCreatorEditor } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function CreatorProducts() {
  const session = await requireSession("creator");
  if (!session.creatorId) throw new Error("Creator profile missing");

  const [creator, products] = await Promise.all([
    getCreator(session.creatorId),
    listProductsForCreatorEditor(session.creatorId),
  ]);
  if (!creator) throw new Error("Creator not found");

  const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "https://gizet-affiliate.vercel.app";

  return <div className="page-wrap">
    <PageHeader
      eyebrow="Your storefront catalog"
      title="Choose what appears in your store."
      subtitle="Add or remove products at any time. Only selected products appear on your public creator storefront."
    />
    <ProductLibrary products={products} creatorHandle={creator.handle} appUrl={appUrl} />
  </div>;
}
