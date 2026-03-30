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
