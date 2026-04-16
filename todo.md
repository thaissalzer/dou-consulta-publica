# Project TODO

- [x] Design system: cores institucionais, tipografia Playfair Display + Source Sans 3
- [x] Backend: endpoint tRPC para buscar Consultas Públicas no DOU por data
- [x] Frontend: página principal com seletor de data e lista de resultados
- [x] Frontend: cards de resultado com seção, título, órgão, data, resumo e link
- [x] Frontend: estados de loading, vazio e erro
- [x] Frontend: responsividade mobile
- [x] Testes: vitest para o endpoint de busca

## Novo Requisito (24/03/2026)
- [x] Backend: endpoint para retornar lista de órgãos únicos
- [x] Backend: filtrar resultados por órgão selecionado
- [x] Frontend: adicionar seletor de órgão acima do seletor de data
- [x] Frontend: atualizar query para incluir órgão como parâmetro
- [ ] Testar filtro com dados reais (bloqueado por erro de conectividade ao DOU)

## Novo Requisito (27/03/2026)
- [x] Backend: adicionar busca por "tomada de subsídios"
- [x] Backend: refatorar para aceitar tipo de busca como parâmetro
- [x] Frontend: adicionar seletor de tipo de busca (Consulta Pública / Tomada de Subsídios / Ambas)
- [ ] Testar ambos os tipos de busca

## Novo Requisito (27/03/2026 - Notificações por Email)
- [x] Database: criar tabela para rastrear publicações já processadas
- [x] Backend: criar job diário que busca novas publicações
- [x] Backend: implementar lógica de detecção de novos resultados
- [x] Backend: configurar envio de emails com resultados
- [x] Testar notificações com dados reais

## Novo Requisito (30/03/2026 - Filtro por Tipo de Documento)
- [x] Backend: analisar padrões e criar função de extração de tipo de documento
- [x] Backend: implementar filtros para incluir apenas Consultas Públicas e Tomadas de Subsídios legítimas
- [x] Backend: excluir documentos indesejados (avisos genéricos, editais, portarias, registros)
- [x] Frontend: adicionar seletor de tipo de documento
- [ ] Testar filtros com URLs fornecidas

## Novo Requisito (15/04/2026 - Busca por Intervalo de Datas)
- [x] Frontend: adicionar campos de data inicial e data final
- [x] Frontend: atualizar lógica para buscar múltiplas datas
- [x] Backend: processar intervalo de datas e combinar resultados
- [ ] Testar intervalo de datas com diferentes períodos

## Ajuste (16/04/2026)
- [x] Reordenar opções de "Tipo de Busca" para "Ambas" aparecer primeiro
- [x] Definir "Ambas" como opção padrão

## Ajuste (16/04/2026 - Remover "Ambas")
- [x] Remover opção "Ambas" do filtro "Tipo de Busca"
- [x] Definir "Consultas Públicas" como opção padrão
- [x] Atualizar backend para remover suporte a 'ambas'

## Novo Requisito (16/04/2026 - Incluir Portarias Relacionadas)
- [x] Backend: atualizar lógica para incluir Portarias que mencionem "CONSULTA PÚblica" ou "TOMADA DE SUBSÍDIOS"
- [x] Backend: adicionar tipo de documento "PORTARIA" aos resultados quando relevante
- [ ] Testar com URLs fornecidas

## Novo Requisito (16/04/2026 - Buscar em Título e Ementa)
- [x] Backend: atualizar extractDocumentType para procurar em título E ementa
- [x] Backend: passar ementa (abstract) para a função de extração
- [ ] Testar com Portaria nº 86 de 23/02/2026
