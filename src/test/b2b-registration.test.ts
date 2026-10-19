import { describe, expect, it } from "vitest";
import { cuiSchema, lookupDemoCompany, maySubmitRegistration, registrationSchema } from "@/lib/b2b-registration";

const valid = { cui: "RO12345678", company: "Firma de test", registry: "J00/1/2026", address: "Adresa de test", county: "Timiș", city: "Timișoara", activity: "instalator", volume: "", vat: true, surname: "Test", firstName: "Ana", role: "", phone: "0720000000", email: "test@exemplu.ro", password: "Testare123", confirmPassword: "Testare123", terms: true, gdpr: true, newsletter: false };
describe("B2B registration rules", () => {
  it("normalizes RO CUI and rejects nonnumeric inputs", () => { expect(cuiSchema.parse(" RO12345678 ")).toBe("12345678"); expect(cuiSchema.safeParse("<script>").success).toBe(false); });
  it("blocks inactive companies", () => { expect(lookupDemoCompany("87654321")).toBe("inactive"); expect(maySubmitRegistration("inactive")).toBe(false); });
  it("allows manual completion when lookup is unavailable", () => { expect(lookupDemoCompany("11223344")).toBe("manual"); expect(maySubmitRegistration("manual")).toBe(true); });
  it("requires terms consent", () => { expect(registrationSchema.safeParse({ ...valid, terms: false }).success).toBe(false); });
  it("requires GDPR consent", () => { expect(registrationSchema.safeParse({ ...valid, gdpr: false }).success).toBe(false); });
  it("keeps newsletter, role and volume optional", () => { expect(registrationSchema.safeParse(valid).success).toBe(true); });
  it("requires matching passwords", () => { expect(registrationSchema.safeParse({ ...valid, confirmPassword: "AltaParola123" }).success).toBe(false); });
});