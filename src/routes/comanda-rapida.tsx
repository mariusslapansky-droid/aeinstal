import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ArrowRight, CheckCircle2, ChevronRight, ClipboardPaste, Headset, ListChecks, LoaderCircle, Plus, ShoppingCart, Trash2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryHeader } from "@/components/category-header";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QuickOrderRow } from "@/components/quick-order-row";
import { QuickOrderImport } from "@/components/quick-order-import";
import { emptyQuickRows, findQuickProduct, parseQuickText, partitionQuickRows, searchQuickProducts, type QuickProduct, type QuickRow } from "@/lib/quick-order";
import { money } from "@/lib/catalogue";

export const Route = createFileRoute("/comanda-rapida")({
  head: () => ({ meta: [
    { title: "Comandă rapidă după cod · aeinstal" },
    { name: "description", content: "Pregătește lista de materiale aeinstal: caută după cod sau nume, lipește cantități din Excel și previzualizează importul CSV sau XLSX." },
    { property: "og:title", content: "Comandă rapidă după cod · aeinstal" },
    { property: "og:description", content: "Coduri, cantități și materiale într-o singură listă. Comandă rapidă aeinstal pentru profesioniști." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: QuickOrderPage,
});
type CartLine = { product: QuickProduct; quantity: number };
function QuickOrderPage() {
  const [rows, setRows] = useState<QuickRow[]>(() => emptyQuickRows());
  const sequence = useRef(0);
  const [paste, setPaste] = useState("");
  const [pasteMessage, setPasteMessage] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState<{ added: number; problems: number } | null>(null);
  const [dialog, setDialog] = useState<"cart" | "account" | "saved" | "search" | "clear" | null>(null);
  const [search, setSearch] = useState("");
  const { valid, problems } = partitionQuickRows(rows);
  const filled = rows.filter(row => row.code.trim());
  const total = filled.reduce((sum, row) => sum + (findQuickProduct(row.code)?.price ?? 0) * (Number.isFinite(row.quantity) && row.quantity > 0 ? row.quantity : 0), 0);
  const cartTotal = cart.reduce((sum, line) => sum + line.quantity * line.product.price, 0);
  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const uniqueKey = () => `row-${sequence.current++}`;
  const addRow = () => { const key = uniqueKey(); setRows(current => [...current, { key, code: "", quantity: 1, allowBackorder: false }]); };
  const processPaste = () => {
    const parsed = parseQuickText(paste);
    if (!parsed.length) { setPasteMessage("Introdu cel puțin un cod de produs."); return; }
    const keyed = parsed.map(row => ({ ...row, key: uniqueKey() }));
    setRows(current => [...current.filter(row => row.code.trim()), ...keyed]);
    setPaste(""); setPasteMessage(`${parsed.length} poziții procesate. Verifică lista de mai sus.`);
  };
  const addToCart = async (source: QuickRow[], fromTable = false) => {
    const result = partitionQuickRows(source);
    if (!result.valid.length || busy) return result.problems;
    setBusy(true);
    await new Promise(resolve => window.setTimeout(resolve, 650));
    setCart(current => {
      const next = [...current];
      result.valid.forEach(row => {
        const product = findQuickProduct(row.code); if (!product) return;
        const position = next.findIndex(line => line.product.id === product.id);
        const existing = next[position];
        if (existing) next[position] = { ...existing, quantity: existing.quantity + row.quantity };
        else next.push({ product, quantity: row.quantity });
      });
      return next;
    });
    if (fromTable) setRows(result.problems.length ? result.problems : emptyQuickRows());
    setBusy(false); setReport({ added: result.valid.length, problems: result.problems.length });
    return result.problems;
  };
  return <div className="category-page qo-page"><CategoryHeader count={cartCount} total={cartTotal} onCart={() => setDialog("cart")} onSaved={() => setDialog("saved")} onAccount={() => setDialog("account")} onSearch={query => { setSearch(query); setDialog("search"); }} />
    <main className="container-wide qo-main"><div className="category-breadcrumb"><Link to="/">Acasă</Link><ChevronRight /><span>Comandă rapidă</span></div>
      <div className="qo-heading"><div><div className="eyebrow">aeinstal · Pentru profesioniști</div><h1>Comandă rapidă după cod</h1><p>Lista ta de materiale. Pregătită pentru următoarea lucrare.</p></div><span className="qo-heading-label"><Zap />Direct la ce ai nevoie</span></div>
      <div className="qo-list-toolbar"><h2><ListChecks />Lista de produse <span>{filled.length} poziții</span></h2><span className="qo-tax-label">Prețuri standard · cu TVA</span></div>
      <div className="qo-table" role="table" aria-label="Lista de comandă rapidă"><div className="qo-table-head" role="row"><span role="columnheader">Cod produs</span><span role="columnheader">Denumire</span><span role="columnheader">Stoc</span><span role="columnheader">Preț unitar</span><span role="columnheader">Cantitate</span><span role="columnheader">Total</span><span role="columnheader" aria-label="Acțiuni" /></div>
        {rows.map((row, index) => <QuickOrderRow key={row.key} row={row} index={index} onChange={changes => setRows(current => current.map(item => item.key === row.key ? { ...item, ...changes } : item))} onDelete={() => setRows(current => current.length === 1 ? emptyQuickRows(1) : current.filter(item => item.key !== row.key))} onEnter={() => { if (index === rows.length - 1) addRow(); }} />)}
      </div>
      <div className="qo-list-bottom"><Button variant="outline" onClick={addRow}><Plus />Adaugă rând</Button><Button variant="link" className="qo-clear" disabled={!filled.length} onClick={() => setDialog("clear")}><Trash2 />Golește lista</Button></div>
      {!filled.length && <div className="qo-empty-hint"><Zap /><p>Începe cu un cod de produs, de exemplu <b>AE-1001</b>, sau caută după denumire.</p></div>}
      {problems.length > 0 && <div className="qo-validation-note" role="status">{problems.length} {problems.length === 1 ? "poziție necesită" : "poziții necesită"} verificare. Pozițiile valide pot fi adăugate separat.</div>}
      <div className="qo-bulk-grid"><section className="qo-bulk-section"><div className="qo-bulk-heading"><ClipboardPaste /><h2>Lipește coduri din Excel</h2></div><label className="qo-paste-label" htmlFor="qo-paste">Cod produs și cantitate · o poziție pe linie</label><textarea id="qo-paste" value={paste} onChange={event => setPaste(event.target.value)} placeholder={"AE-1001\t2\nAE-1002\t4\nAE-P001\t10"} /><div className="qo-paste-bottom"><span>Cod + cantitate</span><Button variant="brand" disabled={!paste.trim()} onClick={processPaste}>Procesează<ArrowRight /></Button></div>{pasteMessage && <p role="status" className="qo-paste-message">{pasteMessage}</p>}</section><QuickOrderImport busy={busy} onAdd={source => addToCart(source)} /></div>
      <div className="qo-footnote"><span>Catalog, stocuri și ambalare demonstrative · nu se trimite o comandă reală.</span><Link to="/parteneri-b2b"><Headset />Condiții pentru firma ta<ArrowRight /></Link></div>
    </main>
    <div className="qo-sticky"><div className="container-wide qo-sticky-inner"><div className="qo-summary-count"><ShoppingCart /><span><b>{filled.length} {filled.length === 1 ? "produs" : "produse"}</b><small>{valid.length} poziții valide</small></span></div><div className="qo-summary-total"><small>Total cu TVA</small><b>{money(total)} <span>lei</span></b></div><Button variant="brand" disabled={!valid.length || busy} onClick={() => void addToCart(rows, true)}>{busy ? <LoaderCircle className="registration-spinner" /> : <ShoppingCart />}{busy ? "Se adaugă…" : "Adaugă tot în coș"}</Button></div></div>
    <footer className="footer category-footer"><div className="container-wide"><Link to="/" className="logo"><span className="logo-name"><span>ae</span>instal<span>.</span></span><span className="logo-tagline">Partenerul proiectelor tale</span></Link><div><Link to="/categorie/$slug" params={{ slug: "tevi-si-fitinguri" }}>Catalog produse</Link><Link to="/parteneri-b2b">Parteneri B2B</Link></div><span>© 2026 aeinstal</span></div></footer>
    {report && <div className="qo-success-toast" role="status"><CheckCircle2 /><div><b>{report.added} {report.added === 1 ? "produs adăugat" : "produse adăugate"}</b>{report.problems > 0 && <p>{report.problems} coduri cu probleme. Au rămas în listă.</p>}<div><Button variant="link" onClick={() => { setReport(null); setDialog("cart"); }}>Mergi la coș<ArrowRight /></Button><Button variant="ghost" onClick={() => setReport(null)}>Continuă</Button></div></div></div>}
    <Dialog open={dialog !== null} onOpenChange={open => { if (!open) setDialog(null); }}><DialogContent><DialogHeader><DialogTitle>{dialog === "cart" ? "Coșul meu" : dialog === "clear" ? "Golești lista de produse?" : dialog === "search" ? "Rezultate în catalog" : dialog === "saved" ? "Liste salvate" : "Contul meu"}</DialogTitle><DialogDescription>{dialog === "cart" ? `${cart.length} poziții · prețuri standard cu TVA` : "aeinstal · Partenerul proiectelor tale"}</DialogDescription></DialogHeader><div className="dialog-body">
      {dialog === "cart" && <>{cart.length ? cart.map(line => <div className="cart-line" key={line.product.id}><img src={line.product.image} alt={line.product.name} width={55} height={55} /><div className="cart-line-content"><b>{line.product.name}</b><small>{line.product.id} · {line.quantity} × {money(line.product.price)} lei</small></div><b>{money(line.quantity * line.product.price)} lei</b><Button size="icon" variant="ghost" title="Elimină produsul" aria-label={`Elimină ${line.product.id} din coș`} onClick={() => setCart(current => current.filter(item => item.product.id !== line.product.id))}><Trash2 /></Button></div>) : <div className="empty-state"><ShoppingCart /><p>Coșul tău este gol.</p></div>}<div className="dialog-total"><span>Total cu TVA</span><span>{money(cartTotal)} lei</span></div><p className="notice">Coș demonstrativ. Plata și trimiterea comenzilor nu sunt activate.</p></>}
      {dialog === "clear" && <><p>Produsele din listă vor fi eliminate. Coșul rămâne neschimbat.</p><div className="qo-modal-actions"><Button variant="outline" onClick={() => setDialog(null)}>Anulează</Button><Button variant="destructive" onClick={() => { setRows(emptyQuickRows()); setDialog(null); setPasteMessage(""); }}>Golește lista</Button></div></>}
      {dialog === "search" && <>{searchQuickProducts(search).map(product => <Link className="qo-search-link" key={product.id} to="/produs/$productId" params={{ productId: product.id }}><img src={product.image} width={45} height={45} alt="" /><span>{product.name}<small>{product.id}</small></span><b>{money(product.price)} lei</b></Link>)}{!searchQuickProducts(search).length && <p>Niciun produs găsit.</p>}</>}
      {(dialog === "account" || dialog === "saved") && <p className="notice">{dialog === "account" ? "Autentificarea nu este activată în această machetă." : "Listele salvate sunt demonstrative în această machetă."}</p>}
    </div></DialogContent></Dialog>
  </div>;
}
