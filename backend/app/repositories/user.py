from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import get_password_hash

class UserRepository:
    @staticmethod
    async def get_by_email(session: AsyncSession, email: str) -> Optional[User]:
        result = await session.execute(select(User).where(User.email == email))
        return result.scalars().first()

    @staticmethod
    async def create(session: AsyncSession, user_create: UserCreate) -> User:
        db_user = User(
            email=user_create.email,
            hashed_password=get_password_hash(user_create.password)
        )
        session.add(db_user)
        await session.commit()
        await session.refresh(db_user)
        return db_user
