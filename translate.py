from googletrans import Translator
import sys
import json

def translate(text, target_lang='pt'):
    """Traduz texto para o idioma especificado"""
    try:
        translator = Translator()
        result = translator.translate(text, dest=target_lang)
        return {
            'success': True,
            'translation': result.text,
            'detected_language': result.src,
            'target_language': target_lang
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'translation': '',
            'detected_language': 'unknown',
            'target_language': target_lang
        }

def main():
    """Função principal para uso via linha de comando ou API"""
    if len(sys.argv) > 1:
        # Uso via linha de comando
        text = sys.argv[1]
        target_lang = sys.argv[2] if len(sys.argv) > 2 else 'pt'
        result = translate(text, target_lang)
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        # Exemplo padrão
        text = "Hugging Face is a technology company based in New York and Paris"
        result = translate(text, 'pt')
        print(json.dumps(result, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
