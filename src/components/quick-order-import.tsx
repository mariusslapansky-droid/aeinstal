import { useRef, useState } from "react";
import { CheckCircle2, Download, FileSpreadsheet, LoaderCircle, Upload, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { findQuickProduct, parseQuickCells, parseQuickText, partitionQuickRows, validateQuickRow, type QuickRow } from "@/lib/quick-order";
import { money } from "@/lib/catalogue";

export function QuickOrderImport({ onAdd, busy }: { onAdd: (rows: QuickRow[]) => Promise<QuickRow[]>; busy: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<QuickRow[] | null>(null);
  const [filename, setFilename] = useState("");
  const loadFile = async (file: File | undefined) => {
    if (!file) return;
    setError(""); setReading(true);
    try {
      let rows: QuickRow[];
      if (/\.xlsx$/i.test(file.name)) {
        const { default: readXlsxFile } = await import("read-excel-file/browser");
        rows = parseQuickCells(await readXlsxFile(file));
      } else if (/\.csv$/i.test(file.name)) rows = parseQuickText(await file.text());
      else throw new Error("Alege un fișier CSV sau XLSX.");
      if (!rows.length) throw new Error("Fișierul nu conține coduri de produs.");
      setFilename(file.name); setPreview(rows);
    } catch (error) { setError(error instanceof Error ? error.message : "Fișierul nu poate fi citit."); }
    finally { setReading(false); if (input.current) input.current.value = ""; }
  };
  const downloadTemplate = () => {
    const url = URL.createObjectURL(new Blob(["\uFEFFcod;cantitate\r\nAE-1001;2\r\nAE-1002;4\r\nAE-P001;10\r\n"], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "aeinstal-model-comanda.csv"; anchor.click(); URL.revokeObjectURL(url);
  };
  const validCount = preview ? partitionQuickRows(preview).valid.length : 0;
  return <section className="qo-bulk-section"><div className="qo-bulk-heading"><FileSpreadsheet /><h2>Importă lista de materiale</h2><span className="qo-phase">Etapa 2</span></div>
    <div className={`qo-dropzone${dragging ? " is-dragging" : ""}`} onDragOver={event => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={event => { event.preventDefault(); setDragging(false); void loadFile(event.dataTransfer.files[0]); }}>
      {reading ? <LoaderCircle className="registration-spinner" /> : <Upload />}<b>{reading ? "Se citește fișierul…" : "Trage aici fișierul CSV sau XLSX"}</b><span>sau</span><Button variant="outline" disabled={reading} onClick={() => input.current?.click()}><FileSpreadsheet />Alege fișierul</Button><input ref={input} type="file" accept=".csv,.xlsx" aria-label="Importă fișier CSV sau XLSX" className="hidden" onChange={event => void loadFile(event.target.files?.[0])} />
    </div><Button variant="link" className="qo-download" onClick={downloadTemplate}><Download />Descarcă fișierul model</Button>{error && <p role="alert" className="form-error">{error}</p>}
    <Dialog open={preview !== null} onOpenChange={open => { if (!open && !busy) setPreview(null); }}><DialogContent className="qo-import-dialog"><DialogHeader><DialogTitle>Previzualizare import</DialogTitle><DialogDescription>{filename} · {validCount} poziții valide, {(preview?.length ?? 0) - validCount} cu probleme</DialogDescription></DialogHeader><div className="qo-import-preview">{preview?.map(row => {
      const product = findQuickProduct(row.code); const status = validateQuickRow(row); const valid = status.kind === "valid";
      return <div className={`qo-preview-line${valid ? " is-valid" : " is-invalid"}`} key={row.key}>{valid ? <CheckCircle2 /> : <XCircle />}<span><b>{row.code}</b><span>{product?.name ?? "Cod nerecunoscut"}</span>{!valid && <small>{status.message}</small>}</span><strong>{Number.isFinite(row.quantity) ? row.quantity : "—"} {product?.unit ?? "buc."}</strong><b>{product && Number.isFinite(row.quantity) ? `${money(row.quantity * product.price)} lei` : "—"}</b></div>;
    })}</div><div className="qo-modal-actions"><Button variant="outline" disabled={busy} onClick={() => setPreview(null)}>Anulează</Button><Button variant="brand" disabled={!validCount || busy} onClick={async () => { if (!preview) return; const problems = await onAdd(preview); setPreview(problems.length ? problems : null); }}>{busy ? <LoaderCircle className="registration-spinner" /> : <CheckCircle2 />}Adaugă cele valide în coș</Button></div><p className="demo-note">Import și coș demonstrative. Nu se trimite o comandă reală.</p></DialogContent></Dialog>
  </section>;
}
