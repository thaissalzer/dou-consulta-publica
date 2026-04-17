import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";
import { useMemo } from "react";

interface ResultsFiltersProps {
  results: Array<{ documentType?: string; section?: string; [key: string]: any }>;
  selectedDocumentTypes: Set<string>;
  selectedSections: Set<string>;
  onDocumentTypeToggle: (type: string) => void;
  onSectionToggle: (section: string) => void;
  onClearAll: () => void;
}

function getSectionLabel(section: string): string {
  if (section.toLowerCase().includes("do1")) return "Seção 1";
  if (section.toLowerCase().includes("do2")) return "Seção 2";
  if (section.toLowerCase().includes("do3")) return "Seção 3";
  return "Seção Extra";
}

function getSectionColor(section: string): string {
  if (section.toLowerCase().includes("do1")) return "bg-section-1/10 text-section-1 border-section-1/20";
  if (section.toLowerCase().includes("do2")) return "bg-section-2/10 text-section-2 border-section-2/20";
  if (section.toLowerCase().includes("do3")) return "bg-section-3/10 text-section-3 border-section-3/20";
  return "bg-section-extra/10 text-section-extra border-section-extra/20";
}

export function ResultsFilters({
  results,
  selectedDocumentTypes,
  selectedSections,
  onDocumentTypeToggle,
  onSectionToggle,
  onClearAll,
}: ResultsFiltersProps) {
  // Contar resultados por tipo de documento
  const documentTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    results.forEach((result) => {
      const type = result.documentType || "Sem tipo";
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  }, [results]);

  // Contar resultados por seção
  const sectionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    results.forEach((result) => {
      const section = result.section || "Sem seção";
      counts[section] = (counts[section] || 0) + 1;
    });
    return counts;
  }, [results]);

  const documentTypes = useMemo(
    () =>
      Object.entries(documentTypeCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([type, count]) => ({ type, count })),
    [documentTypeCounts]
  );

  const sections = useMemo(
    () =>
      Object.entries(sectionCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([section, count]) => ({ section, count })),
    [sectionCounts]
  );

  const hasActiveFilters = selectedDocumentTypes.size > 0 || selectedSections.size > 0;

  return (
    <div className="space-y-4">
      {/* Clear all button */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearAll}
          className="w-full justify-start text-xs"
          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
        >
          <X className="h-3 w-3 mr-1" />
          Limpar todos os filtros
        </Button>
      )}

      {/* Tipo de Documento */}
      <div>
        <h4
          className="text-xs font-semibold text-foreground mb-2"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Tipo de Documento
        </h4>
        <div className="space-y-1.5">
          {documentTypes.length > 0 ? (
            documentTypes.map(({ type, count }) => (
              <button
                key={type}
                onClick={() => onDocumentTypeToggle(type)}
                className={`
                  w-full text-left px-2 py-1.5 rounded text-xs font-medium transition-colors
                  flex items-center justify-between
                  ${
                    selectedDocumentTypes.has(type)
                      ? "bg-gov-green text-white"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }
                `}
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              >
                <span className="truncate flex-1">{type}</span>
                <Badge
                  variant="secondary"
                  className={`ml-2 shrink-0 text-xs ${
                    selectedDocumentTypes.has(type)
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
            <p className="text-xs text-muted-foreground" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              Nenhum tipo encontrado
            </p>
          )}
        </div>
      </div>

      <Separator />

      {/* Seção */}
      <div>
        <h4
          className="text-xs font-semibold text-foreground mb-2"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Seção do DOU
        </h4>
        <div className="space-y-1.5">
          {sections.length > 0 ? (
            sections.map(({ section, count }) => (
              <button
                key={section}
                onClick={() => onSectionToggle(section)}
                className={`
                  w-full text-left px-2 py-1.5 rounded text-xs font-medium transition-colors
                  flex items-center justify-between
                  border
                  ${
                    selectedSections.has(section)
                      ? "bg-gov-green text-white border-gov-green"
                      : `bg-white border-border hover:bg-muted/30 ${getSectionColor(section)}`
                  }
                `}
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              >
                <span className="truncate flex-1">{getSectionLabel(section)}</span>
                <Badge
                  variant="secondary"
                  className={`ml-2 shrink-0 text-xs ${
                    selectedSections.has(section)
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
            <p className="text-xs text-muted-foreground" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              Nenhuma seção encontrada
            </p>
          )}
        </div>
      </div>

      {/* Active filters summary */}
      {hasActiveFilters && (
        <>
          <Separator />
          <div className="text-xs text-muted-foreground" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            <p className="font-medium mb-1">Filtros ativos:</p>
            <div className="flex flex-wrap gap-1">
              {Array.from(selectedDocumentTypes).map((type) => (
                <Badge key={type} variant="outline" className="text-xs">
                  {type}
                </Badge>
              ))}
              {Array.from(selectedSections).map((section) => (
                <Badge key={section} variant="outline" className="text-xs">
                  {getSectionLabel(section)}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
