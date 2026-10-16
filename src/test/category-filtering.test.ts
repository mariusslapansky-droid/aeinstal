import { describe, expect, it } from "vitest";
import { emptyFilters, filterCategoryProducts, pageSizes, pipeProducts } from "@/lib/category-catalogue";

describe("Category catalogue rules", () => {
  it("offers the specified 24, 48 and 96 products per page", () => {
    expect(pageSizes).toEqual([24,48,96]);
  });
  it("filters technical material and diameter together", () => {
    const result = filterCategoryProducts(pipeProducts,{ ...emptyFilters, material:["PPR"],diameter:["25 mm"] },"relevance");
    expect(result.map(item => item.id)).toEqual(["AE-P007","AE-P008","AE-P012","AE-P031","AE-P032"]);
  });
  it("only returns available products when in-stock is selected", () => {
    const result = filterCategoryProducts(pipeProducts,{ ...emptyFilters,inStock:true },"relevance");
    expect(result).toHaveLength(28);
    expect(result.some(item => item.id === "AE-P007")).toBe(false);
  });
  it("sorts concrete prices from low to high", () => {
    const result = filterCategoryProducts(pipeProducts,{ ...emptyFilters,material:["Alamă"] },"price-up");
    expect(result.map(item => item.price)).toEqual([8.5,9.75,11,12.25,13.5]);
  });
});