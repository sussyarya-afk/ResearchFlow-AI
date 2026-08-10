from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.schemas.user import UserCreate
from app.repositories.user import UserRepository
from app.core.security import verify_password

class AuthService:
    @staticmethod
    async def register_user(session: AsyncSession, user_create: UserCreate) -> User:
        user = await UserRepository.get_by_email(session, user_create.email)
        if user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        return await UserRepository.create(session, user_create)

    @staticmethod
    async def authenticate_user(
        session: AsyncSession, email: str, password: str
    ) -> Optional[User]:
        user = await UserRepository.get_by_email(session, email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user
