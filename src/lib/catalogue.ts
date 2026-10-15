import boiler from "@/assets/boiler.jpg";
import climate from "@/assets/climate.jpg";
import fittings from "@/assets/fittings.jpg";
import faucet from "@/assets/faucet.jpg";
import pump from "@/assets/pump.jpg";
import valve from "@/assets/valve.jpg";
import pipe from "@/assets/pipe.jpg";
import radiator from "@/assets/radiator.jpg";

export const categories = [
  { name: "Încălzire", image: boiler, items: ["Centrale termice", "Calorifere și radiatoare", "Încălzire în pardoseală", "Boilere și puffere"] },
  { name: "Climatizare și ventilație", image: climate, items: ["Aer condiționat", "Ventilație și recuperatoare", "Ventiloconvectoare", "Accesorii climatizare"] },
  { name: "Țevi și fitinguri", image: fittings, items: ["Țevi și fitinguri PPR", "PEX și multistrat", "Cupru și alamă", "Sisteme de prindere"] },
  { name: "Sanitare și baie", image: faucet, items: ["Baterii și seturi de duș", "Obiecte sanitare", "Cadre de încastrare", "Mobilier și accesorii"] },
  { name: "Pompe de căldură și energie verde", image: climate, items: ["Pompe de căldură", "Panouri solare", "Fotovoltaice", "Invertoare și baterii"] },
  { name: "Robinetărie și armături", image: valve, items: ["Robineți", "Distribuitoare", "Supape", "Filtre și separatoare"] },
  { name: "Apă: pompe și tratare", image: pump, items: ["Hidrofoare", "Pompe submersibile", "Filtrare", "Irigații"] },
  { name: "Canalizare", items: ["Canalizare interioară", "Canalizare exterioară", "Sifoane și rigole", "Fose septice"] },
  { name: "Gaz, siguranță și antiincendiu", items: ["Robineți gaz", "Detectoare", "Electrovane", "Hidranți"] },
  { name: "Scule și consumabile", items: ["Scule de presare", "Sudură PPR", "Pompe de testare", "Etanșare"] },
  { name: "Piese de schimb", items: ["Centrale și cazane", "Pompe", "Robineți", "Baterii și rezervoare"] },
];

export const products = [
  { id: "AE-1001", name: "Pompă de circulație 25-60, 180 mm", brand: "Instalații termice", image: pump, price: 349, oldPrice: 419, category: "Încălzire" },
  { id: "AE-1002", name: 'Robinet cu bilă, filet interior 1/2”', brand: "Robinetărie", image: valve, price: 24.9, oldPrice: 32.5, category: "Robinetărie și armături" },
  { id: "AE-1003", name: "Țeavă PEX pentru pardoseală, 16 × 2 mm", brand: "Încălzire în pardoseală", image: pipe, price: 4.59, oldPrice: 5.7, category: "Țevi și fitinguri" },
  { id: "AE-1004", name: "Radiator panou din oțel, tip 22, 600 × 1000", brand: "Instalații termice", image: radiator, price: 389, oldPrice: 469, category: "Încălzire" },
  { id: "AE-1005", name: "Centrală termică în condensare, 24 kW", brand: "Încălzire", image: boiler, price: 3290, oldPrice: 3590, category: "Încălzire" },
  { id: "AE-1006", name: "Set fitinguri PPR, diametru 20 mm", brand: "Țevi și fitinguri", image: fittings, price: 15.9, oldPrice: 19.9, category: "Țevi și fitinguri" },
  { id: "AE-1007", name: "Baterie monocomandă pentru lavoar", brand: "Sanitare și baie", image: faucet, price: 249, oldPrice: 299, category: "Sanitare și baie" },
  { id: "AE-1008", name: "Sistem de aer condiționat, 12.000 BTU", brand: "Climatizare", image: climate, price: 2190, oldPrice: 2490, category: "Climatizare și ventilație" },
];
export type Product = typeof products[number];
export const money = (amount: number) => new Intl.NumberFormat("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);