import asyncio
from sqlalchemy.ext.asyncio import create_async_engine

async def test_password(pwd):
    url = f"postgresql+psycopg://postgres:{pwd}@localhost:5432/postgres"
    engine = create_async_engine(url)
    try:
        async with engine.connect() as conn:
            print(f"SUCCESS: {pwd}")
            return True
    except Exception as e:
        pass
    finally:
        await engine.dispose()
    return False

async def main():
    passwords = ["postgres", "root", "admin", "1234", "password", "123456", ""]
    for p in passwords:
        if await test_password(p):
            break

if __name__ == "__main__":
    asyncio.run(main())
