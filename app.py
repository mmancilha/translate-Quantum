from flask import Flask, request, jsonify, render_template_string, send_from_directory
from flask_cors import CORS
import os
import logging
import fasttext
from googletrans import Translator
import requests
import numpy as np
from werkzeug.exceptions import RequestEntityTooLarge
from config import get_config

# Flask Configuration
app = Flask(__name__)
config_class = get_config()
app.config.from_object(config_class)

# Initialize CORS
cors = CORS(app, origins=app.config.get('CORS_ORIGINS', '*'))

# Add security headers for production
if app.config.get('FLASK_ENV') == 'production':
    @app.after_request
    def add_security_headers(response):
        security_headers = app.config.get('SECURITY_HEADERS', {})
        for header, value in security_headers.items():
            response.headers[header] = value
        return response

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

def normalize_language_code(lang_code):
    """
    Normaliza códigos de idioma para compatibilidade com Google Translate.
    
    Args:
        lang_code (str): Código do idioma a ser normalizado
        
    Returns:
        str: Código de idioma normalizado
    """
    if not lang_code:
        return 'auto'
    
    # Converter para minúsculo e remover espaços
    lang_code = str(lang_code).lower().strip()
    
    # Mapeamento de códigos alternativos para códigos padrão do Google Translate
    lang_mapping = {
        'auto': 'auto',
        'pt': 'pt',
        'pt-br': 'pt',
        'portuguese': 'pt',
        'portugues': 'pt',
        'en': 'en',
        'en-us': 'en',
        'english': 'en',
        'ingles': 'en',
        'es': 'es',
        'es-es': 'es',
        'spanish': 'es',
        'espanhol': 'es',
        'fr': 'fr',
        'fr-fr': 'fr',
        'french': 'fr',
        'frances': 'fr',
        'de': 'de',
        'de-de': 'de',
        'german': 'de',
        'alemao': 'de',
        'it': 'it',
        'it-it': 'it',
        'italian': 'it',
        'italiano': 'it',
        'ja': 'ja',
        'japanese': 'ja',
        'japones': 'ja',
        'ko': 'ko',
        'korean': 'ko',
        'coreano': 'ko',
        'zh': 'zh',
        'zh-cn': 'zh',
        'chinese': 'zh',
        'chines': 'zh',
        'ru': 'ru',
        'russian': 'ru',
        'russo': 'ru',
        'ar': 'ar',
        'arabic': 'ar',
        'arabe': 'ar'
    }
    
    # Retornar código normalizado ou o código original se não encontrado
    normalized = lang_mapping.get(lang_code, lang_code)
    
    # Verificar se o código normalizado está nos idiomas suportados
    if normalized not in SUPPORTED_LANGUAGES:
        logger.warning(f"Código de idioma não suportado: {lang_code} -> {normalized}. Usando 'auto'.")
        return 'auto'
    
    return normalized

def load_language_detector():
    """Carrega o modelo FastText para detecção de idioma"""
    model_path = app.config.get('FASTTEXT_MODEL_PATH', 'lid.176.bin')
    model_url = app.config.get('FASTTEXT_MODEL_URL', 'https://dl.fbaipublicfiles.com/fasttext/supervised-models/lid.176.bin')
    
    # For production deployment, use /tmp directory
    if app.config.get('FLASK_ENV') == 'production':
        model_path = f'/tmp/{os.path.basename(model_path)}'
    
    if not os.path.exists(model_path):
        logger.info(f"Baixando modelo FastText de {model_url}...")
        try:
            response = requests.get(model_url, stream=True, timeout=300)
            response.raise_for_status()
            
            # Ensure directory exists
            os.makedirs(os.path.dirname(model_path), exist_ok=True)
            
            with open(model_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            logger.info("Modelo FastText baixado com sucesso!")
        except Exception as e:
            logger.error(f"Erro ao baixar modelo FastText: {e}")
            return None
    
    try:
        model = fasttext.load_model(model_path)
        logger.info("Modelo FastText carregado com sucesso!")
        return model
    except Exception as e:
        logger.error(f"Erro ao carregar modelo FastText: {e}")
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
        
        # Normalizar códigos de idioma para o Google Translate
        source_lang_normalized = normalize_language_code(source_lang)
        target_lang_normalized = normalize_language_code(target_lang)
        
        # Verificar se os idiomas são diferentes (exceto para auto)
        if source_lang_normalized != 'auto' and source_lang_normalized == target_lang_normalized:
            return {"translation": text, "detected_language": source_lang_normalized}
        
        # Realizar a tradução
        result = translator.translate(text, src=source_lang_normalized, dest=target_lang_normalized)
        
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
        # Verificar se há dados JSON na requisição
        if not request.is_json:
            return jsonify({
                "error": "Content-Type deve ser application/json",
                "success": False
            }), 400
        
        data = request.get_json()
        
        if not data:
            return jsonify({
                "error": "Dados JSON inválidos ou vazios",
                "success": False
            }), 400
        
        # Validar campos obrigatórios
        text = data.get('text', '').strip()
        source_lang = data.get('source_lang', 'auto')
        target_lang = data.get('target_lang', 'en')
        detect_only = data.get('detect_only', False)
        
        if not text:
            return jsonify({
                "error": "Campo 'text' é obrigatório e não pode estar vazio",
                "success": False
            }), 400
        
        # Validar tamanho do texto
        if len(text) > 5000:
            return jsonify({
                "error": "Texto muito longo. Máximo de 5000 caracteres",
                "success": False
            }), 400
        
        # Se for apenas detecção de idioma
        if detect_only:
            detected_lang, confidence = detect_language(text)
            return jsonify({
                "success": True,
                "detected_language": detected_lang,
                "confidence": confidence
            })
        
        # Validar idioma de destino
        if not target_lang:
            return jsonify({
                "error": "Campo 'target_lang' é obrigatório",
                "success": False
            }), 400
        
        # Normalizar códigos de idioma
        source_lang_normalized = normalize_language_code(source_lang)
        target_lang_normalized = normalize_language_code(target_lang)
        
        # Verificar se os idiomas normalizados são suportados
        if source_lang_normalized != 'auto' and source_lang_normalized not in SUPPORTED_LANGUAGES:
            return jsonify({
                "error": f"Idioma de origem não suportado: '{source_lang}'. Idiomas suportados: {list(SUPPORTED_LANGUAGES.keys())}",
                "success": False
            }), 400
            
        if target_lang_normalized not in SUPPORTED_LANGUAGES:
            return jsonify({
                "error": f"Idioma de destino não suportado: '{target_lang}'. Idiomas suportados: {list(SUPPORTED_LANGUAGES.keys())}",
                "success": False
            }), 400
        
        # Realizar tradução
        result = translate_text(text, source_lang_normalized, target_lang_normalized)
        
        if "error" in result:
            return jsonify({
                "error": result["error"],
                "success": False
            }), 400
        
        # Adicionar detecção de idioma se não foi fornecido
        if source_lang_normalized == 'auto':
            detected_lang, confidence = detect_language(text)
            result["detected_language"] = detected_lang
            result["confidence"] = confidence
        
        result["success"] = True
        return jsonify(result)
        
    except ValueError as e:
        logger.error(f"Erro de validação: {str(e)}")
        return jsonify({
            "error": f"Dados inválidos: {str(e)}",
            "success": False
        }), 400
    except Exception as e:
        logger.error(f"Erro no endpoint de tradução: {str(e)}")
        return jsonify({
            "error": "Erro interno do servidor. Tente novamente.",
            "success": False
        }), 500

@app.route('/test')
def test_page():
    """Página de teste da funcionalidade"""
    return send_from_directory('.', 'test_frontend.html')

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