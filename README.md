# Quiz Educativo HIV/AIDS

Uma Progressive Web App (PWA) educacional focada em HIV/AIDS, parte do projeto "A História Cantada da AIDS".

## 📋 Sobre o Projeto

Este é um quiz interativo e educativo que testa conhecimentos sobre prevenção, tratamento e informações gerais sobre HIV/AIDS. O aplicativo foi desenvolvido para combater mitos e promover educação baseada em evidências científicas.

## ✨ Características

- **Progressive Web App (PWA)** - Funciona offline e pode ser instalado como app nativo
- **5 Perguntas Aleatórias** - Cada sessão seleciona 5 questões de um banco de 11 perguntas
- **Audiodescrição** - Todas as perguntas incluem audiodescrição via Howler.js
- **Sistema de Temas** - Suporte para temas claro e escuro
- **Design Responsivo** - Interface adaptável para mobile e desktop
- **Pontuação e Feedback** - Sistema de pontuação com mensagens personalizadas
- **Efeito de Confete** - Animação especial ao acertar todas as questões

## 🛠️ Tecnologias

- **React** (via CDN) - Framework UI sem build step
- **Howler.js** - Gerenciamento de áudio
- **Vanilla JavaScript** - Sem dependências de build
- **Service Workers** - Suporte offline
- **CSS Custom Properties** - Sistema de temas

## 🚀 Como Usar

### Desenvolvimento Local

O aplicativo não requer build step. Basta servir com um servidor HTTP simples:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js
npx serve
```

Depois acesse `http://localhost:8000` no navegador.

### Instalação como PWA

1. Abra o app em um navegador compatível (Chrome, Edge, Safari)
2. Procure o ícone de instalação na barra de endereços
3. Clique em "Instalar" para adicionar à tela inicial

## 📁 Estrutura do Projeto

```
quiz-hiv-aids/
├── index.html              # Página principal
├── app.js                  # Aplicação React
├── manifest.json           # Configuração PWA
├── sw.js                   # Service Worker
├── data/
│   ├── questions.json      # Banco de perguntas (11 questões)
│   └── presentation.json   # Conteúdo da apresentação
├── assets/
│   ├── css/
│   │   ├── tokens.css      # Variáveis de tema
│   │   └── app.css         # Estilos principais
│   ├── audio/              # Arquivos de áudio (q1.mp3 - q11.mp3)
│   ├── img/                # Imagens
│   └── vendor/             # React, ReactDOM, Howler.js
```

## 🎯 Funcionalidades Principais

### Sistema de Quiz

- **Seleção Aleatória**: 5 perguntas são selecionadas aleatoriamente a cada sessão
- **Feedback Imediato**: Resposta correta destacada em verde após confirmação
- **Explicação Visual**: Respostas incorretas aparecem riscadas
- **Pontuação**: Sistema de pontos com feedback personalizado baseado no desempenho

### Gerenciamento de Áudio

- **Instância Única**: Apenas um áudio toca por vez
- **Controle Play/Pause**: Botão de audiodescrição para cada pergunta
- **Limpeza Automática**: Áudio é parado ao navegar entre questões
- **Estado Sincronizado**: Ícone e texto do botão refletem estado do áudio

### Temas

Dois temas disponíveis:
- **Light**: Tema claro (padrão)
- **Dark**: Tema escuro

A preferência é salva em `localStorage` e pode ser alternada via botão no canto superior direito.

## 🔧 Atualizações Recentes

### v1.1.0 - Correção do Sistema de Áudio (2025-11-17)

**Problema Corrigido**: Áudio de perguntas anteriores continuava tocando ao navegar para próxima questão

**Implementação**:
- Adicionada limpeza de áudio na função `handleNext()` (app.js:306-323)
- Áudio parado ao completar quiz em `handleQuizComplete()` (app.js:496-507)
- Limpeza ao reiniciar em `handleRestart()` (app.js:509-520)
- Áudio parado ao voltar da apresentação (app.js:233-244, 552-562)
- Nova função helper `handleNavigate()` para navegação limpa (app.js:533-544)

**Resultado**: Agora apenas o áudio da questão atual pode tocar, garantindo experiência de usuário consistente.

## 📊 Conteúdo Educacional

O quiz aborda tópicos essenciais sobre HIV/AIDS:

1. Formas de transmissão
2. Diferença entre HIV e AIDS
3. Mitos sobre transmissão (beijo, mosquitos, etc.)
4. Prevenção (preservativos, PrEP)
5. Importância do teste
6. Conceito I=I (Indetectável = Intransmissível)
7. Transmissão vertical
8. Estado atual de vacinas e tratamento

## 📈 Google Analytics - Rastreamento e Métricas

### ID de Medição
- **Google Analytics 4 ID**: `G-5XBX1ENH9Y`

### Eventos Rastreados

O aplicativo rastreia interações detalhadas dos usuários para entender o desempenho do quiz e o comportamento dos usuários:

#### 1. Visualização de Páginas
- **Evento**: `page_view`
- **Dispara quando**: Usuários navegam entre páginas (Home, Apresentação, Quiz, Resultado)
- **Parâmetros**:
  - `page_name`: Identificador da página
  - `page_title`: Título legível da página
  - `page_location`: URL completo
  - `page_path`: Caminho com hash

#### 2. Visualização de Perguntas
- **Evento**: `view_question`
- **Dispara quando**: Cada nova pergunta é exibida
- **Parâmetros**:
  - `question_id`: Identificador da pergunta (ex: "q1", "q2")
  - `question_number`: Número da pergunta (1-5)
  - `question_text`: Texto completo da pergunta
  - `event_category`: "Quiz"
  - `event_label`: Identificador da pergunta com número

#### 3. Seleção de Respostas
- **Evento**: `select_answer`
- **Dispara quando**: Usuário confirma sua escolha de resposta
- **Parâmetros**:
  - `question_id`: Identificador da pergunta
  - `question_number`: Número da pergunta
  - `selected_option`: Texto da resposta selecionada
  - `is_correct`: Booleano indicando se a resposta estava correta
  - `event_category`: "Quiz"
  - `event_label`: Número da pergunta + opção + correção

**Insight Principal**: Este evento permite determinar quais opções de resposta são mais frequentemente selecionadas para cada pergunta, ajudando a identificar conceitos errôneos comuns.

#### 4. Conclusão do Quiz
- **Evento**: `complete_quiz`
- **Dispara quando**: Usuário termina todas as 5 perguntas
- **Parâmetros**:
  - `score`: Número de respostas corretas (0-5)
  - `total_questions`: Sempre 5
  - `percentage`: Pontuação como percentual (0-100)
  - `event_category`: "Quiz"
  - `event_label`: String resumindo a pontuação
  - `value`: Pontuação numérica para fácil agregação

#### 5. Reprodução de Áudio
- **Evento**: `play_audio`
- **Dispara quando**: Áudio começa a tocar
- **Parâmetros**:
  - `audio_type`: Tipo de áudio ("question" ou "presentation")
  - `content_id`: Identificador do conteúdo (ex: "q1", "presentation")
  - `event_category`: "Audio"
  - `event_label`: Tipo e ID combinados

#### 6. Alternância de Tema
- **Evento**: `toggle_theme`
- **Dispara quando**: Usuário alterna entre modo claro/escuro
- **Parâmetros**:
  - `theme`: Nome do novo tema ("light" ou "dark")
  - `event_category`: "Settings"
  - `event_label`: Descrição da mudança de tema

## 📊 Acessando os Dados do Analytics

### Passo 1: Acessar o Google Analytics 4

1. Acesse [Google Analytics](https://analytics.google.com/)
2. Faça login com a conta Google que tem acesso à propriedade
3. Selecione a propriedade com ID `G-5XBX1ENH9Y`

### Passo 2: Visualizar Dados em Tempo Real

Para ver atividade ao vivo dos usuários:

1. Na barra lateral esquerda, clique em **Relatórios** > **Tempo real**
2. Você verá:
   - Usuários ativos agora
   - Contagem de eventos por nome (últimos 30 minutos)
   - Usuários por título de página
   - Usuários por país, cidade

### Passo 3: Analisar Desempenho do Quiz

#### Visualizar Desempenho das Perguntas

1. Navegue para **Relatórios** > **Engajamento** > **Eventos**
2. Clique no evento **`view_question`**
3. Clique em **Adicionar dimensão** e selecione:
   - `question_id` - Veja quais perguntas são mais visualizadas
   - `question_number` - Veja se usuários abandonam em certas posições

#### Analisar Seleções de Respostas (Mais Importante)

Para ver quais opções de resposta são selecionadas com mais frequência:

1. Navegue para **Explorar** na barra lateral
2. Clique em **Criar uma exploração em branco**
3. Configure a exploração:

   **Variáveis:**
   - **Dimensões**: Adicione `question_id`, `selected_option`, `is_correct`
   - **Métricas**: Adicione `Contagem de eventos`

   **Configurações da guia:**
   - **Técnica**: Escolha "Formato livre"
   - **Linhas**: Arraste `question_id` e `selected_option`
   - **Valores**: Arraste `Contagem de eventos`
   - **Filtros**: Adicione filtro onde `Nome do evento` = `select_answer`

4. Você verá um detalhamento mostrando:
   - Cada pergunta
   - Quais respostas foram selecionadas
   - Quantas vezes cada uma foi selecionada
   - Se estavam corretas ou incorretas

**Dica Pro**: Adicione `is_correct` às colunas para separar seleções corretas vs incorretas.

#### Visualizar Taxas de Conclusão do Quiz

1. Navegue para **Explorar**
2. Crie uma nova exploração
3. Adicione estes funis:
   - Passo 1: `page_view` onde `page_name` = "quiz"
   - Passo 2: `view_question` onde `question_number` = "1"
   - Passo 3: `view_question` onde `question_number` = "5"
   - Passo 4: `complete_quiz`

Isso mostra as taxas de abandono durante o quiz.

#### Analisar Distribuição de Pontuações

1. Navegue para **Relatórios** > **Engajamento** > **Eventos**
2. Clique no evento **`complete_quiz`**
3. Adicione dimensão secundária: `score` ou `percentage`
4. Você verá:
   - Quantos usuários pontuaram 0, 1, 2, 3, 4 ou 5
   - Percentual médio de conclusão
   - Total de conclusões do quiz

### Passo 4: Criar Relatórios Personalizados

#### Painel de Análise de Respostas

1. Vá para **Explorar** > **Exploração em branco**
2. Nomeie como "Análise de Respostas do Quiz"
3. Adicione visualização:
   - **Tipo de gráfico**: Tabela ou Gráfico de barras
   - **Linhas**: `question_id`, `selected_option`
   - **Colunas**: `is_correct`
   - **Valores**: `Contagem de eventos`
   - **Filtro**: `Nome do evento` = `select_answer`

Isso dá uma visão clara de quais respostas incorretas são mais comumente selecionadas.

#### Fluxo de Engajamento do Usuário

1. Vá para **Explorar** > **Exploração de caminho**
2. Defina ponto inicial: `page_view` (page_name = "home")
3. Visualize o caminho que os usuários seguem pelo app
4. Identifique pontos de abandono

### Passo 5: Exportar Dados

Para exportar dados do analytics para análise adicional:

1. Em qualquer relatório, clique no botão **Compartilhar** (canto superior direito)
2. Selecione **Baixar arquivo** ou **Agendar e-mail**
3. Escolha formato: CSV ou Google Sheets
4. Para análise mais profunda, use **Exportação BigQuery** (requer configuração)

### Métricas Personalizadas Úteis

Crie métricas calculadas em **Admin** > **Definições personalizadas**:

- **Pontuação Média do Quiz**: Métrica personalizada usando parâmetro de valor `complete_quiz`
- **Taxa de Conclusão de Perguntas**: Usuários que visualizam pergunta 5 / usuários que visualizam pergunta 1
- **Taxa de Engajamento com Áudio**: Eventos `play_audio` / total de sessões

## 🔍 Perguntas Comuns de Análise

### "Quais perguntas são mais difíceis?"

1. Vá para **Explorar**
2. Crie relatório com:
   - Linhas: `question_id`
   - Colunas: `is_correct`
   - Valores: `Contagem de eventos`
   - Filtro: `Nome do evento` = `select_answer`
3. Calcule percentual correto para cada pergunta

### "Quais são as respostas erradas mais comuns?"

1. Vá para **Explorar**
2. Filtro: `Nome do evento` = `select_answer` E `is_correct` = false
3. Linhas: `question_id`, `selected_option`
4. Valores: `Contagem de eventos`
5. Ordene por contagem decrescente

### "Quantos usuários completam o quiz inteiro?"

1. Compare contagens de eventos:
   - `view_question` onde `question_number` = "1"
   - `complete_quiz`
2. Calcule taxa de conclusão: (conclusões / iniciados) × 100

### "Qual é a pontuação média?"

1. Vá para **Relatórios** > **Engajamento** > **Eventos**
2. Clique em **`complete_quiz`**
3. Visualize a métrica "Valor do evento" (esta é a pontuação)
4. Veja valor médio no rodapé do relatório

### Retenção de Dados

- Google Analytics 4 retém dados em nível de evento por **2 meses** por padrão
- Dados agregados são mantidos por **14 meses**
- Para retenção mais longa, exporte para BigQuery

### Privacidade e Conformidade

- Nenhuma informação pessoalmente identificável (PII) é rastreada
- Apenas padrões de uso anônimos
- Conforme com GDPR e regulamentações de proteção de dados

## 🔄 Atualizando o Service Worker

Ao fazer alterações significativas:

1. Abra `sw.js`
2. Incremente a constante `VERSION` (ex: `v1` → `v2`)
3. Caches antigos serão limpos automaticamente

## 🧪 Testando PWA

Para testar funcionalidades PWA:

1. Servir via HTTPS ou localhost
2. DevTools → Application → Service Workers para verificar registro
3. DevTools → Network → Throttling → Offline para testar offline
4. Procurar prompt de instalação na barra de endereços

## 📱 Compatibilidade

- Chrome/Edge: ✅ Suporte completo
- Safari: ✅ Suporte completo
- Firefox: ✅ Funcional (PWA limitado)
- Mobile: ✅ Design responsivo

## 🤝 Contribuindo

Este projeto faz parte do projeto "A História Cantada da AIDS". Para contribuir:

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é parte do projeto educacional "A História Cantada da AIDS".

## 🙏 Agradecimentos

Desenvolvido como ferramenta educacional para promover conhecimento científico sobre HIV/AIDS e combater estigma e desinformação.

---

**Desenvolvido com ❤️ para educação e prevenção**
