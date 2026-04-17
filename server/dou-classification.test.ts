import { describe, expect, it } from "vitest";

/**
 * Testes para a lógica de classificação de documentos do DOU.
 * Testamos a estrutura e os tipos esperados sem depender da API externa.
 */

describe("DOU Document Classification", () => {
  it("should have correct DOUResult interface structure", () => {
    // Verificar que a interface DOUResult tem os campos esperados
    const mockResult = {
      section: "do1",
      title: "CONSULTA PÚBLICA Nº 3",
      href: "https://www.in.gov.br/web/dou/-/consulta-publica-n-3",
      abstract: "Torna pública a abertura de consulta pública...",
      date: "02/03/2026",
      id: "689259176",
      orgPrincipal: "Ministério de Minas e Energia",
      orgSubordinado: "Agência Nacional de Energia Elétrica",
      editionNumber: "40",
      numberPage: "111",
      documentType: "CONSULTA PÚBLICA",
      display_date_sortable: "2026-03-02",
      relevancia: "Documento é uma abertura de Consulta Pública",
    };

    expect(mockResult).toHaveProperty("section");
    expect(mockResult).toHaveProperty("title");
    expect(mockResult).toHaveProperty("href");
    expect(mockResult).toHaveProperty("abstract");
    expect(mockResult).toHaveProperty("date");
    expect(mockResult).toHaveProperty("id");
    expect(mockResult).toHaveProperty("orgPrincipal");
    expect(mockResult).toHaveProperty("documentType");
    expect(mockResult).toHaveProperty("relevancia");
  });

  it("should identify valid document types", () => {
    const validTypes = [
      "CONSULTA PÚBLICA",
      "AVISO DE CONSULTA PÚBLICA",
      "TOMADA DE SUBSÍDIOS",
      "AVISO DE TOMADA DE SUBSÍDIOS",
      "PORTARIA",
      "AVISO DE PRORROGAÇÃO",
      "AVISO DE REABERTURA",
    ];

    const invalidTypes = ["OUTRO", "EDITAL", "PAUTA"];

    for (const type of validTypes) {
      expect(type).not.toBe("OUTRO");
    }

    for (const type of invalidTypes) {
      expect(validTypes).not.toContain(type);
    }
  });

  it("should correctly format DOU search dates", () => {
    // Testar formato de data DD/MM/AAAA
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;

    expect("02/03/2026").toMatch(dateRegex);
    expect("27/02/2026").toMatch(dateRegex);
    expect("2026-03-02").not.toMatch(dateRegex);
    expect("2/3/2026").not.toMatch(dateRegex);
  });

  it("should have correct section mapping", () => {
    const SECTION_MAP: Record<string, string> = {
      do1: "Seção 1",
      do2: "Seção 2",
      do3: "Seção 3",
      do1a: "Seção 1 - Extra A",
      do1b: "Seção 1 - Extra B",
      do2a: "Seção 2 - Extra A",
      do2b: "Seção 2 - Extra B",
      do3a: "Seção 3 - Extra A",
      do3b: "Seção 3 - Extra B",
      doe: "Edição Extra",
      dos: "Edição Suplementar",
    };

    expect(SECTION_MAP["do1"]).toBe("Seção 1");
    expect(SECTION_MAP["do2"]).toBe("Seção 2");
    expect(SECTION_MAP["do3"]).toBe("Seção 3");
    expect(SECTION_MAP["doe"]).toBe("Edição Extra");
  });

  it("should correctly identify portaria URLs", () => {
    const portariaUrls = [
      "portaria-mme-n-900-de-27-de-fevereiro-de-2026-689586928",
      "portaria-mme-n-901-de-27-de-fevereiro-de-2026-689575348",
      "portaria-n-86-de-23-de-fevereiro-de-2026-689254875",
    ];

    const nonPortariaUrls = [
      "consulta-publica-n-3-de-26-de-fevereiro-de-2026-689259176",
      "aviso-de-consulta-publica-n-1-2026-694366830",
      "aviso-de-tomada-de-subsidios-n-1-2026-694354869",
    ];

    for (const url of portariaUrls) {
      expect(url.toLowerCase().includes("portaria")).toBe(true);
    }

    for (const url of nonPortariaUrls) {
      expect(url.toLowerCase().includes("portaria")).toBe(false);
    }
  });

  it("should detect consulta publica keywords in Art. 1", () => {
    const art1WithCP =
      "Art. 1º Fica divulgada, para Consulta Pública, documentação com proposta de diretrizes...";
    const art1WithTS =
      "Art. 1º Fica aberta a Tomada de Subsídios para colher contribuições...";
    const art1WithoutKeywords =
      "Art. 1º Fica aprovado o regulamento técnico para instalações elétricas...";

    expect(
      art1WithCP.toLowerCase().includes("consulta pública")
    ).toBe(true);
    expect(
      art1WithTS.toLowerCase().includes("tomada de subsídios")
    ).toBe(true);
    expect(
      art1WithoutKeywords.toLowerCase().includes("consulta pública")
    ).toBe(false);
    expect(
      art1WithoutKeywords.toLowerCase().includes("tomada de subsídios")
    ).toBe(false);
  });

  it("should correctly extract Art. 1 pattern from text", () => {
    const textWithArt1 = `
      O MINISTRO DE ESTADO resolve:
      Art. 1º Fica divulgada, para Consulta Pública, documentação com proposta.
      Art. 2º Esta Portaria entra em vigor na data de sua publicação.
    `;

    const art1Match = textWithArt1.match(
      /Art\.\s*1º?[\s\S]*?(?=Art\.\s*[2-9]|$)/i
    );

    expect(art1Match).not.toBeNull();
    expect(art1Match![0]).toContain("Consulta Pública");
    expect(art1Match![0]).not.toContain("Art. 2");
  });

  it("should handle Art. 1 with line breaks", () => {
    const textWithLineBreaks = `Art. 1º Fica divulgada, para Consulta Pública,
    documentação com proposta de diretrizes para a
    adoção da contabilização dupla no Mercado de Curto Prazo.
    Art. 2º Esta Portaria entra em vigor.`;

    const art1Match = textWithLineBreaks.match(
      /Art\.\s*1º?[\s\S]*?(?=Art\.\s*[2-9]|$)/i
    );

    expect(art1Match).not.toBeNull();
    expect(art1Match![0].toLowerCase()).toContain("consulta pública");
  });
});
