import { describe, expect, it } from "vitest";
import { emptyQuickRows, findQuickProduct, parseQuickText, partitionQuickRows, searchQuickProducts, validateQuickRow } from "@/lib/quick-order";

const row = (code: string, quantity: number, allowBackorder = false) => ({ key: "test", code, quantity, allowBackorder });
describe("Quick order specification", () => {
  it("starts with five empty rows", () => {
    expect(emptyQuickRows()).toHaveLength(5);
    expect(emptyQuickRows().every(item => item.code === "")).toBe(true);
  });
  it("searches both code and name across both catalogues", () => {
    expect(searchQuickProducts("ae-p001")[0]?.id).toBe("AE-P001");
    expect(searchQuickProducts("pompa")[0]?.id).toBe("AE-1001");
    expect(findQuickProduct(" AE-1003 ")?.price).toBe(4.59);
  });
  it("parses pasted Excel codes and quantities per line", () => {
    expect(parseQuickText("cod\tcantitate\nAE-1001\t2\nAE-1002\t4").map(({ code, quantity }) => ({ code, quantity }))).toEqual([{ code: "AE-1001", quantity: 2 }, { code: "AE-1002", quantity: 4 }]);
  });
  it("keeps invalid quantity input invalid rather than defaulting it", () => {
    const parsed = parseQuickText("AE-1001;abc");
    expect(validateQuickRow(parsed[0]).kind).toBe("quantity");
  });
  it("warns when illustrative stock of four is exceeded, and supports order anyway", () => {
    expect(validateQuickRow(row("AE-1002", 5)).kind).toBe("stock");
    expect(validateQuickRow(row("AE-1002", 4)).kind).toBe("valid");
    expect(validateQuickRow(row("AE-1002", 5, true)).kind).toBe("valid");
  });
  it("requires the illustrative fittings minimum and pack of ten", () => {
    expect(validateQuickRow(row("AE-P001", 1)).kind).toBe("pack");
    expect(validateQuickRow(row("AE-P001", 15)).kind).toBe("pack");
    expect(validateQuickRow(row("AE-P001", 10)).kind).toBe("valid");
  });
  it("partitions partial additions and retains problem rows", () => {
    const result = partitionQuickRows([row("AE-1001", 2), row("UNKNOWN", 1), row("AE-1002", 8), row("", 1)]);
    expect(result.valid.map(item => item.code)).toEqual(["AE-1001"]);
    expect(result.problems.map(item => item.code)).toEqual(["UNKNOWN", "AE-1002"]);
  });
});