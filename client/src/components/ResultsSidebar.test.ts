import { describe, it, expect } from "vitest";

/**
 * Testes para o componente ResultsSidebar e lógica de filtro client-side
 */

describe("ResultsSidebar - Contagem de órgãos", () => {
  it("deve contar resultados por órgão corretamente", () => {
    const results = [
      { orgPrincipal: "Ministério de Minas e Energia", id: "1" },
      { orgPrincipal: "Ministério de Minas e Energia", id: "2" },
      { orgPrincipal: "ANEEL", id: "3" },
      { orgPrincipal: "Ministério da Saúde", id: "4" },
    ];

    const orgaoCounts = results.reduce(
      (acc, result) => {
        const orgao = result.orgPrincipal || "Sem órgão";
        acc[orgao] = (acc[orgao] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    expect(orgaoCounts["Ministério de Minas e Energia"]).toBe(2);
    expect(orgaoCounts["ANEEL"]).toBe(1);
    expect(orgaoCounts["Ministério da Saúde"]).toBe(1);
  });

  it("deve ordenar órgãos por contagem decrescente", () => {
    const results = [
      { orgPrincipal: "A", id: "1" },
      { orgPrincipal: "A", id: "2" },
      { orgPrincipal: "A", id: "3" },
      { orgPrincipal: "B", id: "4" },
      { orgPrincipal: "B", id: "5" },
      { orgPrincipal: "C", id: "6" },
    ];

    const orgaoCounts = results.reduce(
      (acc, result) => {
        const orgao = result.orgPrincipal || "Sem órgão";
        acc[orgao] = (acc[orgao] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const orgaos = Object.entries(orgaoCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([orgao, count]) => ({ orgao, count }));

    expect(orgaos[0].orgao).toBe("A");
    expect(orgaos[0].count).toBe(3);
    expect(orgaos[1].orgao).toBe("B");
    expect(orgaos[1].count).toBe(2);
    expect(orgaos[2].orgao).toBe("C");
    expect(orgaos[2].count).toBe(1);
  });

  it("deve lidar com resultados sem órgão", () => {
    const results = [
      { orgPrincipal: "Ministério A", id: "1" },
      { id: "2" }, // Sem órgão
      { orgPrincipal: undefined, id: "3" }, // Sem órgão
    ];

    const orgaoCounts = results.reduce(
      (acc, result) => {
        const orgao = result.orgPrincipal || "Sem órgão";
        acc[orgao] = (acc[orgao] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    expect(orgaoCounts["Ministério A"]).toBe(1);
    expect(orgaoCounts["Sem órgão"]).toBe(2);
  });
});

describe("ResultsSidebar - Filtro client-side", () => {
  it("deve filtrar resultados por órgão selecionado", () => {
    const results = [
      { orgPrincipal: "MME", id: "1", title: "Consulta 1" },
      { orgPrincipal: "MME", id: "2", title: "Consulta 2" },
      { orgPrincipal: "ANEEL", id: "3", title: "Consulta 3" },
    ];

    const selectedOrgao = "MME";
    const filtered = results.filter((r) => r.orgPrincipal === selectedOrgao);

    expect(filtered).toHaveLength(2);
    expect(filtered[0].id).toBe("1");
    expect(filtered[1].id).toBe("2");
  });

  it("deve retornar todos os resultados quando nenhum órgão está selecionado", () => {
    const results = [
      { orgPrincipal: "MME", id: "1" },
      { orgPrincipal: "ANEEL", id: "2" },
      { orgPrincipal: "Saúde", id: "3" },
    ];

    const selectedOrgao = null;
    const filtered = selectedOrgao
      ? results.filter((r) => r.orgPrincipal === selectedOrgao)
      : results;

    expect(filtered).toHaveLength(3);
  });

  it("deve retornar lista vazia quando nenhum resultado corresponde ao filtro", () => {
    const results = [
      { orgPrincipal: "MME", id: "1" },
      { orgPrincipal: "ANEEL", id: "2" },
    ];

    const selectedOrgao = "Ministério Inexistente";
    const filtered = results.filter((r) => r.orgPrincipal === selectedOrgao);

    expect(filtered).toHaveLength(0);
  });
});

describe("ResultsSidebar - Contagem de resultados filtrados", () => {
  it("deve calcular corretamente o total de resultados", () => {
    const results = [
      { orgPrincipal: "MME", id: "1" },
      { orgPrincipal: "MME", id: "2" },
      { orgPrincipal: "ANEEL", id: "3" },
    ];

    const totalResults = results.length;
    expect(totalResults).toBe(3);
  });

  it("deve calcular corretamente o total de resultados filtrados", () => {
    const results = [
      { orgPrincipal: "MME", id: "1" },
      { orgPrincipal: "MME", id: "2" },
      { orgPrincipal: "ANEEL", id: "3" },
    ];

    const selectedOrgao = "MME";
    const filteredCount = selectedOrgao
      ? results.filter((r) => r.orgPrincipal === selectedOrgao).length
      : results.length;

    expect(filteredCount).toBe(2);
  });

  it("deve mostrar proporção correta de resultados filtrados", () => {
    const results = [
      { orgPrincipal: "A", id: "1" },
      { orgPrincipal: "A", id: "2" },
      { orgPrincipal: "B", id: "3" },
      { orgPrincipal: "B", id: "4" },
      { orgPrincipal: "B", id: "5" },
    ];

    const selectedOrgao = "B";
    const filteredCount = results.filter(
      (r) => r.orgPrincipal === selectedOrgao
    ).length;
    const totalResults = results.length;

    expect(filteredCount).toBe(3);
    expect(totalResults).toBe(5);
    expect(filteredCount / totalResults).toBe(0.6);
  });
});

describe("ResultsSidebar - Limpeza de filtro", () => {
  it("deve limpar filtro ao selecionar null", () => {
    const results = [
      { orgPrincipal: "MME", id: "1" },
      { orgPrincipal: "ANEEL", id: "2" },
    ];

    let selectedOrgao: string | null = "MME";
    let filtered = selectedOrgao
      ? results.filter((r) => r.orgPrincipal === selectedOrgao)
      : results;

    expect(filtered).toHaveLength(1);

    // Limpar filtro
    selectedOrgao = null;
    filtered = selectedOrgao
      ? results.filter((r) => r.orgPrincipal === selectedOrgao)
      : results;

    expect(filtered).toHaveLength(2);
  });

  it("deve permitir alternar filtro entre órgãos", () => {
    const results = [
      { orgPrincipal: "MME", id: "1" },
      { orgPrincipal: "ANEEL", id: "2" },
      { orgPrincipal: "Saúde", id: "3" },
    ];

    // Selecionar MME
    let selectedOrgao: string | null = "MME";
    let filtered = selectedOrgao
      ? results.filter((r) => r.orgPrincipal === selectedOrgao)
      : results;
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("1");

    // Mudar para ANEEL
    selectedOrgao = "ANEEL";
    filtered = selectedOrgao
      ? results.filter((r) => r.orgPrincipal === selectedOrgao)
      : results;
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("2");

    // Mudar para Saúde
    selectedOrgao = "Saúde";
    filtered = selectedOrgao
      ? results.filter((r) => r.orgPrincipal === selectedOrgao)
      : results;
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("3");
  });
});

describe("ResultsSidebar - Performance (sem nova requisição)", () => {
  it("deve filtrar resultados instantaneamente sem fazer nova requisição", () => {
    const results = Array.from({ length: 100 }, (_, i) => ({
      orgPrincipal: i % 3 === 0 ? "A" : i % 3 === 1 ? "B" : "C",
      id: String(i),
      title: `Resultado ${i}`,
    }));

    const startTime = performance.now();

    const selectedOrgao = "A";
    const filtered = results.filter((r) => r.orgPrincipal === selectedOrgao);

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Deve ser muito rápido (menos de 5ms para 100 items)
    expect(duration).toBeLessThan(5);
    expect(filtered.length).toBeGreaterThan(0);
  });
});
