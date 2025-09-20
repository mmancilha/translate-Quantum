import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Base configuration class"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'tradutor-quantum-2025-production'
    
    # Server Configuration
    HOST = os.environ.get('HOST', '0.0.0.0')
    PORT = int(os.environ.get('PORT', 5000))
    
    # CORS Configuration
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*')
    
    # Logging Configuration
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    
    # Translation Service Configuration
    TRANSLATION_SERVICE = os.environ.get('TRANSLATION_SERVICE', 'google')
    MAX_TEXT_LENGTH = int(os.environ.get('MAX_TEXT_LENGTH', 5000))
    
    # FastText Model Configuration
    FASTTEXT_MODEL_URL = os.environ.get(
        'FASTTEXT_MODEL_URL',
        'https://dl.fbaipublicfiles.com/fasttext/supervised-models/lid.176.bin'
    )
    FASTTEXT_MODEL_PATH = os.environ.get('FASTTEXT_MODEL_PATH', 'lid.176.bin')

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    FLASK_ENV = 'development'

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    FLASK_ENV = 'production'
    
    # Security headers for production
    SECURITY_HEADERS = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; font-src 'self' https://cdnjs.cloudflare.com;"
    }

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DEBUG = True

# Configuration mapping
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

def get_config():
    """Get configuration based on environment"""
    env = os.environ.get('FLASK_ENV', 'development')
    return config.get(env, config['default'])