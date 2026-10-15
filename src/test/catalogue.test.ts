import { describe, expect, it } from "vitest";
import { categories } from "@/lib/catalogue";

describe("B2B catalogue structure", () => {
  it("keeps the eleven main installation categories from the specification", () => {
    expect(categories).toHaveLength(11);
    expect(categories.map(category => category.name)).toEqual(expect.arrayContaining([
      "Încălzire", "Climatizare și ventilație", "Pompe de căldură și energie verde",
      "Țevi și fitinguri", "Robinetărie și armături", "Apă: pompe și tratare", "Canalizare",
      "Sanitare și baie", "Gaz, siguranță și antiincendiu", "Scule și consumabile", "Piese de schimb",
    ]));
  });
});