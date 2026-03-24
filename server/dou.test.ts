import { describe, expect, it } from "vitest";

describe("DOU search router", () => {
  it("validates date format DD/MM/YYYY", () => {
    const validDate = /^\d{2}\/\d{2}\/\d{4}$/;
    expect(validDate.test("24/03/2026")).toBe(true);
    expect(validDate.test("2026-03-24")).toBe(false);
    expect(validDate.test("")).toBe(false);
  });

  it("strips HTML tags from content", () => {
    const stripHtml = (str: string) => str.replace(/<[^>]*>/g, "");
    const input = 'AVISO DE <span class="highlight">CONSULTA</span> <span class="highlight">PÚBLICA</span> Nº 1/2026';
    const expected = "AVISO DE CONSULTA PÚBLICA Nº 1/2026";
    expect(stripHtml(input)).toBe(expected);
  });

  it("maps section codes to labels", () => {
    const SECTION_MAP: Record<string, string> = {
      do1: "Seção 1",
      do2: "Seção 2",
      do3: "Seção 3",
    };
    expect(SECTION_MAP["do1"]).toBe("Seção 1");
    expect(SECTION_MAP["do3"]).toBe("Seção 3");
    expect(SECTION_MAP["unknown"]).toBeUndefined();
  });
});
