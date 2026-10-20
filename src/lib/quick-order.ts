import Papa from "papaparse";
import { products } from "./catalogue";
import { detailProducts } from "./product-catalogue";

export type QuickProduct = { id: string; name: string; image: string; price: number; unit: string; available: number; minimum: number; pack: number };
// Quantities and packaging below are illustrative, not commercial conditions.
export const quickProducts: QuickProduct[] = [...products.map(product => ({ ...product, unit: product.id === "AE-1003" ? "metru" : "buc.", stock: true })), ...detailProducts]
  .filter((product, index, all) => all.findIndex(item => item.id === product.id) === index)
  .map(product => ({ id: product.id, name: product.name, image: product.image, price: product.price, unit: product.unit,
    available: !product.stock ? 0 : product.id === "AE-1002" ? 4 : 120,
    minimum: product.id === "AE-P001" ? 10 : 1, pack: product.id === "AE-P001" ? 10 : 1 }));
export type QuickRow = { key: string; code: string; quantity: number; allowBackorder: boolean };
export function emptyQuickRows(count = 5): QuickRow[] {
  return Array.from({ length: count }, (_, index) => ({ key: `empty-${index}`, code: "", quantity: 1, allowBackorder: false }));
}
export function findQuickProduct(code: string) { return quickProducts.find(product => product.id.toUpperCase() === code.trim().toUpperCase()); }
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
export function searchQuickProducts(query: string) {
  const term = normalize(query.trim());
  return term ? quickProducts.filter(product => normalize(`${product.id} ${product.name}`).includes(term)).slice(0, 5) : [];
}
export function similarQuickProducts(code: string) {
  const term = code.trim().toUpperCase();
  const prefix = term.slice(0, -1);
  return prefix.length >= 3 ? quickProducts.filter(product => product.id.startsWith(prefix) && product.id !== term).slice(0, 3) : [];
}
export function validateQuickRow(row: QuickRow): { kind: "empty" | "unknown" | "quantity" | "pack" | "stock" | "valid"; message: string } {
  if (!row.code.trim()) return { kind: "empty", message: "" };
  const product = findQuickProduct(row.code);
  if (!product) return { kind: "unknown", message: "Codul nu există" };
  if (!Number.isInteger(row.quantity) || row.quantity < 1) return { kind: "quantity", message: "Introdu o cantitate întreagă, mai mare decât 0." };
  if (row.quantity < product.minimum || row.quantity % product.pack !== 0) return { kind: "pack", message: `Minim ${product.minimum} ${product.unit} · multiplu de ${product.pack}` };
  if (row.quantity > product.available && !row.allowBackorder) return { kind: "stock", message: `Disponibil: ${product.available} ${product.unit}` };
  return { kind: "valid", message: row.allowBackorder && row.quantity > product.available ? "Diferența se comandă la furnizor · demonstrativ" : "" };
}
export function parseQuickCells(cells: unknown[][]): QuickRow[] {
  return cells.filter(cells => String(cells[0] ?? "").trim()).filter(cells => !["cod", "cod produs", "code"].includes(normalize(String(cells[0]).trim())))
    .map((cells, index) => ({ key: `import-${index}`, code: String(cells[0] ?? "").trim().toUpperCase(), quantity: cells[1] === undefined || cells[1] === "" ? 1 : Number(cells[1]), allowBackorder: false }));
}
export function parseQuickText(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (!/[;,\t]/.test(trimmed)) return parseQuickCells(trimmed.split(/\r?\n/).map(line => line.trim().split(/\s+/)));
  return parseQuickCells(Papa.parse<string[]>(trimmed, { skipEmptyLines: "greedy" }).data);
}
export function partitionQuickRows(rows: QuickRow[]) {
  return { valid: rows.filter(row => validateQuickRow(row).kind === "valid"), problems: rows.filter(row => !["valid", "empty"].includes(validateQuickRow(row).kind)) };
}