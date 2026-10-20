import { useState } from "react";
import { Check, ChevronDown, Minus, Plus, Search, Trash2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/catalogue";
import { findQuickProduct, searchQuickProducts, similarQuickProducts, validateQuickRow, type QuickRow } from "@/lib/quick-order";

export function QuickOrderRow({ row, index, onChange, onDelete, onEnter }: { row: QuickRow; index: number; onChange: (changes: Partial<QuickRow>) => void; onDelete: () => void; onEnter: () => void }) {
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(0);
  const product = findQuickProduct(row.code);
  const state = validateQuickRow(row);
  const matches = searchQuickProducts(row.code);
  const suggestions = state.kind === "unknown" ? similarQuickProducts(row.code) : [];
  const dropdown = focused && matches.length > 0;
  const selectCode = (code: string) => { onChange({ code, allowBackorder: false }); setFocused(false); };
  const warning = ["stock", "pack"].includes(state.kind);
  const error = ["unknown", "quantity"].includes(state.kind) && !dropdown;
  return <div className={`qo-row${warning ? " qo-row-warning" : ""}${error ? " qo-row-error" : ""}`} role="row">
    <div className="qo-code" role="cell"><span className="qo-row-number">{String(index + 1).padStart(2, "0")}</span><div className="qo-code-field"><div className="qo-code-input"><input aria-label={`Cod produs rând ${index + 1}`} role="combobox" aria-expanded={dropdown} aria-controls={`qo-options-${row.key}`} aria-autocomplete="list" aria-activedescendant={dropdown ? `qo-option-${row.key}-${active}` : undefined} autoComplete="off" value={row.code} placeholder="Ex. AE-1001" onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onChange={event => { onChange({ code: event.target.value, allowBackorder: false }); setFocused(true); setActive(0); }} onKeyDown={event => {
      if (event.key === "Escape") setFocused(false);
      if (event.key === "ArrowDown") { event.preventDefault(); setFocused(true); setActive(current => Math.min(current + 1, matches.length - 1)); }
      if (event.key === "ArrowUp") { event.preventDefault(); setActive(current => Math.max(0, current - 1)); }
      if (event.key === "Enter") { event.preventDefault(); if (dropdown) { const match = matches[active]; if (match) selectCode(match.id); } onEnter(); }
    }} />{product ? <Check className="text-success" /> : <Search />}</div>
    {dropdown && <div className="qo-autocomplete" id={`qo-options-${row.key}`} role="listbox" aria-label="Produse sugerate">{matches.map((match, position) => <Button key={match.id} id={`qo-option-${row.key}-${position}`} role="option" aria-selected={position === active} variant="ghost" className="qo-option" onMouseDown={event => event.preventDefault()} onClick={() => selectCode(match.id)}><img src={match.image} alt="" width={40} height={40} /><span><b>{match.id}</b><span>{match.name}</span><small className={match.available > 0 ? "text-success" : "text-destructive"}>{match.available > 0 ? `În stoc · ${match.available} ${match.unit}` : "La comandă"}</small></span><strong>{money(match.price)} lei</strong></Button>)}</div>}
    </div></div>
    <div className="qo-name" role="cell">{product ? <><img src={product.image} alt={product.name} width={42} height={42} /><span>{product.name}<small>{product.unit}</small></span></> : <span className="qo-dash">—</span>}</div>
    <div className="qo-stock" role="cell"><span className="qo-mobile-label">Stoc</span>{product ? <span className={product.available > 0 ? "text-success" : "text-muted-foreground"}>{product.available > 0 ? `${product.available} ${product.unit}` : "La comandă"}</span> : "—"}</div>
    <div className="qo-price" role="cell"><span className="qo-mobile-label">Preț unitar</span>{product ? `${money(product.price)} lei` : "—"}</div>
    <div className="qo-quantity" role="cell"><span className="qo-mobile-label">Cantitate</span><div className="quantity-stepper"><Button variant="ghost" size="icon" aria-label={`Scade cantitatea rând ${index + 1}`} disabled={row.quantity <= 1} onClick={() => onChange({ quantity: Math.max(1, row.quantity - (product?.pack ?? 1)) })}><Minus /></Button><input aria-label={`Cantitate rând ${index + 1}`} type="number" min="1" step="1" value={Number.isFinite(row.quantity) ? row.quantity : ""} onChange={event => onChange({ quantity: Number(event.target.value) })} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); onEnter(); } }} /><Button variant="ghost" size="icon" aria-label={`Crește cantitatea rând ${index + 1}`} onClick={() => onChange({ quantity: (Number.isFinite(row.quantity) ? row.quantity : 0) + (product?.pack ?? 1) })}><Plus /></Button></div></div>
    <div className="qo-total" role="cell"><span className="qo-mobile-label">Total</span>{product && Number.isFinite(row.quantity) ? `${money(product.price * row.quantity)} lei` : "—"}</div>
    <div className="qo-delete" role="cell"><Button variant="ghost" size="icon" title="Șterge rândul" aria-label={`Șterge rând ${index + 1}`} onClick={onDelete}><Trash2 /></Button></div>
    {state.message && !dropdown && <div className={`qo-row-message${error ? " is-error" : ""}`} role={state.kind === "valid" ? "status" : "alert"}><TriangleAlert /><span>{state.message}</span>{state.kind === "stock" && <><Button variant="link" onClick={() => onChange({ quantity: product?.available ?? 1 })} disabled={!product?.available}>Ajustează</Button><Button variant="link" onClick={() => onChange({ allowBackorder: true })}>Comandă oricum</Button></>}{state.kind === "pack" && product && <Button variant="link" onClick={() => onChange({ quantity: Math.max(product.minimum, Math.ceil(row.quantity / product.pack) * product.pack) })}>Ajustează</Button>}{suggestions.length > 0 && <span className="qo-suggestions">Ai vrut să scrii? {suggestions.map(item => <Button key={item.id} variant="link" onClick={() => selectCode(item.id)}>{item.id}</Button>)}</span>}</div>}
  </div>;
}