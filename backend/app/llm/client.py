from openai import AsyncOpenAI
from typing import Optional, List, Dict, Any
import json
import re

from app.config import settings


class LLMClient:
    """Async LLM Client for OpenAI-compatible APIs"""
    
    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=settings.llm_api_key,
            base_url=settings.llm_base_url
        )
        self.model = settings.llm_model
        self.conversation_history: List[Dict[str, str]] = []
    
    async def chat(
        self, 
        system_prompt: str, 
        user_message: str, 
        use_history: bool = True
    ) -> str:
        """Send a message to the LLM and get a response"""
        messages = [{"role": "system", "content": system_prompt}]
        
        if use_history:
            messages.extend(self.conversation_history)
        
        messages.append({"role": "user", "content": user_message})
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=settings.llm_temperature,
                max_tokens=settings.llm_max_tokens
            )
            
            assistant_message = response.choices[0].message.content
            
            # Update history
            if use_history:
                self.conversation_history.append(
                    {"role": "user", "content": user_message}
                )
                self.conversation_history.append(
                    {"role": "assistant", "content": assistant_message}
                )
                
                # Keep history manageable
                if len(self.conversation_history) > settings.max_history_length:
                    self.conversation_history = self.conversation_history[-settings.max_history_length:]
            
            return assistant_message
            
        except Exception as e:
            raise Exception(f"LLM Error: {str(e)}")
    
    async def chat_json(
        self, 
        system_prompt: str, 
        user_message: str
    ) -> Dict[str, Any]:
        """Send a message expecting a JSON response"""
        response = await self.chat(
            system_prompt,
            user_message,
            use_history=settings.use_conversation_history
        )
        
        try:
            # Try direct parse
            return json.loads(response)
        except json.JSONDecodeError:
            # Try to extract JSON from response
            patterns = [
                r'```json\s*([\s\S]*?)\s*```',
                r'```\s*([\s\S]*?)\s*```',
                r'\{[\s\S]*\}'
            ]
            
            for pattern in patterns:
                match = re.search(pattern, response)
                if match:
                    json_str = match.group(1) if match.lastindex else match.group(0)
                    try:
                        return json.loads(json_str)
                    except json.JSONDecodeError:
                        continue
            
            raise Exception("Failed to parse JSON from LLM response")
    
    def clear_history(self):
        """Clear conversation history"""
        self.conversation_history = []
    
    def get_history_length(self) -> int:
        """Get current history length"""
        return len(self.conversation_history)


# Singleton instance
llm_client = LLMClient()