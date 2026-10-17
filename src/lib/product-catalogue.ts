import { categories } from "./catalogue";
import { categorySlug, getCategoryProducts, type CategoryProduct } from "./category-catalogue";

export type DetailProduct = CategoryProduct & { category: string; categorySlug: string };
export const detailProducts: DetailProduct[] = categories.flatMap(category => getCategoryProducts(category.name).map(product => ({ ...product, category: category.name, categorySlug: categorySlug(category.name) })));
export function getProduct(id: string) { return detailProducts.find(product => product.id === id); }
export function getProductVariants(product: DetailProduct) {
  return product.diameter ? detailProducts.filter(item => item.category === product.category && item.image === product.image && item.material === product.material) : [];
}
export function getRelatedProducts(product: DetailProduct) {
  return detailProducts.filter(item => item.category === product.category && item.id !== product.id && item.image !== product.image).slice(0, 4);
}
export function getProductSpecs(product: DetailProduct) {
  return [
    ["Cod produs", product.id], ["Categorie", product.category], ["Gamă", product.brand],
    ["Material", product.material], ["Diametru", product.diameter], ["Tip îmbinare", product.connection], ["Unitate de vânzare", product.unit],
  ].filter(([, value]) => Boolean(value));
}