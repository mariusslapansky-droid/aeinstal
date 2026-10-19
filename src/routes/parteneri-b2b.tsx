import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight, BadgePercent, Building2, CalendarClock, FileText, HardHat,
  Headset, PackageCheck, Phone, Store, Truck, UserRound, Wrench, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CategoryHeader } from "@/components/category-header";
import heroImage from "@/assets/b2b_hero.jpg";

export const Route = createFileRoute("/parteneri-b2b")({
  head: () => ({
    meta: [
      { title: "Parteneri B2B · aeinstal" },
      { name: "description", content: "Prețuri și condiții dedicate firmei tale: cont de partener aeinstal pentru instalatori, constructori și revânzători." },
      { property: "og:title", content: "Parteneri B2B · aeinstal" },
      { property: "og:description", content: "Prețuri nete, comandă rapidă și consultanță tehnică pentru firme." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PartnersPage,
});

const audience = [
  { Icon: Wrench, label: "Instalatori" },
  { Icon: Building2, label: "Firme de instalații" },
  { Icon: HardHat, label: "Constructori" },
  { Icon: Store, label: "Revânzători" },
  { Icon: CalendarClock, label: "Firme de mentenanță" },
];

const advantages = [
  { Icon: BadgePercent, title: "Prețuri nete dedicate", text: "Vezi prețurile tale, stabilite pentru firma ta, direct în catalog." },
  { Icon: Zap, title: "Comandă rapidă după cod", text: "Ai codurile? Pune produsele în coș în sub un minut." },
  { Icon: FileText, title: "Ofertare pentru lucrări", text: "Trimite lista de materiale și primești o ofertă personalizată." },
  { Icon: CalendarClock, title: "Plată la termen", text: "După aprobare, comenzi acum și plătești la termenul agreat." },
  { Icon: Headset, title: "Consultanță tehnică", text: "Echipa noastră te ajută să alegi soluția potrivită pentru lucrare." },
  { Icon: Truck, title: "Ridicare sau livrare 24–48 h", text: "Ridici din depozit sau primești marfa la lucrare, rapid." },
];

const steps = [
  { title: "Completezi formularul", text: "Introduci CUI-ul firmei, iar datele se completează automat." },
  { title: "Verificăm și stabilim condițiile", text: "Echipa comercială verifică firma și îți stabilește condițiile, în 24 h lucrătoare." },
  { title: "Te autentifici și vezi prețurile tale", text: "Ai acces la prețurile nete, comenzi rapide și ofertare." },
];

// Cifre demonstrative — valorile reale vin de la client și se editează din admin.
const stats = [
  { value: "12.000+", label: "produse în catalog" },
  { value: "4", label: "depozite regionale" },
  { value: "80+", label: "branduri" },
  { value: "15", label: "ani de experiență" },
];

const faq = [
  { q: "Cine poate deveni partener aeinstal?", a: "Orice firmă cu activitate în domeniu: instalatori, firme de instalații, constructori, revânzători și firme de mentenanță. Ai nevoie doar de un CUI valid." },
  { q: "Cât durează aprobarea contului?", a: "Echipa comercială verifică datele firmei și revine cu condițiile în maximum 24 de ore lucrătoare." },
  { q: "Cum se stabilesc prețurile mele?", a: "Prețurile nete se stabilesc în funcție de profilul și volumul firmei tale și sunt vizibile în catalog după autentificare." },
  { q: "Cum funcționează plata la termen?", a: "După aprobarea contului poți solicita plata la termen. Condițiile și limita de credit se stabilesc împreună cu agentul tău comercial." },
  { q: "Pot cumpăra și ca persoană fizică?", a: "Da, magazinul este deschis tuturor, cu prețuri standard afișate public. Contul de partener adaugă prețurile și condițiile dedicate firmelor." },
  { q: "Ce documente sunt necesare?", a: "Doar CUI-ul firmei pentru înscriere. Dacă e nevoie de documente suplimentare, echipa comercială te contactează." },
];

function PartnersPage() {
  const [dialog, setDialog] = useState<"apply" | "login" | "cart" | "saved" | "account" | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="category-page">
      <CategoryHeader
        count={0}
        total={0}
        onCart={() => setDialog("cart")}
        onSaved={() => setDialog("saved")}
        onAccount={() => setDialog("account")}
        onSearch={() => setDialog("cart")}
      />
      <main>
        <section className="container-wide b2b-hero">
          <div className="b2b-hero-main">
            <img src={heroImage} alt="Instalator pe șantier, verificând instalația de țevi" width={1600} height={912} className="b2b-hero-image" />
            <div className="b2b-hero-content">
              <span className="eyebrow">aeinstal business</span>
              <h1>Prețuri și condiții dedicate <span>firmei tale</span></h1>
              <p>Un cont de partener, toate avantajele: prețuri nete, comenzi rapide și un agent comercial dedicat.</p>
              <div className="b2b-hero-actions">
                <Button variant="brand" asChild><Link to="/inscriere-b2b">Solicită cont B2B<ArrowRight /></Link></Button>
                <Button variant="onDark" onClick={() => setDialog("login")}><UserRound />Autentificare partener</Button>
              </div>
            </div>
          </div>
        </section>

        <section className="container-wide b2b-section" aria-labelledby="b2b-audience">
          <div className="eyebrow">Cui se adresează</div>
          <h2 id="b2b-audience">Pentru profesioniștii din instalații</h2>
          <div className="b2b-audience-grid">
            {audience.map(({ Icon, label }) => (
              <div className="b2b-audience-card" key={label}><Icon /><span>{label}</span></div>
            ))}
          </div>
        </section>

        <section className="container-wide b2b-section" aria-labelledby="b2b-advantages">
          <div className="eyebrow">Avantaje</div>
          <h2 id="b2b-advantages">Ce primești ca partener</h2>
          <div className="b2b-advantages-grid">
            {advantages.map(({ Icon, title, text }) => (
              <div className="b2b-advantage-card" key={title}>
                <Icon />
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container-wide b2b-section" aria-labelledby="b2b-steps">
          <div className="eyebrow">Cum funcționează</div>
          <h2 id="b2b-steps">Trei pași până la prețurile tale</h2>
          <ol className="b2b-steps">
            {steps.map((step, index) => (
              <li className="b2b-step" key={step.title}>
                <span className="b2b-step-number">{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="b2b-stats" aria-label="aeinstal în cifre">
          <div className="container-wide b2b-stats-inner">
            {stats.map(stat => (
              <div className="b2b-stat" key={stat.label}><b>{stat.value}</b><span>{stat.label}</span></div>
            ))}
          </div>
          <p className="b2b-stats-note">Cifre orientative, demonstrative.</p>
        </section>

        <section className="container-wide b2b-section" aria-labelledby="b2b-faq">
          <div className="eyebrow">Întrebări frecvente</div>
          <h2 id="b2b-faq">Tot ce trebuie să știi</h2>
          <div className="b2b-faq">
            {faq.map((item, index) => (
              <div className={`b2b-faq-item${openFaq === index ? " open" : ""}`} key={item.q}>
                <button type="button" aria-expanded={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? null : index)}>
                  {item.q}
                  <ArrowRight />
                </button>
                {openFaq === index && <p>{item.a}</p>}
              </div>
            ))}
          </div>
        </section>

        <section className="container-wide b2b-final-cta">
          <div>
            <div className="eyebrow">Hai să lucrăm împreună</div>
            <h2>Solicită cont B2B</h2>
            <p>Completezi formularul în câteva minute, iar echipa comercială revine cu condițiile în 24 h lucrătoare.</p>
          </div>
          <div className="b2b-final-actions">
            <Button variant="brand" asChild><Link to="/inscriere-b2b">Solicită cont B2B<ArrowRight /></Link></Button>
            <Link to="/" hash="contact" className="b2b-agent-link"><Phone />Contactează agentul comercial</Link>
          </div>
        </section>

        <div className="category-bottom-benefits container-wide">
          <span><PackageCheck />Produse în stoc</span>
          <span><Truck />Livrare 24–48 h</span>
          <span><Headset />Consultanță tehnică</span>
          <span><Building2 />Condiții dedicate firmelor</span>
        </div>
      </main>

      <footer className="footer category-footer"><div className="container-wide"><Link to="/" className="logo"><span className="logo-name"><span>ae</span>instal<span>.</span></span><span className="logo-tagline">Partenerul proiectelor tale</span></Link><div><Link to="/" hash="contact">Depozite și contact</Link><Link to="/" hash="resurse">Resurse tehnice</Link><Link to="/categorie/$slug" params={{ slug: "tevi-si-fitinguri" }}>Catalog produse</Link></div><span>© 2026 aeinstal</span></div></footer>

      <Dialog open={dialog !== null} onOpenChange={open => !open && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialog === "apply" ? "Solicită cont B2B" : dialog === "login" ? "Autentificare partener" : dialog === "saved" ? "Liste salvate" : dialog === "account" ? "Contul meu" : "Coșul meu"}
            </DialogTitle>
            <DialogDescription>Partenerul proiectelor tale</DialogDescription>
          </DialogHeader>
          <div className="dialog-body">
            <div className="notice">
              {dialog === "apply"
                ? "Formularul de înscriere B2B urmează în etapa următoare a machetei: CUI cu completare automată, date de contact și cont."
                : dialog === "login"
                  ? "Autentificarea și conturile de partener nu sunt încă activate în această machetă."
                  : "Această interacțiune este demonstrativă în macheta de design."}
            </div>
            {dialog === "apply" && <Button variant="brand" className="w-full mt-5" disabled>Trimite solicitarea</Button>}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
