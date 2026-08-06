# Dashboard Leads - Next Distribuição Inteligente

## Brainstorm de Design

### Abordagem 1: "Data Command Center"
- **Tema**: Dark command center com painéis glassmorphism e accent verde neon
- **Brief**: Dashboard estilo centro de controle com fundo escuro, cards translúcidos e indicadores luminosos que transmitem monitoramento em tempo real
- **Probabilidade**: 0.07

### Abordagem 2: "Clean Analytics"
- **Tema**: Minimalismo profissional com fundo claro, tipografia editorial e gráficos precisos
- **Brief**: Interface limpa e sofisticada inspirada em dashboards de BI enterprise, com muito espaço em branco, hierarquia tipográfica forte e visualização de dados elegante
- **Probabilidade**: 0.08

### Abordagem 3: "Industrial Grid"
- **Tema**: Layout assimétrico industrial com blocos densos, tipografia mono e acentos em amber
- **Brief**: Dashboard com estética de terminal/moderno industrial, grids compactos, dados densos, sem arredondamentos excessivos, foco em densidade informacional
- **Probabilidade**: 0.06

---

## Abordagem Escolhida: "Data Command Center"

### Design Movement
Dark Glassmorphism meets Mission Control — inspirado em dashboards de monitoramento de operações e centros de controle, com toques de glassmorphism moderno.

### Core Principles
1. **Profundidade Hierárquica** — Camadas visuais criam hierarquia natural: fundo escuro profundo, cards elevados com glass effect, indicadores luminosos no topo
2. **Dados como Protagonistas** — Cada pixel serve a informação. Métricas grandes e legíveis, gráficos claros, sem decoração vazia
3. **Feedback Visual Imediato** — Estados de atividade (online/offline), alertas e transições comunicam status em tempo real
4. **Densidade Controlada** — Muito dado na tela, mas organizado com grids inteligentes e agrupamento visual

### Color Philosophy
- **Background**: `#0a0e1a` — azul escuro profundo, transmite seriedade e foco
- **Surface**: `#111827` com 60-80% opacidade e blur — glassmorphism sutil
- **Accent Primary**: `#10b981` (emerald) — sucesso, online, leads novos
- **Accent Secondary**: `#3b82f6` (blue) — informações, grafos, conexões
- **Alert**: `#f59e0b` (amber) — atenção, leads em transição
- **Danger**: `#ef4444` (red) — problemas, leads perdidos
- **Text Primary**: `#f1f5f9` — máximo contraste para legibilidade
- **Text Muted**: `#94a3b8` — informações secundárias

### Layout Paradigm
Sidebar fixa à esquerda com navegação entre seções, conteúdo principal com grid responsivo de cards. Top bar com métricas globais (KPIs). Layout de "control room" — informação centralizada, acessível de qualquer ponto.

### Signature Elements
1. **Indicadores Pulsantes** — Dots verdes pulsando para atendentes online, criam sensação de vida em tempo real
2. **Glass Cards** — Cards com fundo semi-transparente e border sutil, criam profundidade sem distrair
3. **Gradientes de Progresso** — Barras de progresso com gradientes sutis que indicam carga de trabalho

### Interaction Philosophy
Hover revela detalhes adicionais, cliques expandem cards com informações completas. Transições suaves mas rápidas (180ms). Tooltips informativos sobre gráficos. Filtros inline sem navegar para outras páginas.

### Animation
- Entrada: stagger fade-in de cards (30ms entre cada)
- Números: contador animado ao carregar
- Pipeline: cards deslizam horizontalmente com suavidade
- Indicadores: pulse sutil (2s cycle) para status online
- Hover: scale(1.02) com shadow increase

### Typography System
- **Headings**: "Inter" Bold/SemiBold — limpa e moderna
- **Body**: "Inter" Regular/Medium — legibilidade máxima
- **Numbers/Data**: "JetBrains Mono" — para valores numéricos, monoespaçada cria alinhamento perfeito
- **Hierarchy**: H1 (28px/bold), H2 (22px/semibold), H3 (18px/semibold), Body (14px/regular), Caption (12px/medium)

### Brand Essence
"Centro de controle operacional para distribuição inteligente de leads — onde cada atendente, cada conexão e cada lead são visíveis em tempo real."
**Personalidade**: Profissional, Eficiente, Tecnológico

### Brand Voice
- Headlines: Diretos e orientados a ação ("Distribuição Hoje", "Carga de Atendimento")
- CTAs: Funcionais ("Filtrar por Atendente", "Exportar Relatório")
- Microcopy: Informativa e concisa ("3 leads aguardando distribuição")
- Exemplos: "Pipeline Value Promotora — 12 leads ativos" / "Taxa de resposta: 87% hoje"

### Wordmark & Logo
Ícone abstrato de um "funil inteligente" — linhas convergentes formando um diamante/nó de rede, em verde esmeralda sobre fundo escuro. Representa a distribuição inteligente de leads para múltiplos atendentes.

### Signature Brand Color
**Emerald Glow** — `#10b981` com glow sutil (`box-shadow: 0 0 20px rgba(16,185,129,0.3)`). Usado nos indicadores de status online e nas métricas principais.

## Style Decisions
- Usar tema escuro (dark) como padrão
- Cards com efeito glass (backdrop-blur + bg com opacidade)
- Tipografia monoespaçada para números (JetBrains Mono via Google Fonts)
- Sidebar fixa com navegação entre seções
- Indicadores de status com animação pulse
