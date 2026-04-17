import { describe, it, expect } from "vitest";

/**
 * Testes para combinação de múltiplos filtros client-side
 * Simula o comportamento de filtrar por órgão + tipo de documento + seção
 */

describe("Filtros Combinados - Lógica de Filtragem Múltipla", () => {
  it("deve filtrar por órgão E tipo de documento", () => {
    const results = [
      { orgPrincipal: "MME", documentType: "CONSULTA PÚBLICA", section: "DO1", id: "1" },
      { orgPrincipal: "MME", documentType: "PORTARIA", section: "DO1", id: "2" },
      { orgPrincipal: "ANEEL", documentType: "CONSULTA PÚBLICA", section: "DO2", id: "3" },
    ];

    const selectedOrgao = "MME";
    const selectedDocumentTypes = new Set(["CONSULTA PÚBLICA"]);

    const filtered = results.filter((r) => {
      if (selectedOrgao && r.orgPrincipal !== selectedOrgao) return false;
      if (selectedDocumentTypes.size > 0 && !selectedDocumentTypes.has(r.documentType)) return false;
      return true;
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("1");
  });

  it("deve filtrar por órgão E seção", () => {
    const results = [
      { orgPrincipal: "MME", documentType: "CONSULTA PÚBLICA", section: "DO1", id: "1" },
      { orgPrincipal: "MME", documentType: "PORTARIA", section: "DO2", id: "2" },
      { orgPrincipal: "ANEEL", documentType: "CONSULTA PÚBLICA", section: "DO1", id: "3" },
    ];

    const selectedOrgao = "MME";
    const selectedSections = new Set(["DO1"]);

    const filtered = results.filter((r) => {
      if (selectedOrgao && r.orgPrincipal !== selectedOrgao) return false;
      if (selectedSections.size > 0 && !selectedSections.has(r.section)) return false;
      return true;
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("1");
  });

  it("deve filtrar por tipo de documento E seção", () => {
    const results = [
      { orgPrincipal: "MME", documentType: "CONSULTA PÚBLICA", section: "DO1", id: "1" },
      { orgPrincipal: "MME", documentType: "CONSULTA PÚBLICA", section: "DO2", id: "2" },
      { orgPrincipal: "ANEEL", documentType: "PORTARIA", section: "DO1", id: "3" },
    ];

    const selectedDocumentTypes = new Set(["CONSULTA PÚBLICA"]);
    const selectedSections = new Set(["DO1"]);

    const filtered = results.filter((r) => {
      if (selectedDocumentTypes.size > 0 && !selectedDocumentTypes.has(r.documentType)) return false;
      if (selectedSections.size > 0 && !selectedSections.has(r.section)) return false;
      return true;
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("1");
  });

  it("deve filtrar por órgão E tipo de documento E seção", () => {
    const results = [
      { orgPrincipal: "MME", documentType: "CONSULTA PÚBLICA", section: "DO1", id: "1" },
      { orgPrincipal: "MME", documentType: "CONSULTA PÚBLICA", section: "DO2", id: "2" },
      { orgPrincipal: "MME", documentType: "PORTARIA", section: "DO1", id: "3" },
      { orgPrincipal: "ANEEL", documentType: "CONSULTA PÚBLICA", section: "DO1", id: "4" },
    ];

    const selectedOrgao = "MME";
    const selectedDocumentTypes = new Set(["CONSULTA PÚBLICA"]);
    const selectedSections = new Set(["DO1"]);

    const filtered = results.filter((r) => {
      if (selectedOrgao && r.orgPrincipal !== selectedOrgao) return false;
      if (selectedDocumentTypes.size > 0 && !selectedDocumentTypes.has(r.documentType)) return false;
      if (selectedSections.size > 0 && !selectedSections.has(r.section)) return false;
      return true;
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("1");
  });

  it("deve permitir múltiplos tipos de documento", () => {
    const results = [
      { orgPrincipal: "MME", documentType: "CONSULTA PÚBLICA", section: "DO1", id: "1" },
      { orgPrincipal: "MME", documentType: "PORTARIA", section: "DO1", id: "2" },
      { orgPrincipal: "MME", documentType: "AVISO", section: "DO1", id: "3" },
    ];

    const selectedDocumentTypes = new Set(["CONSULTA PÚBLICA", "PORTARIA"]);

    const filtered = results.filter((r) => {
      if (selectedDocumentTypes.size > 0 && !selectedDocumentTypes.has(r.documentType)) return false;
      return true;
    });

    expect(filtered).toHaveLength(2);
    expect(filtered.map((r) => r.id)).toEqual(["1", "2"]);
  });

  it("deve permitir múltiplas seções", () => {
    const results = [
      { orgPrincipal: "MME", documentType: "CONSULTA PÚBLICA", section: "DO1", id: "1" },
      { orgPrincipal: "MME", documentType: "CONSULTA PÚBLICA", section: "DO2", id: "2" },
      { orgPrincipal: "MME", documentType: "CONSULTA PÚBLICA", section: "DO3", id: "3" },
    ];

    const selectedSections = new Set(["DO1", "DO2"]);

    const filtered = results.filter((r) => {
      if (selectedSections.size > 0 && !selectedSections.has(r.section)) return false;
      return true;
    });

    expect(filtered).toHaveLength(2);
    expect(filtered.map((r) => r.id)).toEqual(["1", "2"]);
  });

  it("deve retornar lista vazia quando nenhum resultado corresponde a todos os filtros", () => {
    const results = [
      { orgPrincipal: "MME", documentType: "CONSULTA PÚBLICA", section: "DO1", id: "1" },
      { orgPrincipal: "ANEEL", documentType: "PORTARIA", section: "DO2", id: "2" },
    ];

    const selectedOrgao = "MME";
    const selectedDocumentTypes = new Set(["PORTARIA"]);
    const selectedSections = new Set(["DO2"]);

    const filtered = results.filter((r) => {
      if (selectedOrgao && r.orgPrincipal !== selectedOrgao) return false;
      if (selectedDocumentTypes.size > 0 && !selectedDocumentTypes.has(r.documentType)) return false;
      if (selectedSections.size > 0 && !selectedSections.has(r.section)) return false;
      return true;
    });

    expect(filtered).toHaveLength(0);
  });

  it("deve retornar todos os resultados quando nenhum filtro está ativo", () => {
    const results = [
      { orgPrincipal: "MME", documentType: "CONSULTA PÚBLICA", section: "DO1", id: "1" },
      { orgPrincipal: "ANEEL", documentType: "PORTARIA", section: "DO2", id: "2" },
      { orgPrincipal: "Saúde", documentType: "AVISO", section: "DO3", id: "3" },
    ];

    const selectedOrgao = null;
    const selectedDocumentTypes = new Set<string>();
    const selectedSections = new Set<string>();

    const filtered = results.filter((r) => {
      if (selectedOrgao && r.orgPrincipal !== selectedOrgao) return false;
      if (selectedDocumentTypes.size > 0 && !selectedDocumentTypes.has(r.documentType)) return false;
      if (selectedSections.size > 0 && !selectedSections.has(r.section)) return false;
      return true;
    });

    expect(filtered).toHaveLength(3);
  });

  it("deve manter a ordem original dos resultados após filtro", () => {
    const results = [
      { orgPrincipal: "MME", documentType: "CONSULTA PÚBLICA", section: "DO1", id: "5" },
      { orgPrincipal: "MME", documentType: "CONSULTA PÚBLICA", section: "DO1", id: "3" },
      { orgPrincipal: "MME", documentType: "CONSULTA PÚBLICA", section: "DO1", id: "1" },
    ];

    const selectedOrgao = "MME";
    const selectedDocumentTypes = new Set(["CONSULTA PÚBLICA"]);

    const filtered = results.filter((r) => {
      if (selectedOrgao && r.orgPrincipal !== selectedOrgao) return false;
      if (selectedDocumentTypes.size > 0 && !selectedDocumentTypes.has(r.documentType)) return false;
      return true;
    });

    expect(filtered.map((r) => r.id)).toEqual(["5", "3", "1"]);
  });

  it("deve contar corretamente resultados com múltiplos filtros", () => {
    const results = [
      { orgPrincipal: "MME", documentType: "CONSULTA PÚBLICA", section: "DO1", id: "1" },
      { orgPrincipal: "MME", documentType: "CONSULTA PÚBLICA", section: "DO1", id: "2" },
      { orgPrincipal: "MME", documentType: "PORTARIA", section: "DO1", id: "3" },
      { orgPrincipal: "ANEEL", documentType: "CONSULTA PÚBLICA", section: "DO1", id: "4" },
    ];

    const selectedOrgao = "MME";
    const selectedDocumentTypes = new Set(["CONSULTA PÚBLICA"]);

    const filteredCount = results.filter((r) => {
      if (selectedOrgao && r.orgPrincipal !== selectedOrgao) return false;
      if (selectedDocumentTypes.size > 0 && !selectedDocumentTypes.has(r.documentType)) return false;
      return true;
    }).length;

    expect(filteredCount).toBe(2);
    expect(filteredCount / results.length).toBe(0.5);
  });
});

describe("Filtros Combinados - Alternância de Filtros", () => {
  it("deve permitir alternar filtro de órgão sem afetar outros filtros", () => {
    const results = [
      { orgPrincipal: "MME", documentType: "CONSULTA PÚBLICA", section: "DO1", id: "1" },
      { orgPrincipal: "ANEEL", documentType: "CONSULTA PÚBLICA", section: "DO1", id: "2" },
    ];

    let selectedOrgao: string | null = "MME";
    let selectedDocumentTypes = new Set(["CONSULTA PÚBLICA"]);

    let filtered = results.filter((r) => {
      if (selectedOrgao && r.orgPrincipal !== selectedOrgao) return false;
      if (selectedDocumentTypes.size > 0 && !selectedDocumentTypes.has(r.documentType)) return false;
      return true;
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("1");

    // Mudar órgão para ANEEL
    selectedOrgao = "ANEEL";
    filtered = results.filter((r) => {
      if (selectedOrgao && r.orgPrincipal !== selectedOrgao) return false;
      if (selectedDocumentTypes.size > 0 && !selectedDocumentTypes.has(r.documentType)) return false;
      return true;
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("2");
    expect(selectedDocumentTypes.has("CONSULTA PÚBLICA")).toBe(true); // Filtro de tipo mantido
  });

  it("deve permitir remover filtro individual sem afetar outros", () => {
    const results = [
      { orgPrincipal: "MME", documentType: "CONSULTA PÚBLICA", section: "DO1", id: "1" },
      { orgPrincipal: "MME", documentType: "PORTARIA", section: "DO1", id: "2" },
    ];

    let selectedOrgao: string | null = "MME";
    let selectedDocumentTypes = new Set(["CONSULTA PÚBLICA"]);

    let filtered = results.filter((r) => {
      if (selectedOrgao && r.orgPrincipal !== selectedOrgao) return false;
      if (selectedDocumentTypes.size > 0 && !selectedDocumentTypes.has(r.documentType)) return false;
      return true;
    });

    expect(filtered).toHaveLength(1);

    // Remover filtro de tipo de documento
    selectedDocumentTypes = new Set();
    filtered = results.filter((r) => {
      if (selectedOrgao && r.orgPrincipal !== selectedOrgao) return false;
      if (selectedDocumentTypes.size > 0 && !selectedDocumentTypes.has(r.documentType)) return false;
      return true;
    });

    expect(filtered).toHaveLength(2);
    expect(selectedOrgao).toBe("MME"); // Filtro de órgão mantido
  });
});
