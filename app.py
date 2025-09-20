from flask import Flask, render_template, request, jsonify, send_from_directory
import os
import logging
import fasttext

# Configuração do Flask
app = Flask(__name__)
app.config['SECRET_KEY'] = 'tradutor-quantum-2025'

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Usando Google Translate - solução leve e eficiente
from googletrans import Translator

# Idiomas suportados pelo Google Translate
SUPPORTED_LANGUAGES = {
    'auto': 'Detectar automaticamente',
    'en': 'Inglês',
    'pt': 'Português',
    'es': 'Espanhol', 
    'fr': 'Francês',
    'de': 'Alemão',
    'it': 'Italiano',
    'ja': 'Japonês',
    'ko': 'Coreano',
    'zh': 'Chinês',
    'ru': 'Russo',
    'ar': 'Árabe'
}

# Instância do tradutor Google
translator = Translator()

# Modelo de detecção de idioma
language_detector = None

def load_language_detector():
    """Carrega o modelo FastText para detecção de idiomas"""
    try:
        # Baixar modelo se não existir
        import urllib.request
        import os
        
        model_path = 'lid.176.bin'
        if not os.path.exists(model_path):
            print("Baixando modelo de detecção de idiomas...")
            urllib.request.urlretrieve(
                'https://dl.fbaipublicfiles.com/fasttext/supervised-models/lid.176.bin',
                model_path
            )
        
        return fasttext.load_model(model_path)
    except Exception as e:
        print(f"Erro ao carregar modelo de detecção: {e}")
        return None

def detect_language(text):
    """
    Detecta o idioma do texto usando FastText.
    
    Args:
        text (str): Texto para detectar idioma
    
    Returns:
        tuple: (código_idioma, confiança)
    """
    try:
        detector = load_language_detector()
        if detector is None:
            return 'en', 0.5  # Fallback para inglês
        
        # Limpar texto
        text = text.strip().replace('\n', ' ')
        if len(text) < 3:
            return 'en', 0.5
        
        # Detectar idioma - Corrigir para compatibilidade com NumPy 2.0
        import warnings
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            predictions = detector.predict(text, k=1)
        
        # Extrair código do idioma (remove __label__)
        lang_code = predictions[0][0].replace('__label__', '')
        confidence = float(predictions[1][0])
        
        # Mapear códigos específicos para nossos idiomas suportados
        lang_mapping = {
            'en': 'en',
            'pt': 'pt', 
            'es': 'es',
            'fr': 'fr',
            'de': 'de',
            'it': 'it'
        }
        
        # Se o idioma detectado não está nos suportados, usar inglês como padrão
        detected_lang = lang_mapping.get(lang_code, 'en')
        
        logger.info(f"Idioma detectado: {detected_lang} (confiança: {confidence:.2f})")
        return detected_lang, confidence
        
    except Exception as e:
        logger.error(f"Erro na detecção de idioma: {e}")
        return 'en', 0.5

def translate_text(text, source_lang, target_lang):
    """
    Traduz texto usando Google Translate - solução leve e eficiente.
    
    Args:
        text (str): Texto a ser traduzido
        source_lang (str): Código do idioma de origem ('auto' para detecção automática)
        target_lang (str): Código do idioma de destino
        
    Returns:
        dict: Resultado da tradução com texto traduzido e idioma detectado
    """
    try:
        # Verificar se o texto não está vazio
        if not text or not text.strip():
            return {"error": "Texto vazio"}
        
        # Verificar se os idiomas são diferentes (exceto para auto)
        if source_lang != 'auto' and source_lang == target_lang:
            return {"translation": text, "detected_language": source_lang}
        
        # Realizar a tradução
        result = translator.translate(text, src=source_lang, dest=target_lang)
        
        return {
            "translation": result.text,
            "detected_language": result.src,
            "confidence": getattr(result, 'confidence', None)
        }
        
    except Exception as e:
        logger.error(f"Erro na tradução: {str(e)}")
        return {"error": f"Erro na tradução: {str(e)}"}

# Rotas da aplicação
@app.route('/')
def index():
    """Página principal da aplicação."""
    return send_from_directory('.', 'index.html')

@app.route('/style.css')
def style():
    """Arquivo CSS."""
    return send_from_directory('.', 'style.css')

@app.route('/script.js')
def script():
    """Arquivo JavaScript."""
    return send_from_directory('.', 'script.js')

@app.route('/translate', methods=['POST'])
def translate():
    """Endpoint para tradução de texto"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "Dados JSON inválidos"}), 400
        
        text = data.get('text', '').strip()
        source_lang = data.get('source_lang', 'auto')
        target_lang = data.get('target_lang', 'en')
        
        if not text:
            return jsonify({"error": "Texto não fornecido"}), 400
        
        if not target_lang:
            return jsonify({"error": "Idioma de destino não fornecido"}), 400
        
        # Verificar se os idiomas são suportados
        if source_lang != 'auto' and source_lang not in SUPPORTED_LANGUAGES:
            return jsonify({"error": f"Idioma de origem não suportado: {source_lang}"}), 400
            
        if target_lang not in SUPPORTED_LANGUAGES:
            return jsonify({"error": f"Idioma de destino não suportado: {target_lang}"}), 400
        
        # Realizar tradução
        result = translate_text(text, source_lang, target_lang)
        
        if "error" in result:
            return jsonify(result), 400
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Erro no endpoint de tradução: {str(e)}")
        return jsonify({"error": "Erro interno do servidor"}), 500

@app.route('/health')
def health():
    """Endpoint de verificação de saúde da aplicação"""
    return jsonify({
        "status": "healthy",
        "service": "Tradutor Quantum",
        "translation_service": "Google Translate",
        "supported_languages": list(SUPPORTED_LANGUAGES.keys())
    })

@app.errorhandler(404)
def not_found(error):
    """Handler para páginas não encontradas."""
    return jsonify({'error': 'Página não encontrada'}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handler para erros internos."""
    logger.error(f"Erro interno: {error}")
    return jsonify({'error': 'Erro interno do servidor'}), 500

# Inicialização da aplicação
def initialize_app():
    """Inicializa a aplicação carregando o detector de idiomas."""
    try:
        logger.info("Inicializando Tradutor Quantum...")
        
        # Carregar detector de idiomas
        global language_detector
        language_detector = load_language_detector()
        
        if language_detector:
            logger.info("Detector de idiomas carregado com sucesso!")
        else:
            logger.warning("Detector de idiomas não pôde ser carregado. Usando fallback.")
        
        logger.info("Aplicação inicializada com sucesso!")
        return True
        
    except Exception as e:
        logger.error(f"Erro na inicialização: {e}")
        return False

if __name__ == '__main__':
    # Inicializar aplicação
    if initialize_app():
        logger.info("Iniciando servidor Flask...")
        logger.info("Acesse: http://localhost:5000")
        
        # Executar aplicação
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=False,  # Desabilitar debug em produção
            threaded=True
        )
    else:
        logger.error("Falha na inicialização. Encerrando aplicação.")
        exit(1)