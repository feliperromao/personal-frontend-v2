---
name: MyPersonal.App
description: Orientação de treino precisa, acessível e guiada por cadência.
colors:
  cadence-violet: "#5B21D1"
  cadence-violet-deep: "#4215A5"
  energy-lime: "#D1DC27"
  cool-canvas: "#F8F8F8"
  surface-white: "#FFFFFF"
  coaching-ink: "#0B1226"
  muted-slate: "#5D6475"
  route-line: "#D8DCE7"
  success-green: "#477A19"
  information-blue: "#2675D8"
  warning-amber: "#B76500"
  error-red: "#B42318"
typography:
  display:
    fontFamily: "Archivo Narrow Variable, Arial Narrow, Arial, sans-serif"
    fontSize: "clamp(2.25rem, 8vw, 5rem)"
    fontWeight: 780
    lineHeight: 0.98
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Archivo Narrow Variable, Arial Narrow, Arial, sans-serif"
    fontSize: "clamp(1.75rem, 5vw, 3rem)"
    fontWeight: 760
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Archivo Narrow Variable, Arial Narrow, Arial, sans-serif"
    fontSize: "1.35rem"
    fontWeight: 730
    lineHeight: 1.2
  body:
    fontFamily: "Archivo Narrow Variable, Arial Narrow, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Archivo Narrow Variable, Arial Narrow, Arial, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 700
    lineHeight: 1.5
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.cadence-violet}"
    textColor: "{colors.surface-white}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "10px 18px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.cadence-violet-deep}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.sm}"
  input-search:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.coaching-ink}"
    rounded: "{rounded.md}"
    padding: "6px"
    height: "56px"
  card-mobile:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.coaching-ink}"
    rounded: "{rounded.lg}"
    padding: "16px"
---

# Design System: MyPersonal.App

## Overview

**Creative North Star: "Ritmo de treino"**

MyPersonal.App trata o treino como uma sequência legível de checkpoints. A interface é clara e operacional, mas tem identidade própria: tipografia estreita e firme, trilhos finos, numerais tabulares, marcos de progresso e a marca de três batidas tornam ordem, estado e próxima ação imediatamente reconhecíveis.

O sistema permanece leve para o uso no celular em academia e denso o suficiente para a gestão do personal no desktop. A hierarquia vem de escala, peso, linhas de percurso e cor semântica; não de pilhas de cartões ou decoração fitness genérica.

**Key Characteristics:**

- Cadência visível por trilhos, etapas e estados concluído/atual/próximo.
- Base clara e fria com ink profundo e violeta energético reservado às ações e ao estado ativo.
- Uma única família sans estreita, auto-hospedada e variável.
- Controles grandes, foco evidente e cópia de recuperação em português.

## Colors

A paleta combina papel frio, ink de alto contraste e um violeta de ação. Lima, verde, azul, âmbar e vermelho têm papéis semânticos independentes.

### Primary

- **Violeta de Cadência:** ativa ações primárias, navegação selecionada e o checkpoint atual.
- **Violeta Profundo:** comunica hover e pressão sem introduzir uma nova família cromática.

### Secondary

- **Lima de Energia:** marca instruções e métricas de esforço; nunca substitui texto.
- **Azul de Informação:** foco visível, links de apoio e informação não destrutiva.

### Neutral

- **Canvas Frio:** campo contínuo do aplicativo.
- **Branco de Superfície:** diálogos, cartões e coleções elevadas por contraste tonal.
- **Ink de Orientação:** títulos, valores e texto principal.
- **Slate Silencioso:** texto secundário e metadados.
- **Linha de Percurso:** divisores, trilhos e contornos decorativos discretos.

**The One Active Violet Rule.** O violeta identifica ação ou estado ativo; itens neutros não competem com ele.

**The Semantic Independence Rule.** Sucesso, informação, atenção e erro mantêm cor e texto próprios; cor nunca é o único sinal.

## Typography

**Display Font:** Archivo Narrow Variable (com Arial Narrow e Arial como fallback)

**Body Font:** Archivo Narrow Variable (com Arial Narrow e Arial como fallback)

**Character:** uma voz única, estreita e atlética sem clichê esportivo. A variação de peso separa instrução, dado e ação; a largura compacta preserva leitura em 320 px.

### Hierarchy

- **Display** (780, `clamp(2.25rem, 8vw, 5rem)`, 0.98): exercício atual e títulos de maior decisão.
- **Headline** (760, `clamp(1.75rem, 5vw, 3rem)`, 1.05): valores, temporizadores e títulos de seção.
- **Title** (730, `1.35rem`, 1.2): nomes de treino e próximo exercício.
- **Body** (400, `1rem`, 1.55): instruções, descrições e mensagens de estado.
- **Label** (700, `0.9rem`, 1.5): controles, navegação, métricas e metadados.

**The Operational Numeral Rule.** Carga, repetição, ordem e tempo usam numerais tabulares quando a largura precisa permanecer estável.

**The Tight Display Rule.** Títulos podem usar tracking entre `-0.02em` e `-0.03em`; nunca ultrapassam `-0.04em`.

## Layout

O ritmo parte de 8 px, com meios-passos de 4 px para ajustes internos. O conteúdo começa em 320 px sem rolagem horizontal. No celular, cabeçalho compacto, conteúdo e barra inferior respeitam safe areas; no desktop, uma lateral persistente de 264 px libera o plano de trabalho para tabelas, formulários e o treino ativo.

Coleções usam DataGrid no desktop e cartões lineares no celular. Formulários ocupam a tela no celular e um diálogo no desktop. O treino ativo mantém uma sequência vertical única para que instrução, métrica, séries, descanso, próximo exercício e CTA sejam lidos na ordem de execução.

**The No Hidden Action Rule.** Barras fixas e FABs reservam espaço; nunca cobrem o último controle ou o conteúdo.

## Elevation & Depth

O sistema é plano por padrão. Separação vem de contraste tonal e linhas de 1 px. A única elevação ambiental recorrente pertence a diálogos e superfícies que protegem foco (`0 12px 32px rgba(11, 18, 38, 0.10)`). Cabeçalhos fixos usam translucidez apenas para preservar contexto durante rolagem, não como decoração.

**The Flat-at-Rest Rule.** Coleções e cartões não acumulam borda e sombra; diálogo é a exceção deliberada.

## Shapes

Controles pequenos usam cantos de 8 px, superfícies comuns 12 px e cartões/diálogos 16 px. Checkpoints são circulares porque representam posição na sequência. Pills ficam restritas a estados ou controles compactos; blocos de conteúdo mantêm cantos moderados.

## Components

### Buttons

- **Shape:** canto firme de 8 px, altura mínima de 44 px e padding horizontal de 18 px.
- **Primary:** violeta de cadência com texto branco; hover usa violeta profundo.
- **Focus:** anel azul de 3 px, afastado 3 px do componente.
- **Disabled:** permanece legível e comunica indisponibilidade junto de texto de contexto quando a causa é conexão.

### Cards / Containers

- **Corner Style:** 16 px no mobile; tabelas desktop usam superfície plana.
- **Background:** branco sobre canvas frio.
- **Shadow Strategy:** sem sombra em repouso.
- **Border:** uma linha de percurso quando a separação tonal não basta.
- **Internal Padding:** 16 px no celular, 24–32 px em áreas amplas.

### Inputs / Fields

- **Style:** campo branco, altura mínima de 44 px, contorno neutro e rótulo persistente.
- **Focus:** anel azul global e estado MUI associado ao rótulo.
- **Error / Disabled:** mensagem ligada ao campo; o primeiro erro recebe foco. Campos desabilitados não simulam edição.

### Navigation

No celular, itens por papel ocupam toda a largura da barra inferior e mantêm alvo mínimo de 44 px. No desktop, a lateral ink usa violeta apenas no item atual. Conta, instalação e saída pertencem ao menu da conta, nunca às abas principais.

### Training Cadence Rail

O trilho mostra séries concluídas em verde, a série atual em violeta com anel duplo e as próximas em neutro. Ao avançar, o novo checkpoint faz uma única pulsação; `prefers-reduced-motion` remove esse movimento sem esconder a mudança de estado.

## Do's and Don'ts

### Do:

- **Do** manter a próxima ação visível e nomeada durante o treino.
- **Do** usar skeleton, vazio, erro, offline e retry próximos da região afetada.
- **Do** manter controles interativos com pelo menos 44 × 44 px e foco visível.
- **Do** usar a marca de três batidas e os ícones Material em uma linguagem consistente.

### Don't:

- **Don't** introduzir halteres genéricos, logo do React, fotografias de banco de imagens ou clichês fitness como identidade.
- **Don't** usar cor como única indicação de estado ou esconder erro apenas em snackbar.
- **Don't** transformar toda informação em cartão, criar rolagem horizontal no celular ou sobrepor barras fixas ao conteúdo.
- **Don't** adicionar dark mode, agenda, push ou edição de perfil sem uma rodada de produto própria.
