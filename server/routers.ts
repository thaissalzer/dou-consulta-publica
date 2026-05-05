import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as cheerio from "cheerio";
import { invokeLLM } from "./_core/llm";

const DOU_API_BASE_URL = "https://www.in.gov.br/consulta/-/buscar/dou";
const DOU_WEB_BASE_URL = "https://www.in.gov.br/web/dou/-/";

const USER_AGENT =
  "Mozilla/5.0 (compatible; Ro-DOU/0.7; +https://github.com/gestaogovbr/Ro-dou)";

interface DOUResult {
  section: string;
  title: string;
  href: string;
  abstract: string;
  date: string;
  id: string;
  orgPrincipal?: string;
  orgSubordinado?: string;
  editionNumber?: string;
  numberPage?: string;
  documentType?: string;
  display_date_sortable?: string;
  relevancia?: string;
}

// ============================================================
// Classificação com LLM
// ============================================================

interface LLMClassification {
  relevante: boolean;
  tipo: string;
  motivo: string;
}

async function classifyWithLLM(
  items: { title: string; abstract: string; artigo1?: string }[]
): Promise<LLMClassification[]> {
  if (items.length === 0) return [];

  const itemsText = items
    .map((item, i) => {
      let text = `[${i}] Título: ${item.title}\nEmenta: ${item.abstract}`;
      if (item.artigo1) {
        text += `\nArt. 1º: ${item.artigo1}`;
      }
      return text;
    })
    .join("\n\n---\n\n");

  const systemPrompt = `Você é um classificador de documentos do Diário Oficial da União (DOU) do Brasil.

Sua tarefa é analisar documentos e determinar se cada um é uma **abertura, divulgação, prorrogação ou reabertura de Consulta Pública ou Tomada de Subsídios**.

DOCUMENTOS RELEVANTES (marcar como relevante=true):
- Abertura de Consulta Pública
- Aviso de Consulta Pública
- Consulta Pública (quando é a própria abertura/divulgação)
- Abertura de Tomada de Subsídios
- Aviso de Tomada de Subsídios
- Tomada de Subsídios (quando é a própria abertura/divulgação)
- Portarias que abrem/divulgam Consultas Públicas ou Tomadas de Subsídios (ex: "Fica divulgada, para Consulta Pública...")
- Avisos de prorrogação de Consultas Públicas ou Tomadas de Subsídios
- Avisos de reabertura de Consultas Públicas ou Tomadas de Subsídios

DOCUMENTOS NÃO RELEVANTES (marcar como relevante=false):
- Documentos que apenas MENCIONAM consultas públicas passadas ou futuras sem ser a abertura
- Editais de notificação
- Avisos de registro de diplomas
- Pautas de reunião
- Portarias que apenas regulamentam algo e mencionam consulta pública de passagem
- Avisos genéricos que não são de consulta pública
- Qualquer documento que não seja especificamente uma abertura/divulgação/prorrogação/reabertura de CP ou TS

Para o campo "tipo", use uma destas categorias:
- CONSULTA PÚBLICA
- AVISO DE CONSULTA PÚBLICA
- TOMADA DE SUBSÍDIOS
- AVISO DE TOMADA DE SUBSÍDIOS
- PORTARIA (quando é uma portaria que abre/divulga CP ou TS)
- AVISO DE PRORROGAÇÃO
- AVISO DE REABERTURA
- OUTRO (para documentos não relevantes)

Responda APENAS com o JSON, sem texto adicional.`;

  const userPrompt = `Classifique cada documento abaixo. Responda com um array JSON com objetos contendo: "index" (número do item), "relevante" (boolean), "tipo" (string), "motivo" (explicação breve).

${itemsText}`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "classificacao_documentos",
          strict: true,
          schema: {
            type: "object",
            properties: {
              classificacoes: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    index: { type: "integer", description: "Índice do item" },
                    relevante: { type: "boolean", description: "Se o documento é relevante" },
                    tipo: { type: "string", description: "Tipo do documento" },
                    motivo: { type: "string", description: "Motivo da classificação" },
                  },
                  required: ["index", "relevante", "tipo", "motivo"],
                  additionalProperties: false,
                },
              },
            },
            required: ["classificacoes"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== "string") return items.map(() => ({ relevante: false, tipo: "OUTRO", motivo: "Erro na classificação" }));

    const parsed = JSON.parse(content);
    const classificacoes = parsed.classificacoes || [];

    // Mapear por index
    const resultMap = new Map<number, LLMClassification>();
    for (const c of classificacoes) {
      resultMap.set(c.index, { relevante: c.relevante, tipo: c.tipo, motivo: c.motivo });
    }

    return items.map((_, i) =>
      resultMap.get(i) || { relevante: false, tipo: "OUTRO", motivo: "Não classificado" }
    );
  } catch (error) {
    console.error("[LLM] Erro na classificação:", error);
    // Fallback: usar lógica antiga baseada em regex
    return items.map((item) => {
      const combined = `${item.title} ${item.abstract} ${item.artigo1 || ""}`.toLowerCase();
      if (combined.includes("consulta pública") || combined.includes("tomada de subsídios")) {
        return { relevante: true, tipo: "OUTRO", motivo: "Fallback regex" };
      }
      return { relevante: false, tipo: "OUTRO", motivo: "Fallback regex - não encontrado" };
    });
  }
}

// ============================================================
// Extração do Art. 1º
// ============================================================

async function extractArtigo1FromDocument(href: string): Promise<string> {
  try {
    const response = await fetch(href, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) return "";

    const html = await response.text();
    const $ = cheerio.load(html);

    const text = $.text();
    const art1Match = text.match(/Art\.\s*1º?[\s\S]*?(?=Art\.\s*[2-9]|$)/i);

    if (art1Match) {
      return art1Match[0].substring(0, 1000);
    }

    return "";
  } catch (error) {
    console.error("[DOU] Erro ao extrair Art. 1º:", error);
    return "";
  }
}

// ============================================================
// Busca no DOU
// ============================================================

async function fetchDOUPage(
  publishFrom: string,
  publishTo: string,
  pageNum: number,
  searchType: "consulta-publica" | "tomada-subsidios" = "consulta-publica",
  lastItem?: { id: string; displayDate: string }
): Promise<{ results: any[]; totalPages: number }> {
  let searchQuery = '"CONSULTA PÚBLICA"';
  if (searchType === "tomada-subsidios") {
    searchQuery = '"TOMADA DE SUBSÍDIOS"';
  }

  const params: Record<string, string> = {
    q: searchQuery,
    exactDate: "personalizado",
    publishFrom,
    publishTo,
    sortType: "0",
    s: "todos",
  };

  if (pageNum > 0 && lastItem) {
    params.id = lastItem.id;
    params.displayDate = lastItem.displayDate;
    params.newPage = String(pageNum + 1);
    params.currentPage = String(pageNum);
  }

  const headers: Record<string, string> = {
    "User-Agent": USER_AGENT,
    Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
    "Cache-Control": "no-cache",
  };

  let response: Response;
  try {
    const url = new URL(DOU_API_BASE_URL);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    response = await fetch(url.toString(), { headers });
  } catch {
    const httpUrl = DOU_API_BASE_URL.replace("https://", "http://");
    const url = new URL(httpUrl);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    response = await fetch(url.toString(), { headers });
  }

  if (!response.ok) {
    throw new Error(`DOU API returned status ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  let totalPages = 1;
  const lastPageBtn = $("button#lastPage");
  if (lastPageBtn.length) {
    const paginationTag = lastPageBtn.parent().find("span").first();
    if (paginationTag.length) {
      totalPages = parseInt(paginationTag.text().trim(), 10) || 1;
    }
  }
  const secondPageBtn = $("button#2btn");
  if (secondPageBtn.length && totalPages === 1) {
    totalPages = 2;
  }

  const scriptTag = $(
    "script#_br_com_seatecnologia_in_buscadou_BuscaDouPortlet_params"
  );

  if (!scriptTag.length) {
    return { results: [], totalPages: 0 };
  }

  let searchResults: any[] = [];
  try {
    const jsonData = JSON.parse(scriptTag.html() || "{}");
    searchResults = jsonData.jsonArray || [];
  } catch {
    return { results: [], totalPages: 0 };
  }

  return { results: searchResults, totalPages };
}

async function fetchAllDOUPages(
  publishFrom: string,
  publishTo: string,
  searchType: "consulta-publica" | "tomada-subsidios" = "consulta-publica"
): Promise<any[]> {
  const allResults: any[] = [];

  const firstPage = await fetchDOUPage(publishFrom, publishTo, 0, searchType);
  allResults.push(...firstPage.results);

  const totalPages = firstPage.totalPages;

  for (let pageNum = 1; pageNum < totalPages; pageNum++) {
    const lastItem = allResults[allResults.length - 1];
    if (!lastItem) break;

    const page = await fetchDOUPage(
      publishFrom,
      publishTo,
      pageNum,
      searchType,
      {
        id: lastItem.classPK || "",
        displayDate: lastItem.displayDateSortable || "",
      }
    );
    allResults.push(...page.results);
  }

  return allResults;
}

// ============================================================
// Pipeline principal: busca + classificação LLM
// ============================================================

export async function searchDOU(
  publishFrom: string,
  publishTo: string,
  searchType: "consulta-publica" | "tomada-subsidios" = "consulta-publica"
): Promise<DOUResult[]> {
  // 1. Buscar todos os resultados brutos do DOU
  const rawResults = await fetchAllDOUPages(publishFrom, publishTo, searchType);

  if (rawResults.length === 0) return [];

  // 2. Preparar dados para classificação
  const itemsForClassification: {
    title: string;
    abstract: string;
    artigo1?: string;
    raw: any;
  }[] = [];

  for (const content of rawResults) {
    const urlTitle = content.urlTitle || "";
    const title = (content.title || "").replace(/<[^>]*>/g, "");
    const abstract = (content.content || "").replace(/<[^>]*>/g, "");

    itemsForClassification.push({
      title,
      abstract,
      raw: content,
    });
  }

  // 3. Para Portarias, buscar Art. 1º antes de classificar
  const portariaPromises = itemsForClassification.map(async (item) => {
    const urlTitle = item.raw.urlTitle || "";
    if (urlTitle.toLowerCase().includes("portaria")) {
      const href = DOU_WEB_BASE_URL + urlTitle;
      const art1 = await extractArtigo1FromDocument(href);
      item.artigo1 = art1;
    }
  });

  await Promise.all(portariaPromises);

  // 4. Classificar com LLM em lotes de até 20 itens
  const BATCH_SIZE = 20;
  const allClassifications: LLMClassification[] = [];

  for (let i = 0; i < itemsForClassification.length; i += BATCH_SIZE) {
    const batch = itemsForClassification.slice(i, i + BATCH_SIZE);
    const classifications = await classifyWithLLM(
      batch.map((b) => ({
        title: b.title,
        abstract: b.abstract,
        artigo1: b.artigo1,
      }))
    );
    allClassifications.push(...classifications);
  }

  // 5. Filtrar apenas os relevantes e montar resultado final
  const results: DOUResult[] = [];

  for (let i = 0; i < itemsForClassification.length; i++) {
    const classification = allClassifications[i];
    if (!classification || !classification.relevante) continue;

    const item = itemsForClassification[i];
    const content = item.raw;
    const urlTitle = content.urlTitle || "";

    results.push({
      section: (content.pubName || "").toLowerCase(),
      title: item.title,
      href: DOU_WEB_BASE_URL + urlTitle,
      abstract: (content.content || "").replace(/<[^>]*>/g, ""),
      date: content.pubDate || "",
      id: content.classPK || "",
      orgPrincipal: content.hierarchyList?.[0] || "",
      orgSubordinado: content.hierarchyList?.slice(1).join(" > ") || "",
      editionNumber: content.editionNumber || "",
      numberPage: content.numberPage || "",
      display_date_sortable: content.displayDateSortable || "",
      documentType: classification.tipo,
      relevancia: classification.motivo,
    });
  }

  return results;
}

// ============================================================
// Mapa de seções
// ============================================================

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

// ============================================================
// Rotas tRPC
// ============================================================

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  dou: router({
    searchConsultasPublicas: publicProcedure
      .input(
        z.object({
          date: z
            .string()
            .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Formato: DD/MM/AAAA"),
          dateEnd: z
            .string()
            .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Formato: DD/MM/AAAA")
            .optional(),
          orgao: z.string().optional(),
          documentType: z.string().optional(),
          searchType: z
            .enum(["consulta-publica", "tomada-subsidios", "ambas"])
            .default("ambas"),
        })
      )
      .query(async ({ input, ctx }) => {
        const { getCachedResults, saveCachedResults } = await import("./db");
        const cacheKey = input.date;
        const isAdmin = ctx.user?.role === 'admin';
        
        // Try to get cached results (skip if admin)
        if (!isAdmin) {
          const cached = await getCachedResults(cacheKey, input.searchType);
          if (cached) {
            console.log(`[Cache] Usando resultados em cache para ${cacheKey}`);
            return cached;
          }
        } else {
          console.log(`[Cache] Admin ignorando cache para ${cacheKey}`);
        }
        
        const endDate = input.dateEnd || input.date;
        
        let results;
        if (input.searchType === "ambas") {
          // Buscar ambos os tipos e combinar
          const consultasPublicas = await searchDOU(input.date, endDate, "consulta-publica");
          const tomadasSubsidios = await searchDOU(input.date, endDate, "tomada-subsidios");
          
          // Combinar e remover duplicatas por ID
          const idsVistos = new Set<string>();
          results = [];
          for (const r of [...consultasPublicas, ...tomadasSubsidios]) {
            if (!idsVistos.has(r.id)) {
              idsVistos.add(r.id);
              results.push(r);
            }
          }
        } else {
          results = await searchDOU(input.date, endDate, input.searchType as "consulta-publica" | "tomada-subsidios");
        }

        let filtered = results.map((r) => ({
          ...r,
          sectionLabel: SECTION_MAP[r.section] || r.section,
        }));

        if (input.documentType && input.documentType !== "todos") {
          filtered = filtered.filter(
            (r) => r.documentType === input.documentType
          );
        }
        if (input.orgao && input.orgao !== "todos") {
          filtered = filtered.filter((r) => r.orgPrincipal === input.orgao);
        }

        // Save to cache
        await saveCachedResults(cacheKey, input.searchType, filtered);
        console.log(`[Cache] Resultados salvos em cache para ${cacheKey}`);
        
        return filtered;
      }),

    getOrgaos: publicProcedure
      .input(
        z.object({
          date: z
            .string()
            .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Formato: DD/MM/AAAA"),
          dateEnd: z
            .string()
            .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Formato: DD/MM/AAAA")
            .optional(),
          searchType: z
            .enum(["consulta-publica", "tomada-subsidios", "ambas"])
            .default("ambas"),
        })
      )
      .query(async ({ input }) => {
        const endDate = input.dateEnd || input.date;
        
        let results;
        if (input.searchType === "ambas") {
          // Buscar ambos os tipos e combinar
          const consultasPublicas = await searchDOU(input.date, endDate, "consulta-publica");
          const tomadasSubsidios = await searchDOU(input.date, endDate, "tomada-subsidios");
          
          // Combinar e remover duplicatas por ID
          const idsVistos = new Set<string>();
          results = [];
          for (const r of [...consultasPublicas, ...tomadasSubsidios]) {
            if (!idsVistos.has(r.id)) {
              idsVistos.add(r.id);
              results.push(r);
            }
          }
        } else {
          results = await searchDOU(input.date, endDate, input.searchType as "consulta-publica" | "tomada-subsidios");
        }

        const orgaosSet = new Set<string>();
        results.forEach((r) => {
          if (r.orgPrincipal) {
            orgaosSet.add(r.orgPrincipal);
          }
        });

        return Array.from(orgaosSet).sort();
      }),

    getDocumentTypes: publicProcedure
      .input(
        z.object({
          date: z
            .string()
            .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Formato: DD/MM/AAAA"),
          dateEnd: z
            .string()
            .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Formato: DD/MM/AAAA")
            .optional(),
          searchType: z
            .enum(["consulta-publica", "tomada-subsidios", "ambas"])
            .default("ambas"),
        })
      )
      .query(async ({ input }) => {
        const endDate = input.dateEnd || input.date;
        
        let results;
        if (input.searchType === "ambas") {
          // Buscar ambos os tipos e combinar
          const consultasPublicas = await searchDOU(input.date, endDate, "consulta-publica");
          const tomadasSubsidios = await searchDOU(input.date, endDate, "tomada-subsidios");
          
          // Combinar e remover duplicatas por ID
          const idsVistos = new Set<string>();
          results = [];
          for (const r of [...consultasPublicas, ...tomadasSubsidios]) {
            if (!idsVistos.has(r.id)) {
              idsVistos.add(r.id);
              results.push(r);
            }
          }
        } else {
          results = await searchDOU(input.date, endDate, input.searchType as "consulta-publica" | "tomada-subsidios");
        }

        const typesSet = new Set<string>();
        results.forEach((r) => {
          if (r.documentType) {
            typesSet.add(r.documentType);
          }
        });

        return Array.from(typesSet).sort();
      }),
  }),
});

export type AppRouter = typeof appRouter;
