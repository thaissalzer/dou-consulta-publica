# Brainstorm de Design - Busca de Consultas Públicas do DOU

## Contexto
Página web para buscar e visualizar Consultas Públicas publicadas no Diário Oficial da União (DOU), filtradas por data. Público-alvo: servidores públicos, advogados, empresários e cidadãos interessados em participação social.

---

<response>
<idea>

## Ideia 1: "Documento Oficial Digital"

**Design Movement**: Swiss/International Typographic Style com influências de design editorial de jornais oficiais

**Core Principles**:
1. Hierarquia tipográfica rígida e clara, remetendo a documentos oficiais
2. Grid modular com espaçamento generoso
3. Cores institucionais sóbrias (verde e amarelo do Brasil, com tons de cinza)
4. Legibilidade máxima para textos longos

**Color Philosophy**: Paleta baseada nas cores institucionais brasileiras - verde escuro (#006633) como cor primária representando seriedade governamental, amarelo dourado (#FFD700) como acento para destaques, fundo off-white (#FAFAF5) para conforto visual em leitura prolongada, cinza escuro (#2D3436) para texto.

**Layout Paradigm**: Layout editorial de jornal com coluna principal larga para resultados e sidebar estreita para filtros. Header compacto com identidade visual do DOU.

**Signature Elements**:
1. Barra lateral verde escura com filtros de data estilizados como selos oficiais
2. Cards de resultado com borda esquerda colorida indicando a seção do DOU
3. Badge de seção com tipografia condensada

**Interaction Philosophy**: Transições sutis e profissionais. Feedback visual imediato ao selecionar datas. Expansão suave dos cards para mostrar conteúdo completo.

**Animation**: Fade-in sequencial dos resultados. Transição suave na troca de datas. Skeleton loading durante buscas.

**Typography System**: 
- Display: "Playfair Display" para títulos (remetendo a jornais)
- Body: "Source Sans 3" para corpo de texto (legibilidade oficial)
- Monospace: para números de processo e referências

</idea>
<probability>0.07</probability>
<text>Design editorial inspirado em jornais oficiais, com hierarquia tipográfica forte e cores institucionais brasileiras.</text>
</response>

<response>
<idea>

## Ideia 2: "Painel de Controle Governamental"

**Design Movement**: Flat Design Funcional com influências de dashboards de dados governamentais abertos

**Core Principles**:
1. Funcionalidade acima de decoração - cada pixel tem propósito
2. Densidade de informação controlada com espaçamento inteligente
3. Sistema de cores semânticas para categorização
4. Responsividade total para acesso em dispositivos móveis

**Color Philosophy**: Azul marinho profundo (#1B2838) como cor de fundo do header representando autoridade, branco puro (#FFFFFF) para áreas de conteúdo, azul (#2563EB) para ações primárias, tons de cinza quente para hierarquia. Cores de acento por seção: Seção 1 = azul, Seção 2 = verde, Seção 3 = laranja.

**Layout Paradigm**: Layout de aplicação com top bar fixa contendo busca e filtros, área principal com lista de resultados em formato tabular/card híbrido. Sem sidebar - tudo acessível no fluxo vertical.

**Signature Elements**:
1. Barra de busca proeminente com seletor de data integrado
2. Tags coloridas por seção do DOU com ícones
3. Contador de resultados animado

**Interaction Philosophy**: Busca instantânea ao selecionar data. Hover states informativos nos cards. Click para expandir detalhes inline.

**Animation**: Contador numérico animado. Stagger animation nos cards de resultado. Shimmer effect no loading.

**Typography System**:
- Display: "DM Sans" bold para títulos
- Body: "DM Sans" regular para corpo
- Condensed: para metadados e badges

</idea>
<probability>0.05</probability>
<text>Dashboard funcional e limpo com foco em usabilidade e categorização visual por seções do DOU.</text>
</response>

<response>
<idea>

## Ideia 3: "Arquivo Vivo"

**Design Movement**: Neo-Brutalism com toques de design de arquivo/biblioteca

**Core Principles**:
1. Contraste forte e bordas definidas
2. Tipografia bold e assertiva
3. Elementos gráficos que remetem a carimbos e selos oficiais
4. Interatividade lúdica mas funcional

**Color Philosophy**: Fundo creme/pergaminho (#F5F0E8) remetendo a papel envelhecido, preto (#1A1A1A) para texto forte, verde bandeira (#009C3B) como cor de destaque principal, amarelo (#FFDF00) para highlights. Bordas pretas grossas (2-3px) em todos os elementos.

**Layout Paradigm**: Layout assimétrico com grid quebrado. Filtro de data como elemento central destacado. Resultados em cards com bordas grossas e sombras duras (offset shadows).

**Signature Elements**:
1. Seletor de data estilizado como carimbo/selo oficial
2. Cards com sombra dura (hard shadow) e bordas grossas
3. Elementos decorativos que remetem a carimbos "PUBLICADO" e "OFICIAL"

**Interaction Philosophy**: Interações com feedback tátil - botões que "afundam" ao clicar. Hover com deslocamento de sombra. Transições rápidas e snappy.

**Animation**: Efeito de "carimbo" ao carregar resultados. Sombras que se movem no hover. Entrada dos cards com efeito de "empilhamento".

**Typography System**:
- Display: "Space Grotesk" extra-bold para títulos
- Body: "Space Grotesk" regular para corpo
- Accent: "Space Mono" para dados técnicos

</idea>
<probability>0.04</probability>
<text>Design neo-brutalist com estética de arquivo oficial, bordas fortes e elementos que remetem a carimbos e selos.</text>
</response>

---

## Decisão

Escolho a **Ideia 1: "Documento Oficial Digital"** - Design editorial inspirado em jornais oficiais com hierarquia tipográfica forte e cores institucionais brasileiras. Esta abordagem é a mais adequada para o contexto governamental, transmitindo seriedade e confiabilidade, enquanto mantém excelente legibilidade para textos longos típicos de consultas públicas.
