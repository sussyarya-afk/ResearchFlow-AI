from sqlalchemy.orm import DeclarativeBase, MappedAsDataclass

class Base(MappedAsDataclass, DeclarativeBase, kw_only=True):
    """Base class for all SQLAlchemy 2.0 models."""
    pass
