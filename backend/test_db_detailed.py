import asyncio
import sys
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from sqlalchemy.ext.asyncio import create_async_engine

async def main():
    url = f"postgresql+psycopg://postgres:postgres@localhost:5432/postgres"
    engine = create_async_engine(url)
    try:
        async with engine.connect() as conn:
            print("SUCCESS")
    except Exception as e:
        print(f"FAILED: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
