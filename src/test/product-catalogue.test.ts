import { describe, expect, it } from "vitest";
import { getProduct, getProductVariants, getRelatedProducts } from "@/lib/product-catalogue";

describe("Product detail catalogue", () => {
  it("resolves both homepage and category products", () => {
    expect(getProduct("AE-1001")?.price).toBe(349);
    expect(getProduct("AE-P001")?.categorySlug).toBe("tevi-si-fitinguri");
    expect(getProduct("missing")).toBeUndefined();
  });
  it("keeps diameter alternatives in the same product family", () => {
    const product = getProduct("AE-P001");
    if (!product) throw new Error("Missing fixture");
    expect(getProductVariants(product).map(item => item.id)).toEqual(["AE-P001", "AE-P007", "AE-P013", "AE-P019", "AE-P025", "AE-P031"]);
    expect(getRelatedProducts(product).some(item => item.id === product.id)).toBe(false);
  });
});