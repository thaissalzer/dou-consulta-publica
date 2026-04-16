import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as cheerio from "cheerio";

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
}

type DocumentType = 
  | 'CONSULTA PÚBLICA'
  | 'AVISO DE CONSULTA PÚBLICA'
  | 'TOMADA DE SUBSÍDIOS'
  | 'AVISO DE TOMADA DE SUBSÍDIOS'
  | 'AVISO DE PRORROGAÇÃO'
  | 'AVISO DE REABERTURA'
  | 'OUTRO';

function extractDocumentType(url: string, title: string): DocumentType {
  const urlLower = url.toLowerCase();
  const titleLower = title.toLowerCase();

  // Excluir documentos indesejados
  if (urlLower.includes('portaria') || 
      urlLower.includes('edital-de-notificacao') || 
      urlLower.includes('aviso-de-registro-de-diplomas') || 
      urlLower.includes('pauta-da')) {
    return 'OUTRO';
  }

  // Identificar tipo de documento
  if (urlLower.includes('consulta-publica')) {
    if (urlLower.includes('aviso-de')) {
      return 'AVISO DE CONSULTA PÚBLICA';
    }
    return 'CONSULTA PÚBLICA';
  }

  if (urlLower.includes('tomada-de-subsidios')) {
    if (urlLower.includes('aviso-de')) {
      return 'AVISO DE TOMADA DE SUBSÍDIOS';
    }
    return 'TOMADA DE SUBSÍDIOS';
  }

  if (urlLower.includes('aviso-de-prorrogacao')) {
    if (titleLower.includes('consulta pública') || titleLower.includes('subsídios')) {
      return 'AVISO DE PRORROGAÇÃO';
    }
  }

  if (urlLower.includes('aviso-de-reabertura') && titleLower.includes('consulta pública')) {
    return 'AVISO DE REABERTURA';
  }

  if (urlLower.includes('aviso-de-consulta-publica')) {
    return 'AVISO DE CONSULTA PÚBLICA';
  }

  if (urlLower.includes('aviso-de-tomada-de-subsidios')) {
    return 'AVISO DE TOMADA DE SUBSÍDIOS';
  }

  return 'OUTRO';
}

function isValidDocument(documentType: DocumentType): boolean {
  return documentType !== 'OUTRO';
}

async function fetchDOUPage(
  publishFrom: string,
  publishTo: string,
  pageNum: number,
  searchType: 'consulta-publica' | 'tomada-subsidios' | 'ambas' = 'consulta-publica',
  lastItem?: { id: string; displayDate: string }
): Promise<{ results: DOUResult[]; totalPages: number }> {
  let searchQuery = '"CONSULTA PÚBLICA"';
  if (searchType === 'tomada-subsidios') {
    searchQuery = '"TOMADA DE SUBSÍDIOS"';
  } else if (searchType === 'ambas') {
    searchQuery = '("CONSULTA PÚBLICA" OR "TOMADA DE SUBSÍDIOS")';
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
    // Fallback to HTTP
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

  // Get total pages
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

  // Extract JSON from script tag
  const scriptTag = $(
    'script#_br_com_seatecnologia_in_buscadou_BuscaDouPortlet_params'
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

  const results: DOUResult[] = searchResults
    .map((content: any) => {
      const urlTitle = content.urlTitle || "";
      const title = (content.title || "").replace(/<[^>]*>/g, "");
      const documentType = extractDocumentType(urlTitle, title);
      
      return {
        section: (content.pubName || "").toLowerCase(),
        title,
        href: DOU_WEB_BASE_URL + urlTitle,
        abstract: (content.content || "").replace(/<[^>]*>/g, ""),
        date: content.pubDate || "",
        id: content.classPK || "",
        orgPrincipal: content.hierarchyList?.[0] || "",
        orgSubordinado: content.hierarchyList?.slice(1).join(" > ") || "",
        editionNumber: content.editionNumber || "",
        numberPage: content.numberPage || "",
        display_date_sortable: content.displayDateSortable || "",
        documentType,
      };
    })
    .filter((result) => isValidDocument(result.documentType as DocumentType));

  return { results, totalPages };
}

export async function searchDOU(
  publishFrom: string,
  publishTo: string,
  searchType: 'consulta-publica' | 'tomada-subsidios' | 'ambas' = 'consulta-publica'
): Promise<DOUResult[]> {
  const allResults: DOUResult[] = [];

  const firstPage = await fetchDOUPage(publishFrom, publishTo, 0, searchType);
  allResults.push(...firstPage.results);

  const totalPages = firstPage.totalPages;

  for (let pageNum = 1; pageNum < totalPages; pageNum++) {
    const lastItem = allResults[allResults.length - 1];
    if (!lastItem) break;

    const page = await fetchDOUPage(publishFrom, publishTo, pageNum, searchType, {
      id: lastItem.id,
      displayDate: (lastItem as any).display_date_sortable || "",
    });
    allResults.push(...page.results);
  }

  return allResults;
}

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
          date: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Formato: DD/MM/AAAA"),
          dateEnd: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Formato: DD/MM/AAAA").optional(),
          orgao: z.string().optional(),
          documentType: z.string().optional(),
          searchType: z.enum(['consulta-publica', 'tomada-subsidios']).default('consulta-publica'),
        })
      )
      .query(async ({ input }) => {
        const endDate = input.dateEnd || input.date;
        const results = await searchDOU(input.date, endDate, input.searchType);

        let filtered = results.map((r) => ({
          ...r,
          sectionLabel: SECTION_MAP[r.section] || r.section,
        }));

        // Filtrar por órgão se selecionado
        // Filtrar por tipo de documento se selecionado
        if (input.documentType && input.documentType !== "todos") {
          filtered = filtered.filter((r) => r.documentType === input.documentType);
        }
        if (input.orgao && input.orgao !== "todos") {
          filtered = filtered.filter((r) => r.orgPrincipal === input.orgao);
        }

        return filtered;
      }),

    getOrgaos: publicProcedure
      .input(
        z.object({
          date: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Formato: DD/MM/AAAA"),
          dateEnd: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Formato: DD/MM/AAAA").optional(),
          documentType: z.string().optional(),
          searchType: z.enum(['consulta-publica', 'tomada-subsidios']).default('consulta-publica'),
        })
      )
      .query(async ({ input }) => {
        const endDate = input.dateEnd || input.date;
        const results = await searchDOU(input.date, endDate, input.searchType);

        // Extrair órgãos únicos
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
          date: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Formato: DD/MM/AAAA"),
          dateEnd: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Formato: DD/MM/AAAA").optional(),
          documentType: z.string().optional(),
          searchType: z.enum(['consulta-publica', 'tomada-subsidios']).default('consulta-publica'),
        })
      )
      .query(async ({ input }) => {
        const endDate = input.dateEnd || input.date;
        const results = await searchDOU(input.date, endDate, input.searchType);

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
