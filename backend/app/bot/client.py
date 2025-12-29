import httpx
import asyncio
import json
from typing import Dict, Any, Optional, Callable, List
import websockets

from app.config import settings


class BotClient:
    """Client for communicating with the Node.js Mineflayer bot service"""
    
    def __init__(self):
        self.base_url = settings.bot_service_url
        self.ws_url = settings.bot_ws_url
        self.http_client: Optional[httpx.AsyncClient] = None
        self.ws_connection = None
        self.event_handlers: List[Callable] = []
        self._ws_task: Optional[asyncio.Task] = None
    
    async def init(self):
        """Initialize the HTTP client"""
        # 设置较长的超时时间，因为某些动作（如goTo）可能需要很长时间
        self.http_client = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=httpx.Timeout(
                connect=10.0,    # 连接超时
                read=300.0,      # 读取超时（5分钟，足够走很远的路）
                write=10.0,      # 写入超时
                pool=10.0        # 连接池超时
            )
        )
    
    async def close(self):
        """Close connections"""
        if self._ws_task:
            self._ws_task.cancel()
        if self.ws_connection:
            await self.ws_connection.close()
        if self.http_client:
            await self.http_client.aclose()
    
    # ========== HTTP API Methods ==========
    
    async def get_status(self) -> Dict[str, Any]:
        """Get bot status"""
        response = await self.http_client.get("/status")
        response.raise_for_status()
        return response.json()
    
    async def get_observation(self) -> Dict[str, Any]:
        """Get current observation from bot"""
        response = await self.http_client.get("/observation")
        response.raise_for_status()
        return response.json()
    
    async def execute_action(
        self, 
        action: str, 
        parameters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Execute an action on the bot"""
        payload = {
            "action": action,
            "parameters": parameters or {}
        }
        response = await self.http_client.post("/action", json=payload)
        response.raise_for_status()
        return response.json()
    
    async def connect(self) -> Dict[str, Any]:
        """Tell bot to connect to Minecraft server"""
        response = await self.http_client.post("/connect")
        response.raise_for_status()
        return response.json()
    
    async def disconnect(self) -> Dict[str, Any]:
        """Tell bot to disconnect from Minecraft server"""
        response = await self.http_client.post("/disconnect")
        response.raise_for_status()
        return response.json()
    
    # ========== WebSocket Methods ==========
    
    def add_event_handler(self, handler: Callable):
        """Add an event handler for WebSocket events"""
        self.event_handlers.append(handler)
    
    def remove_event_handler(self, handler: Callable):
        """Remove an event handler"""
        if handler in self.event_handlers:
            self.event_handlers.remove(handler)
    
    async def start_ws_listener(self):
        """Start listening for WebSocket events"""
        self._ws_task = asyncio.create_task(self._ws_loop())
    
    async def _ws_loop(self):
        """WebSocket event loop"""
        while True:
            try:
                async with websockets.connect(self.ws_url) as ws:
                    self.ws_connection = ws
                    print(f"[BotClient] WebSocket connected to {self.ws_url}")
                    
                    async for message in ws:
                        try:
                            event = json.loads(message)
                            await self._handle_event(event)
                        except json.JSONDecodeError:
                            print(f"[BotClient] Invalid JSON: {message}")
                            
            except websockets.exceptions.ConnectionClosed:
                print("[BotClient] WebSocket connection closed, reconnecting...")
                await asyncio.sleep(2)
            except Exception as e:
                print(f"[BotClient] WebSocket error: {e}, reconnecting...")
                await asyncio.sleep(5)
    
    async def _handle_event(self, event: Dict[str, Any]):
        """Handle incoming WebSocket event"""
        for handler in self.event_handlers:
            try:
                if asyncio.iscoroutinefunction(handler):
                    await handler(event)
                else:
                    handler(event)
            except Exception as e:
                print(f"[BotClient] Event handler error: {e}")


# Singleton instance
bot_client = BotClient()