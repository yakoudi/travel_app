#!/usr/bin/env python
#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
from dotenv import load_dotenv  # ✅ Ajouté pour charger .env

def main():
    """Run administrative tasks."""
    # Charger les variables d'environnement depuis le fichier .env
    load_dotenv()

    # Définir le module de configuration Django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc

    # Exécuter les commandes Django (runserver, migrate, etc.)
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
