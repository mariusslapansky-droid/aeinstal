import elbow from "@/assets/ppr_elbow.jpg";
import tee from "@/assets/ppr_tee.jpg";
import copper from "@/assets/copper_elbow.jpg";
import brass from "@/assets/brass_coupling.jpg";
import pipe from "@/assets/pipe.jpg";
import fittings from "@/assets/fittings.jpg";
import { categories, products } from "./catalogue";

export const categorySlug = (name: string) => name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export type CategoryProduct = {
  id: string; name: string; image: string; price: number; oldPrice?: number | undefined;
  material: string; diameter: string; connection: string; brand: string;
  stock: boolean; type: string; unit: string;
};
const families = [
  { name: "Cot PPR 90°", image: elbow, material: "PPR", connection: "Sudură", type: "Fitinguri PPR", price: 1.8 },
  { name: "Teu egal PPR", image: tee, material: "PPR", connection: "Sudură", type: "Fitinguri PPR", price: 2.6 },
  { name: "Cot cupru 90°", image: copper, material: "Cupru", connection: "Lipire", type: "Cupru", price: 6.9 },
  { name: "Niplu alamă, filet exterior", image: brass, material: "Alamă", connection: "Filet", type: "Alamă", price: 8.5 },
  { name: "Țeavă PEX 16 × 2 mm", image: pipe, material: "PEX", connection: "Presare", type: "PEX și multistrat", price: 4.59 },
  { name: "Mufă PPR", image: fittings, material: "PPR", connection: "Sudură", type: "Fitinguri PPR", price: 1.4 },
] as const;
export const pipeProducts: CategoryProduct[] = Array.from({ length: 32 }, (_, index) => {
  const family = families[index % families.length] ?? families[0];
  const diameter = ["20 mm", "25 mm", "32 mm", "40 mm"][Math.floor(index / 6) % 4] ?? "20 mm";
  const price = Math.round((family.price + Math.floor(index / 6) * 1.25) * 100) / 100;
  return { id: `AE-P${String(index + 1).padStart(3, "0")}`, name: `${family.name}${family.material === "PEX" ? "" : `, ${diameter}`}`, image: family.image, price,
    oldPrice: index % 4 === 0 ? Math.round(price * 1.22 * 100) / 100 : undefined,
    material: family.material, diameter, connection: family.connection, brand: index % 3 === 0 ? "Gama profesională" : "Gama standard",
    stock: index % 7 !== 6, type: family.type, unit: family.material === "PEX" ? "metru" : "buc." };
});
export function getCategory(slug: string) {
  return categories.find(category => categorySlug(category.name) === slug);
}
export function getCategoryProducts(name: string): CategoryProduct[] {
  if (name === "Țevi și fitinguri") return pipeProducts;
  return products.filter(product => product.category === name).map(product => ({ ...product, material: "", diameter: "", connection: "", stock: true, type: product.brand, unit: "buc." }));
}
export type Filters = { material: string[]; diameter: string[]; connection: string[]; brand: string[]; inStock: boolean; min: string; max: string; query: string; type: string };
export const emptyFilters: Filters = { material: [], diameter: [], connection: [], brand: [], inStock: false, min: "", max: "", query: "", type: "" };
export function filterCategoryProducts(items: CategoryProduct[], filters: Filters, sort: string) {
  const result = items.filter(item =>
    (["material", "diameter", "connection", "brand"] as const).every(key => filters[key].length === 0 || filters[key].includes(item[key])) &&
    (!filters.inStock || item.stock) && (!filters.min || item.price >= Number(filters.min)) && (!filters.max || item.price <= Number(filters.max)) &&
    (!filters.type || item.type === filters.type) && `${item.name} ${item.id}`.toLowerCase().includes(filters.query.toLowerCase()));
  return result.sort((a,b) => sort === "price-up" ? a.price - b.price : sort === "price-down" ? b.price - a.price : sort === "name" ? a.name.localeCompare(b.name,"ro") : sort === "stock" ? Number(b.stock)-Number(a.stock) : 0);
}
export const pageSizes = [24, 48, 96] as const;