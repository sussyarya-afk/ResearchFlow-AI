from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated

from app.core.database import get_db
from app.core.security import create_access_token
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.schemas.auth import Token
from app.services.auth import AuthService
from app.api.dependencies import get_current_user

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserCreate,
    session: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Register a new user.
    """
    user = await AuthService.register_user(session, user_in)
    return user

@router.post("/login", response_model=Token)
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Annotated[AsyncSession, Depends(get_db)]
):
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    user = await AuthService.authenticate_user(
        session, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(subject=user.email)
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(
    current_user: Annotated[User, Depends(get_current_user)]
):
    """
    Get current user profile.
    """
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_users_me(
    user_update: UserCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Update current user profile.
    """
    current_user.email = user_update.email
    if user_update.password:
        from app.core.security import get_password_hash
        current_user.hashed_password = get_password_hash(user_update.password)
    session.add(current_user)
    await session.commit()
    await session.refresh(current_user)
    return current_user


@router.post("/demo", response_model=Token)
async def demo_login(
    session: Annotated[AsyncSession, Depends(get_db)]
):
    """
    1-Click Demo Login: creates or returns demo account with seeded starter data.
    """
    from app.repositories.user import UserRepository
    from app.schemas.project import ProjectCreate
    from app.services.project import ProjectService
    from app.repositories.note import NoteRepository

    demo_email = "demo@researchflow.ai"
    user = await UserRepository.get_by_email(session, demo_email)
    
    if not user:
        user_in = UserCreate(email=demo_email, password="demo_password_123")
        user = await AuthService.register_user(session, user_in)

    # Check if user already has projects
    existing_projects = await ProjectService.get_projects(session, user.id)
    if not existing_projects:
        # Seed starter project
        proj = await ProjectService.create_project(
            session,
            ProjectCreate(
                name="Quantum Computing Optimization",
                description="Analyzing recent breakthroughs in error correction for superconducting qubits."
            ),
            user.id
        )
        await NoteRepository.create(
            session,
            proj.id,
            "Initial observation: Surface code error correction threshold achieves < 0.1% physical error rates with topological braid sequencing."
        )

    access_token = create_access_token(subject=user.email)
    return {"access_token": access_token, "token_type": "bearer"}
