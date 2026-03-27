import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Calendar,
  FileText,
  ExternalLink,
  Loader2,
  AlertCircle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Building2,
} from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

function formatDateForAPI(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatInputDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseInputDate(str: string): Date {
  const [year, month, day] = str.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getSectionColor(section: string): string {
  const s = section.toLowerCase();
  if (s.includes("do1")) return "bg-section-1";
  if (s.includes("do2")) return "bg-section-2";
  if (s.includes("do3")) return "bg-section-3";
  return "bg-section-extra";
}

function getSectionBadgeVariant(section: string): string {
  const s = section.toLowerCase();
  if (s.includes("do1")) return "bg-section-1/10 text-section-1 border-section-1/20";
  if (s.includes("do2")) return "bg-section-2/10 text-section-2 border-section-2/20";
  if (s.includes("do3")) return "bg-section-3/10 text-section-3 border-section-3/20";
  return "bg-section-extra/10 text-section-extra border-section-extra/20";
}

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [selectedOrgao, setSelectedOrgao] = useState<string>("todos");
  const [searchType, setSearchType] = useState<'consulta-publica' | 'tomada-subsidios' | 'ambas'>('consulta-publica');
  const [searchTriggered, setSearchTriggered] = useState(false);

  const dateStr = useMemo(
    () => formatDateForAPI(selectedDate),
    [selectedDate]
  );

  // Buscar lista de órgãos
  const {
    data: orgaos,
    isLoading: orgaosLoading,
  } = trpc.dou.getOrgaos.useQuery(
    { date: dateStr, searchType },
    { enabled: searchTriggered, staleTime: 5 * 60 * 1000 }
  );

  const {
    data: results,
    isLoading,
    error,
    isFetching,
  } = trpc.dou.searchConsultasPublicas.useQuery(
    { date: dateStr, orgao: selectedOrgao === "todos" ? undefined : selectedOrgao, searchType },
    { enabled: searchTriggered, retry: 1, staleTime: 5 * 60 * 1000 }
  );

  const handleSearch = useCallback(() => {
    setSearchTriggered(true);
  }, []);

  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(parseInputDate(e.target.value));
    setSearchTriggered(false);
  }, []);

  const handlePrevDay = useCallback(() => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 1);
      return d;
    });
    setSearchTriggered(false);
  }, []);

  const handleNextDay = useCallback(() => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 1);
      return d;
    });
    setSearchTriggered(false);
  }, []);

  const handleToday = useCallback(() => {
    setSelectedDate(new Date());
    setSearchTriggered(false);
  }, []);

  const handleOrgaoChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOrgao(e.target.value);
  }, []);

  const handleSearchTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchType(e.target.value as 'consulta-publica' | 'tomada-subsidios' | 'ambas');
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gov-green text-white">
        <div className="container py-3">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 shrink-0 opacity-80" />
            <div>
              <p className="text-xs uppercase tracking-widest opacity-70 font-medium" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                Diário Oficial da União
              </p>
              <h1 className="text-lg font-bold leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                Consultas Públicas
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Accent bar */}
      <div className="h-1 bg-gradient-to-r from-gov-green via-gov-gold to-gov-green" />

      {/* Main content */}
      <main className="flex-1">
        {/* Search section */}
        <section className="bg-white border-b border-border">
          <div className="container py-8">
            <div className="max-w-2xl mx-auto text-center mb-6">
              <h2
                className="text-2xl md:text-3xl font-bold text-foreground mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Buscar Consultas Públicas
              </h2>
              <p className="text-muted-foreground text-sm md:text-base" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                Encontre todas as consultas públicas publicadas no DOU em uma data específica
              </p>
            </div>

            <div className="max-w-lg mx-auto">
              {/* Seletor de tipo de busca */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                  Tipo de Busca
                </label>
                <select
                  value={searchType}
                  onChange={handleSearchTypeChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-white text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gov-green focus:border-transparent"
                  style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                >
                  <option value="consulta-publica">Consultas Públicas</option>
                  <option value="tomada-subsidios">Tomada de Subsídios</option>
                  <option value="ambas">Ambas</option>
                </select>
              </div>

              {/* Seletor de órgão */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                  Órgão
                </label>
                <select
                  value={selectedOrgao}
                  onChange={handleOrgaoChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-white text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gov-green focus:border-transparent"
                  style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                >
                  <option value="todos">Todos os órgãos</option>
                  {orgaos && orgaos.length > 0 ? (
                    orgaos.map((orgao) => (
                      <option key={orgao} value={orgao}>
                        {orgao}
                      </option>
                    ))
                  ) : (
                    <option disabled>Nenhum órgão encontrado</option>
                  )}
                </select>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 shrink-0"
                  onClick={handlePrevDay}
                  title="Dia anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="date"
                    value={formatInputDate(selectedDate)}
                    onChange={handleDateChange}
                    className="pl-10 h-10 text-center font-medium"
                    max={formatInputDate(new Date())}
                  />
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 shrink-0"
                  onClick={handleNextDay}
                  title="Próximo dia"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToday}
                  className="text-xs"
                  style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                >
                  Hoje
                </Button>
                <Button
                  onClick={handleSearch}
                  className="flex-1 bg-gov-green hover:bg-gov-green-light text-white font-semibold"
                  disabled={isLoading || isFetching}
                  style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                >
                  {isLoading || isFetching ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Buscar no DOU
                    </>
                  )}
                </Button>
              </div>

              <p
                className="text-center text-xs text-muted-foreground mt-2 capitalize"
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              >
                {formatDateDisplay(selectedDate)}
              </p>
            </div>
          </div>
        </section>

        {/* Results section */}
        <section className="container py-6">
          {/* Loading state */}
          {(isLoading || isFetching) && searchTriggered && (
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-2 mb-6">
                <Loader2 className="h-4 w-4 animate-spin text-gov-green" />
                <span className="text-sm text-muted-foreground" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                  Consultando o Diário Oficial da União...
                </span>
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="mb-4">
                  <Card className="overflow-hidden">
                    <div className="flex">
                      <div className="w-1.5 bg-muted animate-pulse" />
                      <CardContent className="flex-1 p-5">
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <div className="h-5 w-16 bg-muted rounded animate-pulse" />
                            <div className="h-5 w-24 bg-muted rounded animate-pulse" />
                          </div>
                          <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
                          <div className="space-y-2">
                            <div className="h-4 w-full bg-muted rounded animate-pulse" />
                            <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {error && searchTriggered && !isLoading && !isFetching && (
            <div className="max-w-3xl mx-auto">
              <Card className="border-destructive/30 bg-destructive/5">
                <CardContent className="p-6 text-center">
                  <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
                  <h3
                    className="text-lg font-semibold text-destructive mb-1"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Erro ao buscar dados
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                    Não foi possível acessar o Diário Oficial da União. O serviço pode estar temporariamente indisponível.
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleSearch}
                    className="border-destructive/30 text-destructive hover:bg-destructive/10"
                    style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                  >
                    Tentar novamente
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Empty state */}
          {results && results.length === 0 && !isLoading && !isFetching && (
            <div className="max-w-3xl mx-auto">
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                  <h3
                    className="text-lg font-semibold text-foreground mb-1"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Nenhuma consulta pública encontrada
                  </h3>
                  <p className="text-sm text-muted-foreground" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                    Não foram encontradas consultas públicas publicadas em{" "}
                    <strong>{formatDateForAPI(selectedDate)}</strong>. Tente outra data.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Results */}
          {results && results.length > 0 && !isLoading && !isFetching && (
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3
                    className="text-lg font-bold text-foreground"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Resultados
                  </h3>
                  <p className="text-sm text-muted-foreground" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                    <strong>{results.length}</strong>{" "}
                    {results.length === 1
                      ? "consulta pública encontrada"
                      : "consultas públicas encontradas"}{" "}
                    em {formatDateForAPI(selectedDate)}
                  </p>
                </div>
              </div>

              <Separator className="mb-5" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={dateStr}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {results.map((item, index) => (
                    <motion.div
                      key={item.id || index}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: index * 0.04 }}
                      className="mb-4"
                    >
                      <Card className="overflow-hidden group hover:shadow-md transition-shadow duration-200">
                        <div className="flex">
                          {/* Section color bar */}
                          <div
                            className={`w-1.5 shrink-0 ${getSectionColor(item.section)}`}
                          />
                          <CardContent className="flex-1 p-5">
                            {/* Top metadata */}
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded border ${getSectionBadgeVariant(item.section)}`}
                                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                              >
                                {item.sectionLabel}
                              </span>
                              {item.editionNumber && (
                                <span className="text-xs text-muted-foreground" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                                  Edição N.º {item.editionNumber}
                                </span>
                              )}
                              {item.numberPage && (
                                <span className="text-xs text-muted-foreground" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                                  &middot; Pág. {item.numberPage}
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                                &middot; {item.date}
                              </span>
                            </div>

                            {/* Title */}
                            <h4
                              className="text-base font-bold text-foreground mb-1 leading-snug"
                              style={{ fontFamily: "'Playfair Display', serif" }}
                            >
                              {item.title}
                            </h4>

                            {/* Organization */}
                            {(item.orgPrincipal || item.orgSubordinado) && (
                              <div className="flex items-start gap-1.5 mb-2">
                                <Building2 className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                                <p className="text-xs text-muted-foreground leading-relaxed" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                                  {item.orgPrincipal}
                                  {item.orgSubordinado && (
                                    <span className="text-muted-foreground/60">
                                      {" "}
                                      &rsaquo; {item.orgSubordinado}
                                    </span>
                                  )}
                                </p>
                              </div>
                            )}

                            {/* Abstract */}
                            {item.abstract && (
                              <p
                                className="text-sm text-foreground/80 leading-relaxed line-clamp-3 mb-3"
                                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                              >
                                {item.abstract}
                              </p>
                            )}

                            {/* Link */}
                            <a
                              href={item.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm font-medium text-gov-green hover:text-gov-green-light transition-colors"
                              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              Ver publicação completa no DOU
                            </a>
                          </CardContent>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {/* Initial state */}
          {!searchTriggered && (
            <div className="max-w-3xl mx-auto">
              <Card className="border-dashed border-gov-green/20 bg-gov-green/[0.02]">
                <CardContent className="p-8 text-center">
                  <Search className="h-12 w-12 text-gov-green/30 mx-auto mb-4" />
                  <h3
                    className="text-lg font-semibold text-foreground mb-1"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Selecione uma data e clique em buscar
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                    Esta ferramenta busca todas as publicações que mencionam "Consulta Pública" no Diário Oficial da União para a data selecionada.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-white mt-auto">
        <div className="container py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            <p>
              Dados obtidos do{" "}
              <a
                href="https://www.in.gov.br"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gov-green hover:underline font-medium"
              >
                Diário Oficial da União
              </a>{" "}
              &middot; Imprensa Nacional
            </p>
            <p>
              Inspirado no projeto{" "}
              <a
                href="https://github.com/gestaogovbr/Ro-dou"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gov-green hover:underline font-medium"
              >
                Ro-dou
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
