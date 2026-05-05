import { AlertCircle, Clock, CheckCircle2, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CacheIndicatorProps {
  isFromCache: boolean;
  lastSearchDate?: string;
  isAdmin?: boolean;
  nextSearchAvailable?: Date;
}

export function CacheIndicator({
  isFromCache,
  lastSearchDate,
  isAdmin,
  nextSearchAvailable,
}: CacheIndicatorProps) {
  if (!isFromCache && !isAdmin) {
    return null;
  }

  if (isFromCache) {
    return (
      <Alert className="mb-4 border-blue-200 bg-blue-50">
        <CheckCircle2 className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900">
          <strong>Resultados em cache:</strong> Estes são os resultados da busca realizada em{" "}
          {lastSearchDate || "hoje"}. A próxima busca estará disponível amanhã.
          {isAdmin && (
            <div className="mt-2 flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4" />
              Como administrador, você pode fazer uma nova busca a qualquer momento.
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (isAdmin) {
    return (
      <Alert className="mb-4 border-purple-200 bg-purple-50">
        <Shield className="h-4 w-4 text-purple-600" />
        <AlertDescription className="text-purple-900">
          <strong>Modo administrador:</strong> Você pode fazer múltiplas buscas por dia. Usuários
          normais estão limitados a uma busca por dia.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
