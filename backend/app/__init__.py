from flask import Flask
from .config import Config
from .extensions import db, migrate, jwt, cors
from .routes.ai import ai_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}},
        supports_credentials=False,
    )

    from .routes.health import health_bp
    from .routes.auth import auth_bp
    from .routes.categories import categories_bp
    from .routes.expenses import expenses_bp

    app.register_blueprint(health_bp, url_prefix="/api/health")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(categories_bp, url_prefix="/api/categories")
    app.register_blueprint(expenses_bp, url_prefix="/api/expenses")
    app.register_blueprint(ai_bp, url_prefix="/api/ai")

    return app