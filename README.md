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
