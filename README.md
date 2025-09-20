# 🌐 Quantumm - Tradutor Inteligente

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-2.3.3-green.svg)](https://flask.palletsprojects.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active-success.svg)](https://github.com/mayconmancilha/quantumm)

> **Quantumm** é um tradutor web moderno e inteligente que oferece tradução instantânea entre múltiplos idiomas com uma interface elegante e intuitiva, inspirada no design do Google Translate.

## ✨ Funcionalidades Principais

- 🚀 **Tradução Instantânea**: Tradução em tempo real conforme você digita
- 🌍 **Múltiplos Idiomas**: Suporte para mais de 10 idiomas populares
- 🎯 **Detecção Automática**: Identifica automaticamente o idioma de origem
- 📱 **Design Responsivo**: Interface adaptável para desktop, tablet e mobile
- 🎨 **Interface Moderna**: Design dark elegante inspirado no Google Translate
- 📋 **Copiar Texto**: Copie traduções com um clique
- 🔊 **Síntese de Voz**: Ouça a pronúncia das traduções
- ⌨️ **Atalhos de Teclado**: Navegação rápida com shortcuts
- 🔒 **Privacidade Garantida**: Processamento seguro dos dados

## 🛠️ Tecnologias Utilizadas

### Backend
- **Python 3.8+** - Linguagem principal
- **Flask 2.3.3** - Framework web minimalista
- **Google Translate API** - Serviço de tradução
- **Gunicorn** - Servidor WSGI para produção

### Frontend
- **HTML5** - Estrutura semântica
- **CSS3** - Estilização avançada
- **JavaScript ES6+** - Interatividade e funcionalidades
- **Tailwind CSS** - Framework de utilitários CSS
- **Font Awesome** - Ícones vetoriais
- **Google Fonts** - Tipografia (Inter)

### Ferramentas e Serviços
- **Vercel** - Plataforma de deploy
- **Git** - Controle de versão
- **GitHub** - Repositório e colaboração

## 📦 Instalação

### Pré-requisitos
- Python 3.8 ou superior
- pip (gerenciador de pacotes Python)
- Git

### Passo a Passo

1. **Clone o repositório**
   ```bash
   git clone https://github.com/mayconmancilha/quantumm.git
   cd quantumm
   ```

2. **Crie um ambiente virtual**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   ```

3. **Instale as dependências**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure as variáveis de ambiente** (opcional)
   ```bash
   cp .env.example .env
   # Edite o arquivo .env conforme necessário
   ```

5. **Execute a aplicação**
   ```bash
   python app.py
   ```

6. **Acesse no navegador**
   ```
   http://localhost:5000
   ```

## 🚀 Como Usar

1. **Digite ou cole** o texto que deseja traduzir no campo "Texto Original"
2. **Selecione o idioma de origem** (ou deixe em "Detectar idioma")
3. **Escolha o idioma de destino** no campo "Tradução"
4. **Aguarde a tradução automática** ou pressione `Ctrl+Enter` para traduzir
5. **Use os botões de ação**:
   - 📋 **Copiar**: Copia a tradução para a área de transferência
   - 🔊 **Ouvir**: Reproduz a pronúncia da tradução

### Atalhos de Teclado
- `Ctrl + K`: Focar no campo de texto
- `Ctrl + Enter`: Traduzir texto
- `Ctrl + C`: Copiar tradução (quando não há texto selecionado)
- `Ctrl + L`: Limpar todos os campos
- `Esc`: Cancelar tradução em andamento

## 📸 Screenshots

<!-- Adicione aqui screenshots da aplicação -->
*Screenshots serão adicionados em breve*

## 🌐 Demo Online

🔗 **Link do Site**: [https://quantumm-translator.vercel.app](https://quantumm-translator.vercel.app)

*Acesse a versão online e experimente todas as funcionalidades!*

## 📁 Estrutura do Projeto

```
quantumm/
├── 📄 app.py              # Aplicação Flask principal
├── 📄 translate.py        # Lógica de tradução
├── 📄 config.py          # Configurações da aplicação
├── 📄 index.html         # Interface principal
├── 📄 script.js          # JavaScript frontend
├── 📄 requirements.txt   # Dependências Python
├── 📄 runtime.txt        # Versão do Python
├── 📄 Procfile          # Configuração Heroku
├── 📄 vercel.json       # Configuração Vercel
├── 📄 .gitignore        # Arquivos ignorados pelo Git
├── 📄 .env.example      # Exemplo de variáveis de ambiente
└── 📄 README.md         # Este arquivo
```

## 🤝 Contribuição

Contribuições são sempre bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

**Maycon Mancilha**
- GitHub: [@mayconmancilha](https://github.com/mayconmancilha)
- LinkedIn: [mayconmancilha](https://linkedin.com/in/mayconmancilha)
- Email: contato@mayconmancilha.dev

## 🙏 Agradecimentos

- Google Translate API pela excelente API de tradução
- Tailwind CSS pela framework de CSS utilitária
- Font Awesome pelos ícones incríveis
- Vercel pela plataforma de deploy gratuita
- Comunidade open source pelo suporte e inspiração

---

<div align="center">
  <p>⭐ Se este projeto te ajudou, considere dar uma estrela!</p>
  <p>🚀 Desenvolvido com ❤️ e tecnologia de IA avançada para quebrar barreiras linguísticas</p>
</div>