from app.core.config import settings
from app.core.database import engine
from sqlalchemy import text 

with engine.connect() as connection:
    result = connection.execute(text("SELECT 1"))
    print(result.scalar())
print(settings.PROJECT_NAME)
print(settings.ENVIRONMENT)

from app.core.config import settings
print(settings.HUGGINGFACE_MODEL)
