# Análise de Padrões de Documentos do DOU

## URLs que DEVEM ser incluídas (Consultas Públicas e Tomadas de Subsídios):

1. `aviso-de-consulta-publica-n-1/2026` → AVISO DE CONSULTA PÚBLICA
2. `aviso-de-tomada-de-subsidios-n-1/2026` → AVISO DE TOMADA DE SUBSÍDIOS
3. `aviso-de-prorrogacao-689540033` → AVISO DE PRORROGAÇÃO (de Consulta Pública)
4. `aviso-de-prorrogacaoconsulta-publica-n-12/2025` → AVISO DE PRORROGAÇÃO CONSULTA PÚBLICA
5. `aviso-de-reabertura-consulta-publica-gm/mma-n-1` → AVISO DE REABERTURA CONSULTA PÚBLICA
6. `consulta-publica-n-3-de-26-de-fevereiro-de-2026` → CONSULTA PÚBLICA
7. `consulta-publica-n-9-de-23-de-fevereiro-de-2026` → CONSULTA PÚBLICA
8. `aviso-de-consulta-publica-689758464` → AVISO DE CONSULTA PÚBLICA

## URLs que NÃO devem ser incluídas (Documentos indesejados):

1. `aviso-694287701` → AVISO genérico (sem contexto de consulta/subsídio)
2. `portaria-gm/mdic-n-68` → PORTARIA (documento administrativo)
3. `edital-de-notificacao-689180499` → EDITAL DE NOTIFICAÇÃO
4. `aviso-de-registro-de-diplomas-n-2/2026` → AVISO DE REGISTRO DE DIPLOMAS
5. `portaria-ibama-n-27` → PORTARIA (documento administrativo)
6. `edital-de-notificacao-689884715` → EDITAL DE NOTIFICAÇÃO
7. `aviso-de-registro-de-diplomas-689785339` → AVISO DE REGISTRO DE DIPLOMAS
8. `pauta-da-346-reuniao-ordinaria` → PAUTA DE REUNIÃO

## Padrões Identificados:

### INCLUIR:
- Contém "consulta-publica" ou "tomada-de-subsidios" no URL
- Contém "aviso-de-consulta-publica" ou "aviso-de-tomada-de-subsidios"
- Contém "aviso-de-prorrogacao" + menção a "consulta-publica" ou "subsidios"
- Contém "aviso-de-reabertura" + menção a "consulta-publica"

### EXCLUIR:
- "portaria" (documento administrativo)
- "edital-de-notificacao" (edital genérico)
- "aviso-de-registro-de-diplomas" (registro administrativo)
- "pauta-da" (pauta de reunião)
- "aviso" simples sem contexto de consulta/subsídio

## Regra de Filtro Proposta:

```
INCLUIR se:
  (URL contém "consulta-publica" OU URL contém "tomada-de-subsidios" OU
   URL contém "aviso-de-consulta-publica" OU URL contém "aviso-de-tomada-de-subsidios" OU
   (URL contém "aviso-de-prorrogacao" E (URL contém "consulta-publica" OU título contém "Consulta Pública")) OU
   (URL contém "aviso-de-reabertura" E URL contém "consulta-publica"))
  E
  NÃO (URL contém "portaria" OU URL contém "edital-de-notificacao" OU 
       URL contém "aviso-de-registro-de-diplomas" OU URL contém "pauta-da")
```

## Tipos de Documento Identificados:

1. **CONSULTA PÚBLICA** - Consulta Pública direta
2. **AVISO DE CONSULTA PÚBLICA** - Aviso de Consulta Pública
3. **TOMADA DE SUBSÍDIOS** - Tomada de Subsídios direta
4. **AVISO DE TOMADA DE SUBSÍDIOS** - Aviso de Tomada de Subsídios
5. **AVISO DE PRORROGAÇÃO** - Prorrogação de Consulta Pública/Subsídios
6. **AVISO DE REABERTURA** - Reabertura de Consulta Pública
