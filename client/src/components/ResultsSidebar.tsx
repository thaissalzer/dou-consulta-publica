import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, Filter } from "lucide-react";
import { useState } from "react";

interface ResultsSidebarProps {
  results: Array<{ orgPrincipal?: string; [key: string]: any }>;
  selectedOrgao: string | null;
  onOrgaoSelect: (orgao: string | null) => void;
}

export function ResultsSidebar({
  results,
  selectedOrgao,
  onOrgaoSelect,
}: ResultsSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Contar resultados por órgão
  const orgaoCounts = results.reduce(
    (acc, result) => {
      const orgao = result.orgPrincipal || "Sem órgão";
      acc[orgao] = (acc[orgao] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const orgaos = Object.entries(orgaoCounts)
    .sort((a, b) => b[1] - a[1]) // Ordenar por contagem decrescente
    .map(([orgao, count]) => ({ orgao, count }));

  const totalResults = results.length;
  const filteredCount = selectedOrgao
    ? results.filter((r) => r.orgPrincipal === selectedOrgao).length
    : totalResults;

  return (
    <>
      {/* Mobile toggle button */}
      <div className="md:hidden mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-start gap-2"
          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
        >
          <Filter className="h-4 w-4" />
          Filtrar por Órgão
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-border
          transform transition-transform duration-200 ease-in-out md:transform-none
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          md:w-auto md:border-r md:pr-6 md:mb-0
          overflow-y-auto max-h-screen md:max-h-none
        `}
      >
        <div className="p-4 md:p-0">
          {/* Close button (mobile only) */}
          <div className="md:hidden mb-4 flex justify-between items-center">
            <h3
              className="text-sm font-semibold text-foreground"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Filtrar por Órgão
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Desktop header */}
          <div className="hidden md:block mb-4">
            <h3
              className="text-sm font-semibold text-foreground"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Filtrar por Órgão
            </h3>
            <p
              className="text-xs text-muted-foreground mt-1"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              {totalResults} resultado{totalResults !== 1 ? "s" : ""}
            </p>
          </div>

          <Separator className="md:hidden mb-4" />

          {/* Filter buttons */}
          <div className="space-y-2">
            {/* Clear filter button */}
            {selectedOrgao && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOrgaoSelect(null)}
                className="w-full justify-start text-xs"
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              >
                <X className="h-3 w-3 mr-1" />
                Limpar filtro
              </Button>
            )}

            {/* Órgão filter buttons */}
            {orgaos.length > 0 ? (
              orgaos.map(({ orgao, count }) => (
                <button
                  key={orgao}
                  onClick={() => onOrgaoSelect(selectedOrgao === orgao ? null : orgao)}
                  className={`
                    w-full text-left px-3 py-2 rounded-md text-xs font-medium transition-colors
                    flex items-center justify-between
                    ${
                      selectedOrgao === orgao
                        ? "bg-gov-green text-white"
                        : "bg-muted text-foreground hover:bg-muted/80"
                    }
                  `}
                  style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                >
                  <span className="truncate flex-1">{orgao}</span>
                  <Badge
                    variant="secondary"
                    className={`ml-2 shrink-0 ${
                      selectedOrgao === orgao
                        ? "bg-white/20 text-white"
                        : "bg-background"
                    }`}
                    style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                  >
                    {count}
                  </Badge>
                </button>
              ))
            ) : (
              <p
                className="text-xs text-muted-foreground text-center py-4"
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              >
                Nenhum órgão encontrado
              </p>
            )}
          </div>

          {/* Results count */}
          {selectedOrgao && (
            <>
              <Separator className="my-4" />
              <p
                className="text-xs text-muted-foreground text-center"
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              >
                Mostrando <strong>{filteredCount}</strong> de{" "}
                <strong>{totalResults}</strong> resultado
                {totalResults !== 1 ? "s" : ""}
              </p>
            </>
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
