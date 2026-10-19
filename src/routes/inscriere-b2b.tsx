import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ArrowRight, Building2, Check, CheckCircle2, ChevronRight, Clock3, Eye, EyeOff, Headset, Loader2, LockKeyhole, Search, ShieldCheck, UserRound, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CategoryHeader } from "@/components/category-header";
import { PendingApprovalBanner, useB2BApproval } from "@/components/b2b-registration-context";
import { demoCuis, initialRegistration, isDemoExistingEmail, lookupDemoCompany, maySubmitRegistration, passwordStrength, registrationSchema, type CuiState, type RegistrationValues } from "@/lib/b2b-registration";

export const Route = createFileRoute("/inscriere-b2b")({
  head: () => ({ meta: [{ title: "Înscriere partener B2B · aeinstal" }, { name: "description", content: "Solicită un cont de firmă aeinstal. Datele firmei, persoana de contact și condițiile pentru parteneri, într-un singur formular." }, { property: "og:title", content: "Înscriere partener B2B · aeinstal" }, { property: "og:description", content: "Devino partener aeinstal și solicită condiții dedicate firmei tale." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: RegistrationPage,
});

function RegistrationPage() {
  const [values, setValues] = useState<RegistrationValues>(initialRegistration);
  const [cuiState, setCuiState] = useState<CuiState>("empty");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [existing, setExisting] = useState(false);
  const [dialog, setDialog] = useState<string | null>(null);
  const lookupVersion = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);
  const { markPending } = useB2BApproval();
  const enabled = maySubmitRegistration(cuiState);
  const strength = passwordStrength(values.password);
  function update<K extends keyof RegistrationValues>(key: K, value: RegistrationValues[K]) {
    setValues(current => ({ ...current, [key]: value }));
    setErrors(current => ({ ...current, [key]: "" }));
    if (key === "email") setExisting(false);
    if (key === "cui") { lookupVersion.current += 1; setCuiState("empty"); }
  }
  async function lookup(value = values.cui) {
    const version = ++lookupVersion.current;
    setCuiState("loading");
    await new Promise(resolve => setTimeout(resolve, 800));
    if (version !== lookupVersion.current) return;
    const state = lookupDemoCompany(value);
    setCuiState(state);
    if (state === "found") setValues(current => ({ ...current, cui: value, company: "Firma Exemplu Instalații SRL", registry: "J00/123/2020", address: "Strada Exemplu, nr. 10", county: "Timiș", city: "Timișoara", vat: true }));
  }
  function field(key: keyof RegistrationValues, label: string, options: { optional?: boolean; type?: string; placeholder?: string; company?: boolean; full?: boolean } = {}) {
    const error = errors[key];
    return <div className={`registration-field${options.full ? " full" : ""}`} key={key}><label htmlFor={`b2b-${key}`}>{label}{options.optional ? <small>opțional</small> : <span aria-hidden="true">*</span>}</label><input id={`b2b-${key}`} name={key} type={options.type ?? "text"} value={String(values[key])} placeholder={options.placeholder} disabled={options.company && !enabled} maxLength={key === "email" ? 255 : key === "address" ? 250 : 150} autoComplete={key === "email" ? "email" : key === "phone" ? "tel" : key === "firstName" ? "given-name" : key === "surname" ? "family-name" : undefined} aria-required={!options.optional} aria-invalid={!!error} aria-describedby={error ? `error-${key}` : undefined} onChange={event => update(key, event.target.value as RegistrationValues[typeof key])} />{error && <p id={`error-${key}`} className="registration-error">{error}</p>}</div>;
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!enabled || submitting) return;
    const result = registrationSchema.safeParse(values);
    if (!result.success) {
      const next: Record<string, string> = {};
      result.error.issues.forEach(issue => { const key = String(issue.path[0]); if (!next[key]) next[key] = issue.message; });
      setErrors(next);
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    setSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 900));
    setSubmitting(false);
    if (isDemoExistingEmail(result.data.email)) { setExisting(true); return; }
    setValues(current => ({ ...current, password: "", confirmPassword: "" }));
    markPending(); setSuccess(true); window.scrollTo({ top: 0, behavior: "smooth" });
  }
  return <div className="category-page">
    <CategoryHeader count={0} total={0} onCart={() => setDialog("Coșul meu")} onSaved={() => setDialog("Liste salvate")} onAccount={() => setDialog("Contul meu")} onSearch={() => setDialog("Căutare produse")} />
    <main className="container-wide registration-page">
      <nav className="category-breadcrumb" aria-label="Breadcrumb"><Link to="/">Acasă</Link><ChevronRight /><Link to="/parteneri-b2b">Parteneri B2B</Link><ChevronRight /><span>Înscriere</span></nav>
      {success ? <section className="registration-success"><span className="registration-success-icon"><CheckCircle2 /></span><div className="eyebrow">aeinstal business</div><h1>Solicitarea a fost trimisă</h1><p>Te contactăm în <strong>24 h lucrătoare.</strong><br />Până atunci poți comanda cu prețuri standard.</p><PendingApprovalBanner /><div className="registration-success-actions"><Button variant="brand" asChild><Link to="/">Mergi la magazin<ArrowRight /></Link></Button><Button variant="outline" onClick={() => setDialog("Contul meu")}>Contul meu<UserRound /></Button></div><p className="demo-note">Confirmare demonstrativă. Nu a fost creat un cont și nu s-au transmis date.</p></section> : <>
      <header className="registration-heading"><div><div className="eyebrow">aeinstal business</div><h1>Solicită cont B2B</h1><p>Firma ta. Un partener de încredere. Condiții dedicate.</p></div><span><ShieldCheck />Datele firmei, într-un singur loc</span></header>
      <div className="registration-layout">
        <form ref={formRef} noValidate onSubmit={submit} className="registration-form">
          <section className="registration-block"><div className="registration-block-heading"><span className="registration-number">01</span><div><h2>Firma</h2><p>Începem cu datele de identificare.</p></div><Building2 /></div>
            <div className="registration-cui"><label htmlFor="b2b-cui">CUI <span>*</span></label><div className={`registration-cui-input state-${cuiState}`}><Building2 /><input id="b2b-cui" value={values.cui} placeholder="ex. RO12345678" maxLength={14} autoComplete="off" aria-invalid={cuiState === "invalid" || cuiState === "inactive"} aria-describedby="cui-message" onChange={event => update("cui", event.target.value)} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); void lookup(); } }} />{cuiState === "loading" ? <Loader2 className="registration-spinner" /> : cuiState === "found" ? <Check className="text-success" /> : null}<Button variant="brand" type="button" onClick={() => void lookup()} disabled={!values.cui.trim() || cuiState === "loading"}><Search />Caută</Button></div>
            <div id="cui-message" aria-live="polite" className={`registration-cui-message state-${cuiState}`}>{cuiState === "empty" ? "Completăm automat datele firmei" : cuiState === "loading" ? "Se caută datele firmei…" : cuiState === "found" ? <><CheckCircle2 />Firma a fost găsită. Poți corecta datele de mai jos.</> : cuiState === "invalid" ? <><AlertCircle />CUI invalid. Introdu 2–10 cifre, opțional precedate de RO.</> : cuiState === "inactive" ? <><AlertCircle />Firma este inactivă sau radiată. Solicitarea nu poate fi trimisă.</> : <><AlertCircle />Serviciul ANAF nu răspunde. Completează datele manual.</>}</div></div>
            <details className="registration-demo"><summary>Exemple demonstrative pentru CUI</summary><p>Verificarea ANAF este simulată. Folosește numai date de test.</p><div>{[{ key: "found", label: "Firmă găsită" }, { key: "inactive", label: "Firmă inactivă" }, { key: "manual", label: "Serviciu indisponibil" }].map(item => <Button type="button" variant="outline" size="sm" key={item.key} onClick={() => { const value = demoCuis[item.key as keyof typeof demoCuis]; update("cui", value); void lookup(value); }}>{item.label} · {demoCuis[item.key as keyof typeof demoCuis]}</Button>)}<Button type="button" variant="outline" size="sm" onClick={() => { update("cui", "ROABC"); void lookup("ROABC"); }}>CUI invalid</Button></div></details>
            <div className={`registration-fields${cuiState === "found" ? " registration-highlight" : ""}`}>
              {field("company", "Denumire firmă", { company: true, full: true, placeholder: "Denumirea completă a firmei" })}{field("registry", "Nr. Reg. Com.", { company: true, placeholder: "J00/000/2020" })}
              <div className="registration-field"><label>Plătitor de TVA</label><Button variant="outline" type="button" className={`registration-vat${values.vat ? " active" : ""}`} aria-pressed={values.vat} disabled={!enabled} onClick={() => update("vat", !values.vat)}>{values.vat ? <Check /> : <Building2 />}{values.vat ? "Da · plătitor de TVA" : "Nu · neplătitor de TVA"}</Button></div>
              {field("address", "Adresă sediu", { company: true, full: true })}{field("county", "Județ", { company: true })}{field("city", "Localitate", { company: true })}
              <div className="registration-field"><label htmlFor="b2b-activity">Tip activitate <span>*</span></label><select id="b2b-activity" value={values.activity === "altele" && !enabled ? "" : values.activity} disabled={!enabled} aria-invalid={!!errors.activity} onChange={event => update("activity", event.target.value as RegistrationValues["activity"])}><option value="" disabled>Selectează activitatea</option><option value="instalator">Instalator</option><option value="firma">Firmă de instalații</option><option value="constructor">Constructor</option><option value="revanzator">Revânzător</option><option value="mentenanta">Mentenanță</option><option value="altele">Altele</option></select>{errors.activity && <p className="registration-error">{errors.activity}</p>}</div>
              <div className="registration-field"><label htmlFor="b2b-volume">Volum lunar estimat <small>opțional</small></label><select id="b2b-volume" value={values.volume} disabled={!enabled} onChange={event => update("volume", event.target.value)}><option value="">Selectează un interval</option><option>Sub 5.000 lei</option><option>5.000–15.000 lei</option><option>15.000–50.000 lei</option><option>Peste 50.000 lei</option></select></div>
            </div>
          </section>
          <section className="registration-block"><div className="registration-block-heading"><span className="registration-number">02</span><div><h2>Persoana de contact</h2><p>Cu cine discutăm despre condițiile firmei?</p></div><UserRound /></div><div className="registration-fields">{field("surname", "Nume")}{field("firstName", "Prenume")}{field("role", "Funcție", { optional: true })}{field("phone", "Telefon", { type: "tel", placeholder: "07xx xxx xxx" })}{field("email", "Email", { type: "email", full: true, placeholder: "nume@firma.ro" })}</div>{existing && <div className="registration-existing" role="alert"><AlertCircle /><div><b>Email deja înregistrat.</b><p>Ai deja un cont pentru această adresă.</p><Button type="button" variant="link" onClick={() => setDialog("Autentificare")}>Autentificare</Button><Button type="button" variant="link" onClick={() => setDialog("Am uitat parola")}>Am uitat parola</Button></div></div>}</section>
          <section className="registration-block"><div className="registration-block-heading"><span className="registration-number">03</span><div><h2>Contul tău</h2><p>Accesul tău la aeinstal business.</p></div><LockKeyhole /></div><div className="registration-fields">{["password", "confirmPassword"].map(key => { const name = key as "password" | "confirmPassword"; return <div className="registration-field" key={key}><label htmlFor={`b2b-${key}`}>{key === "password" ? "Parolă" : "Confirmă parola"} <span>*</span></label><div className="registration-password"><input id={`b2b-${key}`} autoComplete="new-password" type={showPassword ? "text" : "password"} maxLength={128} value={values[name]} aria-invalid={!!errors[name]} onChange={event => update(name, event.target.value)} /><Button type="button" variant="ghost" size="icon" title={showPassword ? "Ascunde parola" : "Arată parola"} aria-label={showPassword ? "Ascunde parola" : "Arată parola"} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff /> : <Eye />}</Button></div>{errors[name] && <p className="registration-error">{errors[name]}</p>}</div>; })}</div><div className="registration-strength"><div aria-label={`Complexitate parolă: ${strength} din 4`} className={`strength-${strength}`}>{[1, 2, 3, 4].map(level => <span className={level <= strength ? "filled" : ""} key={level} />)}</div><p>{values.password ? ["Prea slabă", "Slabă", "Medie", "Bună", "Puternică"][strength] : "Minimum 8 caractere, o literă mare, o literă mică și o cifră."}</p></div>
          <div className="registration-consents">{[{ key: "terms", text: "Accept termenii și condițiile", required: true }, { key: "gdpr", text: "Sunt de acord cu prelucrarea datelor personale (GDPR)", required: true }, { key: "newsletter", text: "Vreau să primesc noutăți și oferte aeinstal", required: false }].map(item => { const key = item.key as "terms" | "gdpr" | "newsletter"; return <div key={key}><div className="registration-consent"><Checkbox id={`b2b-${key}`} checked={values[key]} aria-invalid={!!errors[key]} onCheckedChange={checked => update(key, checked === true)} /><label htmlFor={`b2b-${key}`}>{item.text}{item.required && " *"}{!item.required && <small>opțional</small>}</label>{item.required && <Button type="button" variant="link" size="sm" onClick={() => setDialog(key === "terms" ? "Termeni și condiții" : "Politica de confidențialitate")}>Detalii</Button>}</div>{errors[key] && <p className="registration-error">{errors[key]}</p>}</div>; })}</div>
          <Button type="submit" variant="brand" className="registration-submit" disabled={!enabled || submitting}>{submitting ? <Loader2 className="registration-spinner" /> : <ArrowRight />}{submitting ? "Se trimite solicitarea…" : "Trimite solicitarea"}</Button><p className="registration-submit-note"><LockKeyhole />Solicitarea este verificată de echipa comercială înainte de aprobare.</p>
          </section><p className="demo-note">Machetă demonstrativă: datele nu sunt trimise sau salvate. Email de test deja înregistrat: demo@exemplu.ro.</p>
        </form>
        <aside className="registration-aside"><div className="registration-next"><div className="eyebrow">Următorul pas</div><h2>Ce urmează după înscriere</h2><ol><li><span>1</span><div><b>Completezi formularul</b><p>Datele firmei și persoana de contact.</p></div></li><li><span>2</span><div><b>Verificăm și stabilim condițiile</b><p>Echipa comercială revine în <strong>24 h lucrătoare.</strong></p></div></li><li><span>3</span><div><b>Vezi prețurile firmei tale</b><p>După aprobare, ai acces la condițiile dedicate.</p></div></li></ol><div className="registration-help"><Headset /><div><b>Ai nevoie de ajutor?</b><Link to="/" hash="contact">Contactează echipa comercială<ArrowRight /></Link></div></div></div><div className="registration-aside-note"><Clock3 /><p>Până la aprobare, poți cumpăra cu prețurile standard din magazin.</p></div></aside>
      </div></>}
    </main>
    <footer className="footer category-footer"><div className="container-wide"><Link to="/" className="logo"><span className="logo-name"><span>ae</span>instal<span>.</span></span><span className="logo-tagline">Partenerul proiectelor tale</span></Link><div><Link to="/parteneri-b2b">Avantaje pentru firme</Link><Link to="/" hash="contact">Depozite și contact</Link></div><span>© 2026 aeinstal</span></div></footer>
    <Dialog open={dialog !== null} onOpenChange={open => !open && setDialog(null)}><DialogContent><DialogHeader><DialogTitle>{dialog}</DialogTitle><DialogDescription>aeinstal · catalog demonstrativ</DialogDescription></DialogHeader>{dialog === "Contul meu" && <PendingApprovalBanner />}<p className="notice">{dialog === "Contul meu" && success ? "Solicitarea ta este în așteptare. Condițiile dedicate sunt disponibile după aprobare." : dialog === "Termeni și condiții" || dialog === "Politica de confidențialitate" ? "Documentul juridic final va fi furnizat de aeinstal înainte de activarea înscrierilor reale." : "Această operațiune nu este activată în macheta de design."}</p><Button variant="outline" onClick={() => setDialog(null)}>Închide</Button></DialogContent></Dialog>
  </div>;
}