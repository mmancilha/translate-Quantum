# 🌐 Translate-Quantum

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![Transformers](https://img.shields.io/badge/🤗%20Transformers-4.56+-orange.svg)](https://huggingface.co/transformers/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.8+-red.svg)](https://pytorch.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Um tradutor inteligente de **inglês para português** usando o modelo de IA **Helsinki-NLP/opus-mt-tc-big-en-pt** da Hugging Face. Este projeto oferece tradução de alta qualidade com interface interativa e suporte para tradução em lote.

## ✨ Características

- 🤖 **IA Avançada**: Utiliza o modelo Helsinki-NLP para traduções precisas
- 🚀 **Interface Interativa**: Modo de tradução em tempo real
- 📦 **Tradução em Lote**: Processa múltiplos textos simultaneamente
- 🔒 **Ambiente Isolado**: Configuração com ambiente virtual Python
- 💻 **Fácil de Usar**: Interface simples e intuitiva

## 🚀 Demonstração

### Exemplos de Tradução

```
Inglês: "Hello, how are you today?"
Português: "Olá, como estás hoje?"

Inglês: "The weather is beautiful today."
Português: "O tempo está lindo hoje."

Inglês: "I love learning new languages."
Português: "Adoro aprender novas línguas."
```

## 📋 Pré-requisitos

- Python 3.8 ou superior
- pip (gerenciador de pacotes Python)
- Git (para clonar o repositório)

## ⚡ Instalação Rápida

```bash
# Clone o repositório
git clone https://github.com/mmancilha/translate-Quantum.git
cd translate-Quantum

# Crie e ative o ambiente virtual
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows PowerShell
# ou
source venv/bin/activate     # Linux/Mac

# Instale as dependências
pip install -r requirements.txt

# Execute o tradutor
python translate.py
```

## Configuração do Ambiente

### Pré-requisitos
- Python 3.8 ou superior
- pip (gerenciador de pacotes Python)

### Instalação

1. **Clone ou baixe o projeto**
   ```bash
   cd c:\Users\mmanc\Music\translate
   ```

2. **Crie um ambiente virtual**
   ```bash
   python -m venv venv
   ```

3. **Ative o ambiente virtual**
   - No Windows (PowerShell):
     ```bash
     .\venv\Scripts\Activate.ps1
     ```
   - No Windows (Command Prompt):
     ```bash
     venv\Scripts\activate.bat
     ```

4. **Instale as dependências**
   ```bash
   pip install -r requirements.txt
   ```

## Dependências Principais

- **transformers**: Biblioteca da Hugging Face para modelos de transformers
- **torch**: Framework de deep learning PyTorch
- **sentencepiece**: Tokenizador para processamento de texto
- **sacremoses**: Ferramentas de pré-processamento de texto

## 🔧 Uso Avançado

### Importar como Módulo

```python
from translate import Translator

# Inicializar o tradutor
translator = Translator()

# Tradução simples
resultado = translator.translate("Hello world!")
print(resultado)  # "Olá mundo!"

# Tradução em lote
textos = ["Good morning", "How are you?", "See you later"]
resultados = translator.translate_batch(textos)
for original, traduzido in zip(textos, resultados):
    print(f"{original} → {traduzido}")
```

## 📁 Estrutura do Projeto

```
translate-Quantum/
├── 📄 translate.py          # Script principal de tradução
├── 📄 requirements.txt      # Dependências do projeto
├── 📄 README.md            # Documentação
├── 📄 .gitignore           # Arquivos ignorados pelo Git
└── 📁 venv/                # Ambiente virtual (não versionado)
```

## 🤖 Modelo Utilizado

- **Modelo**: [Helsinki-NLP/opus-mt-tc-big-en-pt](https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-en-pt)
- **Função**: Tradução de inglês para português
- **Fonte**: Hugging Face Model Hub
- **Tamanho**: ~465MB
- **Qualidade**: Alta precisão para textos gerais

## 🛠️ Dependências Principais

- **transformers**: Biblioteca da Hugging Face para modelos de transformers
- **torch**: Framework de deep learning PyTorch
- **sentencepiece**: Tokenizador para processamento de texto
- **sacremoses**: Ferramentas de pré-processamento de texto

## 🚨 Solução de Problemas

### Erro de Permissão no PowerShell
```bash
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Erro de Instalação
```bash
python -m pip install --upgrade pip
```

### Problemas de Memória
O modelo pode requerer bastante RAM (recomendado: 4GB+). Feche outros programas se necessário.

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- [Helsinki-NLP](https://huggingface.co/Helsinki-NLP) pelo modelo de tradução
- [Hugging Face](https://huggingface.co/) pela plataforma e bibliotecas
- [PyTorch](https://pytorch.org/) pelo framework de deep learning

## 📞 Suporte

Para problemas ou dúvidas:
- 📧 Abra uma [issue](https://github.com/mmancilha/translate-Quantum/issues)
- 📚 Consulte a [documentação do Transformers](https://huggingface.co/docs/transformers)
- 🤖 Veja o [modelo específico](https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-en-pt)

---

⭐ **Se este projeto foi útil para você, considere dar uma estrela!** ⭐