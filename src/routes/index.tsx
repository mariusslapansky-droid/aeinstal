import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { categorySlug } from "@/lib/category-catalogue";
import { useState, useRef, useEffect } from "react";
import { Search, ArrowRight, ChevronDown, ChevronRight, ChevronLeft, Menu, X, Phone, Mail, MapPin, UserRound, ShoppingCart, Heart, Zap, Building2, Truck, Headset, CreditCard, BadgePercent, PackageCheck, FileText, ListChecks, Upload, Plus, Trash2, Check, BookOpen, Wrench, ShieldCheck, Leaf, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { categories, products, money, type Product } from "@/lib/catalogue";
import heroImage from "@/assets/installation_hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "aeinstal · Instalații pentru fiecare proiect" },
    { name: "description", content: "Descoperă soluții pentru încălzire, climatizare, țevi, fitinguri și baie. aeinstal: un singur catalog pentru profesioniști și proiectele tale." },
    { property: "og:title", content: "aeinstal · Partenerul proiectelor tale" },
    { property: "og:description", content: "Instalații termice și sanitare, comandă rapidă după cod și o experiență dedicată firmelor." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

type CartLine = { product: Product; quantity: number };
type Panel = "cart" | "saved" | "business" | "login" | "import" | "resource" | "contact" | "newsletter" | "product" | "category" | null;

function Logo() {
  return <a href="#" className="logo" aria-label="aeinstal — Acasă"><span className="logo-name"><span>ae</span>instal<span>.</span></span><span className="logo-tagline">Partenerul proiectelor tale</span></a>;
}

function Index() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [panel, setPanel] = useState<Panel>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product>(products[0]);
  const [resourceTitle, setResourceTitle] = useState("");
  const [quickCode, setQuickCode] = useState("");
  const [quickQuantity, setQuickQuantity] = useState(1);
  const [quickError, setQuickError] = useState("");
  const [toast, setToast] = useState("");
  const [promoOffset, setPromoOffset] = useState(0);
  const [secondaryTab, setSecondaryTab] = useState("Lichidări de stoc");
  const [importReport, setImportReport] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const total = cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const count = cart.reduce((sum, line) => sum + line.quantity, 0);
  const matches = products.filter(p => `${p.name} ${p.id} ${p.category}`.toLocaleLowerCase("ro").includes(query.toLocaleLowerCase("ro")));

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 3500);
    return () => window.clearTimeout(timeout);
  }, [toast]);
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const addToCart = (product: Product, quantity = 1) => {
    const safeQuantity = Math.max(1, Math.floor(quantity || 1));
    setCart(current => {
      const existing = current.find(line => line.product.id === product.id);
      return existing ? current.map(line => line.product.id === product.id ? { ...line, quantity: line.quantity + safeQuantity } : line) : [...current, { product, quantity: safeQuantity }];
    });
    setToast(`${safeQuantity} ${safeQuantity === 1 ? "produs adăugat" : "produse adăugate"} în coș`);
  };
  const toggleSaved = (id: string) => setSaved(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  const showProduct = (product: Product) => { setSearchOpen(false); navigate({ to: "/produs/$productId", params: { productId: product.id } }); };
  const showCategory = (name: string) => {
    if (categories.some(category => category.name === name)) {
      navigate({ to: "/categorie/$slug", params: { slug: categorySlug(name) } });
      return;
    }
    setSelectedCategory(name); setPanel("category"); setMenuOpen(false);
  };
  const showResource = (title: string) => { setResourceTitle(title); setPanel("resource"); };
  const quickAdd = (event: React.FormEvent) => {
    event.preventDefault();
    const product = products.find(p => p.id.toLowerCase() === quickCode.trim().toLowerCase());
    if (!product) { setQuickError("Codul nu a fost găsit. În catalogul demonstrativ poți încerca AE-1001."); return; }
    addToCart(product, quickQuantity); setQuickError(""); setQuickCode("");
  };
  const importCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const lines = (await file.text()).trim().split(/\r?\n/);
    let added = 0; let unknown = 0;
    for (const line of lines) {
      const [code, amount] = line.split(/[;,\t]/);
      if (code?.trim().toLowerCase() === "cod") continue;
      const product = products.find(p => p.id.toLowerCase() === code?.trim().toLowerCase());
      const quantity = Number(amount);
      if (product && Number.isInteger(quantity) && quantity > 0) { addToCart(product, quantity); added++; } else unknown++;
    }
    setImportReport(`${added} poziții adăugate în coș.${unknown ? ` ${unknown} poziții cu cod sau cantitate nevalidă.` : ""}`);
    event.target.value = "";
  };

  const productCard = (product: Product) => <ProductCard key={product.id} product={product} saved={saved.includes(product.id)} onSave={() => toggleSaved(product.id)} onAdd={quantity => addToCart(product, quantity)} onOpen={() => showProduct(product)} />;
  const currentPromos = [...products.slice(promoOffset), ...products.slice(0, promoOffset)].slice(0, 4);
  const categoryProducts = products.filter(p => p.category === selectedCategory || selectedCategory === "Toate produsele" || selectedCategory === "Promoții" || selectedCategory.startsWith("Brand:"));

  return <>
    <div className="topbar"><div className="container-wide topbar-inner">
      <div className="topbar-links"><span>Tot ce ai nevoie pentru instalații. Într-un singur loc.</span><span className="desktop-contact">Pentru profesioniști. Pentru fiecare proiect.</span></div>
      <div className="topbar-links"><a href="#contact" className="desktop-contact"><Headset /> Consultanță tehnică</a><a href="#contact"><MapPin /> Depozite</a><span className="vat-switch">Prețuri <b>cu TVA</b></span></div>
    </div></div>
    <header className="header">
      <div className="container-wide main-header">
        <Button variant="ghost" className="mobile-menu-button" aria-label="Deschide meniul" onClick={() => setMenuOpen(!menuOpen)}><Menu /></Button>
        <Logo />
        <div className="search-wrap" ref={searchRef}>
          <form className="searchbox" role="search" onSubmit={event => { event.preventDefault(); setSearchOpen(true); }}>
            <Search /><input aria-label="Caută produse" value={query} onChange={event => { setQuery(event.target.value); setSearchOpen(true); }} onFocus={() => query && setSearchOpen(true)} onKeyDown={event => event.key === "Escape" && setSearchOpen(false)} placeholder="Caută după nume, cod produs sau EAN…" />
            <Button className="search-submit" variant="brand" type="submit" aria-label="Caută"><Search /></Button>
          </form>
          {searchOpen && <div className="search-results"><div className="search-results-title"><span>{query ? "Rezultate în catalog" : "Produse recomandate"}</span><Button size="icon" variant="ghost" aria-label="Închide căutarea" onClick={() => setSearchOpen(false)}><X /></Button></div>
            {matches.length ? matches.slice(0, 5).map(product => <button className="search-result" key={product.id} onClick={() => showProduct(product)}><img src={product.image} alt="" width="46" height="46" /><span>{product.name}<small>{product.id}</small></span><b>{money(product.price)} lei</b><ChevronRight size={14} /></button>) : <p className="py-4 text-xs text-muted-foreground">Niciun produs găsit. Încearcă „pompă”, „PPR” sau „AE-1001”.</p>}
            <p className="demo-note">Catalog demonstrativ pentru prezentarea designului.</p>
          </div>}
        </div>
        <div className="header-actions">
          <Button variant="ghost" className="header-action quick-header" asChild><a href="#comanda-rapida"><Zap /><span className="action-text"><small>Ai codurile?</small>Comandă rapidă</span></a></Button>
          <Button variant="ghost" className="header-action" onClick={() => setPanel("login")} aria-label="Contul meu"><UserRound /><span className="action-text"><small>Bine ai venit!</small>Contul meu</span></Button>
          <Button variant="ghost" className="header-action lists-header" onClick={() => setPanel("saved")} aria-label="Liste salvate"><Heart /></Button>
          <Button variant="ghost" className="header-action" onClick={() => setPanel("cart")} aria-label={`Coșul meu, ${count} produse`}><span className="cart-icon"><ShoppingCart /><span className="cart-badge">{count}</span></span><span className="action-text"><small>Coșul meu</small>{money(total)} lei</span></Button>
        </div>
      </div>
      <nav className="nav-shell" aria-label="Navigare principală"><div className="container-wide nav-inner">
        <Button className="products-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen}><span><Menu />Toate produsele</span><ChevronDown /></Button>
        <a className="promo-link" href="#promotii"><BadgePercent size={15} />Promoții</a><a href="#lichidari" className="desktop-nav">Lichidări de stoc</a><a href="#branduri">Branduri</a><a href="#categorii" onClick={event => { event.preventDefault(); showCategory("Piese de schimb"); }} className="desktop-nav">Piese de schimb</a><a href="#resurse" className="desktop-nav">Resurse</a><a href="#contact" className="desktop-nav">Contact</a><a href="#pentru-firme" className="business-link"><Building2 size={15} />Pentru firme<ArrowRight size={13} /></a>
        {menuOpen && <div className="mega-menu"><div className="mega-list">{categories.map((category, index) => <button key={category.name} className={index === activeCategory ? "active" : ""} onMouseEnter={() => setActiveCategory(index)} onFocus={() => setActiveCategory(index)} onClick={() => showCategory(category.name)}>{category.name}<ChevronRight size={14} /></button>)}</div><div className="mega-details"><h3>{categories[activeCategory]?.name}</h3>{categories[activeCategory]?.items.map(item => <a key={item} href="#categorii" onClick={event => { event.preventDefault(); showCategory(categories[activeCategory]?.name ?? "Toate produsele"); }}>{item}</a>)}{categories[activeCategory]?.image && <img src={categories[activeCategory].image} alt={categories[activeCategory].name} width="200" height="170" />}<Button variant="brand" onClick={() => showCategory(categories[activeCategory]?.name ?? "Toate produsele")}>Vezi categoria<ArrowRight /></Button></div></div>}
      </div></nav>
    </header>
    <main>
      <section className="container-wide hero-area">
        <div className="hero-grid">
          <div className="hero-main"><img src={heroImage} className="hero-image" alt="Instalator verificând un sistem de instalații termice cu conducte și distribuitoare" width="1536" height="1024" fetchPriority="high" /><div className="hero-content"><div className="eyebrow">aeinstal. Pentru cei care construiesc.</div><h1>Instalații pentru<br />fiecare proiect.<br /><span>Un partener de încredere.</span></h1><p>De la primul fiting la întregul sistem.<br />Soluții termice, sanitare și de climatizare.</p><Button variant="brand" className="hero-cta" asChild><a href="#categorii">Descoperă produsele<ArrowRight /></a></Button></div><div className="hero-bottom"><ShieldCheck />Produse pentru profesioniști. Soluții pentru toți.</div></div>
          <div className="hero-side"><div className="mini-campaign"><span className="campaign-label">aeinstal business</span><h2>Tu construiești.<br />Noi te susținem.</h2><p>Prețuri și condiții dedicate firmei tale.</p><a href="#pentru-firme">Devino partener<ArrowRight /></a><Building2 className="campaign-symbol" /></div><div className="mini-campaign warm"><span className="campaign-label">Mai puțin timp. Mai mult spor.</span><h2>Ai codurile?<br />Ai comanda.</h2><p>Adaugă produsele direct după cod.</p><a href="#comanda-rapida">Comandă rapidă<ArrowRight /></a><Zap className="campaign-symbol" /></div></div>
        </div>
        <div className="benefits">{[
          { Icon: BadgePercent, title: "Prețuri dedicate firmelor", text: "Condiții adaptate afacerii tale" },
          { Icon: Truck, title: "Livrare rapidă din stoc", text: "24–48 h sau ridicare din depozit" },
          { Icon: Headset, title: "Consultanță tehnică", text: "Alegem împreună soluția potrivită" },
          { Icon: CreditCard, title: "Plata la termen", text: "Pentru partenerii aprobați" },
        ].map(({ Icon, title, text }) => <div className="benefit" key={title}><Icon /><div><b>{title}</b><small>{text}</small></div></div>)}</div>
      </section>
      <section className="container-wide section" id="categorii"><div className="section-heading"><div><h2>Totul pentru instalația ta</h2><p>Găsește rapid produsele potrivite, de la fundație la finisaj.</p></div><a className="text-link" href="#categorii" onClick={event => { event.preventDefault(); showCategory("Toate produsele"); }}>Toate categoriile<ArrowRight /></a></div>
        <div className="categories-grid">{categories.slice(0, 4).map(category => <article className="category-card" key={category.name}><div className="category-card-header"><h3>{category.name}</h3><ChevronRight /></div><a href="#categorii" onClick={event => { event.preventDefault(); showCategory(category.name); }}><img src={category.image} alt={category.name} width="512" height="512" loading="lazy" /></a><div className="category-links">{category.items.map(item => <a key={item} href="#categorii" onClick={event => { event.preventDefault(); showCategory(category.name); }}>{item}</a>)}</div><a href="#categorii" className="category-all" onClick={event => { event.preventDefault(); showCategory(category.name); }}>Vezi toate produsele<ArrowRight /></a></article>)}</div>
        <div className="more-categories">{categories.slice(4).map(category => <a href="#categorii" key={category.name} onClick={event => { event.preventDefault(); showCategory(category.name); }}>{category.name}<ChevronRight /></a>)}</div>
      </section>
      <section className="container-wide" id="pentru-firme"><div className="business-band"><div><div className="eyebrow">aeinstal business</div><h2>Un cont. Toate avantajele.<br />Mai mult pentru afacerea ta.</h2><p>Ești instalator, constructor sau revânzător? Ai un partener pentru fiecare lucrare, într-un singur loc.</p><div className="business-actions"><Button variant="brand" onClick={() => setPanel("business")}>Creează cont firmă<ArrowRight /></Button><Button variant="onDark" onClick={() => setPanel("login")}>Autentificare<UserRound /></Button></div></div><div className="business-benefits">{[
        { Icon: BadgePercent, title: "Prețurile firmei tale", text: "Prețuri nete și condiții dedicate" },
        { Icon: Zap, title: "Comenzi în câteva minute", text: "După cod sau import din Excel" },
        { Icon: FileText, title: "Totul într-un singur cont", text: "Comenzi, oferte și documente" },
        { Icon: CreditCard, title: "Flexibilitate la plată", text: "Plata la termen, după aprobare" },
      ].map(({ Icon, title, text }) => <div className="business-benefit" key={title}><Icon /><div><b>{title}</b><small>{text}</small></div></div>)}</div></div></section>
      <section className="container-wide" id="comanda-rapida"><div className="quick-order"><div className="quick-intro"><Zap /><div><h2>Știi codul? Comandă direct.</h2><p>Fără căutări. Fără pași în plus.</p></div></div><form className="quick-fields" onSubmit={quickAdd}><label>Cod produs<input value={quickCode} onChange={event => setQuickCode(event.target.value)} placeholder="Ex. AE-1001" required /></label><label>Cantitate<input className="quantity" type="number" min="1" step="1" value={quickQuantity} onChange={event => setQuickQuantity(Number(event.target.value))} required /></label><Button variant="brand" type="submit"><Plus />Adaugă</Button><Button variant="ghost" className="import-button" type="button" onClick={() => { setImportReport(""); setPanel("import"); }}><Upload />Importă din Excel</Button></form></div>{quickError && <p role="alert" className="form-error">{quickError}</p>}</section>
      <section className="container-wide section" id="promotii"><div className="section-heading"><div><h2>Oferte bune. Proiecte reușite.</h2><p>Produse selectate pentru lista ta de cumpărături.</p></div><div className="flex items-center gap-5"><a className="text-link" href="#promotii" onClick={event => { event.preventDefault(); showCategory("Promoții"); }}>Toate promoțiile<ArrowRight /></a><div className="slider-arrows"><Button size="icon" variant="outline" aria-label="Promoțiile anterioare" onClick={() => setPromoOffset((promoOffset + products.length - 1) % products.length)}><ChevronLeft /></Button><Button size="icon" variant="outline" aria-label="Promoțiile următoare" onClick={() => setPromoOffset((promoOffset + 1) % products.length)}><ChevronRight /></Button></div></div></div><div className="products-grid">{currentPromos.map(productCard)}</div><p className="demo-note">Selecție și prețuri demonstrative · imaginile sunt ilustrative.</p></section>
      <section className="container-wide section" id="lichidari"><div className="section-heading"><div className="tab-row" role="tablist" aria-label="Selecții de produse">{["Lichidări de stoc", "Noutăți"].map(tab => <button role="tab" aria-selected={secondaryTab === tab} className={secondaryTab === tab ? "active" : ""} key={tab} onClick={() => setSecondaryTab(tab)}>{tab}</button>)}</div><span className="text-link"><PackageCheck size={16} />Selecția aeinstal</span></div><div className="products-grid" role="tabpanel" aria-label={secondaryTab}>{(secondaryTab === "Noutăți" ? products.slice(4) : [products[5], products[3], products[6], products[1]]).map(productCard)}</div></section>
      <section className="container-wide brand-section" id="branduri"><div className="section-heading"><div><h2>Branduri pentru lucrări bine făcute</h2><p>Nume cunoscute în lumea instalațiilor.</p></div><a className="text-link" href="#branduri" onClick={event => { event.preventDefault(); showResource("Branduri"); }}>Toate brandurile<ArrowRight /></a></div><div className="brand-row">{["BOSCH", "Vaillant", "Viessmann", "grundfos", "Wilo", "GROHE", "Geberit", "REHAU", "Uponor", "Danfoss", "FERRO", "ARISTON"].map(brand => <a href="#branduri" key={brand} onClick={event => { event.preventDefault(); showResource(brand); }}>{brand}</a>)}</div><p className="demo-note">Branduri orientative pentru machetă; portofoliul se confirmă înainte de publicare.</p></section>
      <section className="container-wide section" id="resurse"><div className="section-heading"><div><h2>Informația potrivită. Alegerea corectă.</h2><p>Resurse utile pentru următorul tău proiect.</p></div></div><div className="resource-grid">{[
        { Icon: BookOpen, title: "Cataloage de produse", text: "Soluții și game de produse, într-un format ușor de consultat.", action: "Vezi cataloagele" },
        { Icon: FileText, title: "Fișe și documente tehnice", text: "Specificații, manuale și documentație pentru montaj.", action: "Găsește documentele" },
        { Icon: Wrench, title: "Ghiduri de alegere", text: "Răspunsuri practice pentru alegerea instalației potrivite.", action: "Explorează ghidurile" },
      ].map(({ Icon, title, text, action }) => <article className="resource" key={title}><Icon /><div><h3>{title}</h3><p>{text}</p><a href="#resurse" onClick={event => { event.preventDefault(); showResource(title); }}>{action}<ArrowRight /></a></div></article>)}</div></section>
      <section className="contact-section" id="contact"><div className="container-wide contact-inner"><div><div className="contact-title"><MapPin /><h2>Online sau direct în depozit.</h2></div><p>Alege ridicarea din depozit și discută cu echipa noastră despre produsele de care ai nevoie.</p><Button variant="outline" onClick={() => setPanel("contact")}>Depozite și contact<ArrowRight /></Button></div><div><h2>Rămâi conectat la aeinstal.</h2><p>Oferte, noutăți și soluții pentru proiectele tale, direct pe email.</p><form className="newsletter-form" onSubmit={event => { event.preventDefault(); setPanel("newsletter"); }}><input type="email" aria-label="Adresa de email pentru newsletter" value={newsletterEmail} onChange={event => setNewsletterEmail(event.target.value)} placeholder="Adresa ta de email" required /><Button variant="brand" type="submit">Abonează-te<ArrowRight /></Button></form><small className="newsletter-note">Prin abonare, ești de acord cu politica de confidențialitate.</small></div></div></section>
    </main>
    <footer className="footer"><div className="container-wide"><div className="footer-grid"><div className="footer-brand"><Logo /><p>Produse pentru instalații.<br />Oameni pentru proiectele tale.</p></div>{[
      { title: "Pentru clienți", items: ["Livrare și ridicare", "Modalități de plată", "Retur produse", "Garanție și service", "Întrebări frecvente"] },
      { title: "Pentru firme", items: ["Creează cont firmă", "Avantaje parteneri", "Comandă rapidă", "Plata la termen", "Cataloage"] },
      { title: "Companie", items: ["Despre aeinstal", "Depozite", "Contact", "Cariere"] },
      { title: "Informații legale", items: ["Termeni și condiții", "Confidențialitate", "Politica de cookie-uri", "ANPC"] },
    ].map(column => <div className="footer-col" key={column.title}><h3>{column.title}</h3>{column.items.map(item => <a key={item} href={item === "Comandă rapidă" ? "#comanda-rapida" : "#contact"} onClick={event => { if (item === "Comandă rapidă") return; event.preventDefault(); if (item === "Creează cont firmă") setPanel("business"); else if (item === "Depozite" || item === "Contact") setPanel("contact"); else showResource(item); }}>{item}</a>)}</div>)}</div><div className="footer-bottom"><span>© 2026 aeinstal. Toate drepturile rezervate.</span><span>Instalații termice · Sanitare · Climatizare · Soluții pentru profesioniști</span></div></div></footer>
    <Dialog open={panel !== null} onOpenChange={open => !open && setPanel(null)}><DialogContent className={panel === "category" ? "max-w-4xl" : ""}><DialogHeader><DialogTitle>{panel === "cart" ? "Coșul meu" : panel === "saved" ? "Produsele salvate" : panel === "business" ? "Devino partener aeinstal" : panel === "login" ? "Bine ai venit la aeinstal" : panel === "import" ? "Importă lista de produse" : panel === "product" ? selectedProduct.name : panel === "category" ? selectedCategory : panel === "contact" ? "Depozite și contact" : panel === "newsletter" ? "Newsletter aeinstal" : resourceTitle}</DialogTitle><DialogDescription>{panel === "cart" ? `${count} produse · prețuri cu TVA` : panel === "category" ? "Previzualizare catalog aeinstal" : "Partenerul proiectelor tale"}</DialogDescription></DialogHeader><div className="dialog-body">
      {panel === "cart" && <>{cart.length ? <>{cart.map(line => <div className="cart-line" key={line.product.id}><img src={line.product.image} alt={line.product.name} width="55" height="55" /><div className="cart-line-content"><b>{line.product.name}</b><small>{line.product.id} · {line.quantity} × {money(line.product.price)} lei</small></div><b className="text-xs">{money(line.quantity * line.product.price)} lei</b><Button size="icon" variant="ghost" aria-label={`Șterge ${line.product.name}`} onClick={() => setCart(current => current.filter(item => item.product.id !== line.product.id))}><Trash2 /></Button></div>)}<div className="dialog-total"><span>Total cu TVA</span><span>{money(total)} lei</span></div><div className="notice">Acesta este un coș demonstrativ. Plata și trimiterea comenzilor vor fi disponibile după conectarea magazinului.</div></> : <div className="empty-state"><ShoppingCart /><p>Coșul tău este gol.</p><Button className="mt-5" variant="brand" onClick={() => { setPanel(null); document.getElementById("promotii")?.scrollIntoView({ behavior: "smooth" }); }}>Descoperă produsele<ArrowRight /></Button></div>}</>}
      {panel === "saved" && <>{saved.length ? products.filter(p => saved.includes(p.id)).map(p => <div className="cart-line" key={p.id}><img src={p.image} alt="" width="55" height="55" /><div className="cart-line-content"><b>{p.name}</b><small>{money(p.price)} lei</small></div><Button size="icon" variant="brand" aria-label={`Adaugă ${p.name}`} onClick={() => addToCart(p)}><Plus /></Button><Button size="icon" variant="ghost" aria-label={`Elimină ${p.name} din listă`} onClick={() => toggleSaved(p.id)}><X /></Button></div>) : <div className="empty-state"><Heart /><p>Nu ai produse salvate încă.</p><p className="mt-2 text-xs">Produsele marcate cu inimă vor apărea aici.</p></div>}</>}
      {panel === "product" && <><img className="dialog-product-image" src={selectedProduct.image} alt={selectedProduct.name} width="512" height="512" /><div className="product-code">Cod: {selectedProduct.id}</div><div className="price-line mt-4"><strong>{money(selectedProduct.price)} <small>lei</small></strong><del>{money(selectedProduct.oldPrice)} lei</del></div><div className="vat-label">cu TVA · preț demonstrativ</div><Button variant="brand" className="mt-5 w-full" onClick={() => addToCart(selectedProduct)}><ShoppingCart />Adaugă în coș</Button><div className="notice">Produs ilustrativ pentru prezentarea designului. Specificațiile, prețul și disponibilitatea se confirmă din catalogul real.</div></>}
      {panel === "category" && <>{categoryProducts.length ? <div className="products-grid pt-4">{categoryProducts.map(productCard)}</div> : <div className="empty-state"><PackageCheck /><p>Categoria este pregătită pentru catalogul real.</p></div>}<div className="notice">Catalog demonstrativ. Filtrele tehnice și gama completă vor fi dezvoltate odată cu pagina de categorie.</div></>}
      {(panel === "business" || panel === "login") && <><div className="notice">{panel === "business" ? "Un cont pentru firma ta: prețuri dedicate, comenzi rapide și liste de produse. Înregistrarea va fi activată la conectarea magazinului." : "Autentificarea și conturile de client nu sunt încă activate în această machetă."}</div><label className="form-field">{panel === "business" ? "CUI firmă" : "Adresa de email"}<input type={panel === "business" ? "text" : "email"} placeholder={panel === "business" ? "RO…" : "nume@firma.ro"} disabled /></label><label className="form-field">{panel === "business" ? "Email de contact" : "Parolă"}<input type={panel === "business" ? "email" : "password"} placeholder={panel === "business" ? "nume@firma.ro" : "••••••••"} disabled /></label><Button variant="brand" className="w-full mt-5" disabled>{panel === "business" ? "Creează cont firmă" : "Autentificare"}</Button>{panel === "login" && <Button variant="link" className="w-full mt-2" onClick={() => setPanel("business")}>Nu ai cont? Creează cont firmă<ArrowRight /></Button>}</>}
      {panel === "import" && <><p className="text-sm leading-7">Exportă lista din Excel ca CSV. Fiecare rând trebuie să conțină codul și cantitatea, separate prin virgulă sau punct și virgulă.</p><pre className="notice">cod;cantitate<br />AE-1001;2<br />AE-1002;10</pre><input ref={fileInput} className="hidden" type="file" accept=".csv,.txt,.tsv" onChange={importCSV} /><Button variant="brand" className="mt-5" onClick={() => fileInput.current?.click()}><Upload />Alege fișierul CSV</Button>{importReport && <p role="status" className="notice">{importReport}</p>}<p className="demo-note">Importul este demonstrativ; produsele sunt adăugate doar în coșul acestei previzualizări.</p></>}
      {panel === "contact" && <><div className="flex items-center gap-3 py-5"><MapPin className="text-primary" /><p className="text-sm">Echipa aeinstal, aproape de proiectul tău.</p></div><div className="notice">Adresele depozitelor, programul, telefonul și emailul vor fi completate cu datele reale ale companiei înainte de publicare.</div></>}
      {panel === "resource" && <><div className="empty-state"><BookOpen /><p>{resourceTitle}</p></div><div className="notice">Această secțiune este rezervată conținutului real aeinstal. Documentele, informațiile și portofoliul de branduri vor fi adăugate înainte de publicare.</div></>}
      {panel === "newsletter" && <><Mail className="mx-auto my-5 h-10 w-10 text-primary" /><div className="notice">Designul formularului este pregătit. Abonarea nu a fost trimisă; serviciul de newsletter va fi conectat înainte de publicare.</div></>}
    </div></DialogContent></Dialog>
    {toast && <div role="status" className="toast-message"><Check />{toast}</div>}
  </>;
}

function ProductCard({ product, saved, onSave, onAdd, onOpen }: { product: Product; saved: boolean; onSave: () => void; onAdd: (quantity: number) => void; onOpen: () => void }) {
  const [quantity, setQuantity] = useState(1);
  return <article className="product-card"><div className="product-top"><span className="discount">−{Math.round((1 - product.price / product.oldPrice) * 100)}%</span><Button variant="ghost" size="icon" className={`product-save ${saved ? "saved" : ""}`} aria-label={`${saved ? "Elimină" : "Salvează"} ${product.name}`} aria-pressed={saved} title="Salvează în listă" onClick={onSave}><Heart fill={saved ? "currentColor" : "none"} /></Button></div><button className="product-image-button" onClick={onOpen} aria-label={`Vezi ${product.name}`}><img className="product-image" src={product.image} alt={product.name} width="512" height="512" loading="lazy" /></button><div className="product-brand">{product.brand}</div><button className="product-title" onClick={onOpen}>{product.name}</button><div className="product-code">Cod: {product.id}</div><div className="stock">În stoc · demonstrativ</div><div className="price-line"><strong>{money(product.price)} <small>lei</small></strong><del>{money(product.oldPrice)}</del></div><div className="vat-label">Preț cu TVA</div><form className="product-buy" onSubmit={event => { event.preventDefault(); onAdd(quantity); }}><input aria-label={`Cantitate ${product.id}`} type="number" min="1" step="1" value={quantity} onChange={event => setQuantity(Number(event.target.value))} required /><Button variant="brand" type="submit"><ShoppingCart />Adaugă în coș</Button></form></article>;
}
