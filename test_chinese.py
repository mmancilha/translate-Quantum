#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from googletrans import Translator
import sys

def test_chinese_codes():
    """Testa diferentes códigos de idioma chinês com Google Translate"""
    translator = Translator()
    
    # Códigos de chinês para testar
    chinese_codes = ['zh', 'zh-cn', 'zh-tw', 'zh-Hans', 'zh-Hant', 'chinese']
    test_text = "Hello world"
    
    print("Testando códigos de idioma chinês com Google Translate:")
    print("=" * 60)
    
    for code in chinese_codes:
        try:
            print(f"\nTestando código: '{code}'")
            result = translator.translate(test_text, src='en', dest=code)
            print(f"✅ Sucesso: {result.text}")
            print(f"   Idioma detectado: {result.src}")
            print(f"   Idioma de destino: {result.dest}")
        except Exception as e:
            print(f"❌ Erro: {str(e)}")
    
    # Testar idiomas suportados
    print("\n" + "=" * 60)
    print("Verificando idiomas suportados pelo Google Translate:")
    
    try:
        # Obter lista de idiomas suportados
        from googletrans import LANGUAGES
        print(f"\nTotal de idiomas suportados: {len(LANGUAGES)}")
        
        # Procurar por códigos relacionados ao chinês
        chinese_langs = {k: v for k, v in LANGUAGES.items() if 'chin' in v.lower() or k.startswith('zh')}
        print(f"\nIdiomas chineses encontrados:")
        for code, name in chinese_langs.items():
            print(f"  {code}: {name}")
            
    except Exception as e:
        print(f"Erro ao obter idiomas suportados: {e}")

if __name__ == "__main__":
    test_chinese_codes()