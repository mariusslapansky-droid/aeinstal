import { z } from "zod";

export const normalizeCui = (value: string) => value.trim().replace(/^RO\s*/i, "");
export const cuiSchema = z.string().transform(normalizeCui).pipe(z.string().regex(/^\d{2,10}$/, "Introdu un CUI valid, cu 2–10 cifre, opțional precedat de RO."));
export type CuiState = "empty" | "loading" | "found" | "invalid" | "inactive" | "manual";
export const demoCuis = { found: "12345678", inactive: "87654321", manual: "11223344" };
export function lookupDemoCompany(value: string): Exclude<CuiState, "empty" | "loading"> {
  const result = cuiSchema.safeParse(value);
  if (!result.success) return "invalid";
  if (result.data === demoCuis.inactive) return "inactive";
  if (result.data === demoCuis.found) return "found";
  return "manual";
}
const requiredText = z.string().trim().min(1, "Completează acest câmp.").max(150, "Maximum 150 de caractere.");
export const registrationSchema = z.object({
  cui: cuiSchema, company: requiredText, registry: requiredText,
  address: z.string().trim().min(1, "Completează adresa sediului.").max(250), county: requiredText, city: requiredText,
  activity: z.enum(["instalator", "firma", "constructor", "revanzator", "mentenanta", "altele"], { errorMap: () => ({ message: "Selectează tipul de activitate." }) }),
  volume: z.string().max(40), vat: z.boolean(), surname: requiredText, firstName: requiredText,
  role: z.string().trim().max(100), phone: z.string().trim().regex(/^\+?[\d\s()-]{9,20}$/, "Introdu un număr de telefon valid."),
  email: z.string().trim().email("Introdu o adresă de email validă.").max(255),
  password: z.string().min(8, "Minimum 8 caractere.").max(128).regex(/[a-z]/, "Adaugă o literă mică.").regex(/[A-Z]/, "Adaugă o literă mare.").regex(/\d/, "Adaugă o cifră."),
  confirmPassword: z.string().max(128),
  terms: z.boolean().refine(Boolean, "Acceptarea termenilor este obligatorie."),
  gdpr: z.boolean().refine(Boolean, "Acordul GDPR este obligatoriu."), newsletter: z.boolean(),
}).refine(data => data.password === data.confirmPassword, { message: "Parolele nu coincid.", path: ["confirmPassword"] });
export type RegistrationValues = z.infer<typeof registrationSchema>;
export const initialRegistration: RegistrationValues = { cui: "", company: "", registry: "", address: "", county: "", city: "", activity: "altele", volume: "", vat: false, surname: "", firstName: "", role: "", phone: "", email: "", password: "", confirmPassword: "", terms: false, gdpr: false, newsletter: false };
export function maySubmitRegistration(state: CuiState) { return state === "found" || state === "manual"; }
export function passwordStrength(value: string) { return [value.length >= 8, /[a-z]/.test(value), /[A-Z]/.test(value), /\d/.test(value)].filter(Boolean).length; }
export const isDemoExistingEmail = (value: string) => value.trim().toLowerCase() === "demo@exemplu.ro";