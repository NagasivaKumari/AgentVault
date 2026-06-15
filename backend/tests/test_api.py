import pytest
from httpx import AsyncClient
from api_server import app

@pytest.mark.asyncio
async def test_get_portfolio():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await client.get("/api/portfolio?address=0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18")
    assert response.status_code == 200
    assert "totalValue" in response.json()
    assert "assets" in response.json()

@pytest.mark.asyncio
async def test_get_signals():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/api/signals")
    assert response.status_code == 200
    assert len(response.json()) > 0

@pytest.mark.asyncio
async def test_get_recommendation():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/api/recommendation")
    assert response.status_code == 200
    assert "reasoning" in response.json()
    assert "allocation" in response.json()

@pytest.mark.asyncio
async def test_get_rwa():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/api/rwa")
    assert response.status_code == 200
    assert len(response.json()) >= 2
