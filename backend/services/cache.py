import json
import pickle
import os
from typing import Optional, Any, Dict
import redis.asyncio as redis

class RedisCache:
    def __init__(self):
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        self.redis_client = None
        self.cache_ttl = 3600  # 1 hour default TTL
    
    async def get_client(self):
        if self.redis_client is None:
            self.redis_client = redis.from_url(self.redis_url)
        return self.redis_client
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        try:
            client = await self.get_client()
            value = await client.get(key)
            if value:
                return pickle.loads(value)
            return None
        except Exception as e:
            print(f"Cache get error: {e}")
            return None
    
    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Set value in cache"""
        try:
            client = await self.get_client()
            serialized_value = pickle.dumps(value)
            ttl = ttl or self.cache_ttl
            await client.setex(key, ttl, serialized_value)
            return True
        except Exception as e:
            print(f"Cache set error: {e}")
            return False
    
    async def delete(self, key: str) -> bool:
        """Delete value from cache"""
        try:
            client = await self.get_client()
            await client.delete(key)
            return True
        except Exception as e:
            print(f"Cache delete error: {e}")
            return False
    
    async def exists(self, key: str) -> bool:
        """Check if key exists in cache"""
        try:
            client = await self.get_client()
            return await client.exists(key) > 0
        except Exception as e:
            print(f"Cache exists error: {e}")
            return False

# Global cache instance
cache = RedisCache()

def get_cache_key(pdf_id: str, operation: str) -> str:
    """Generate cache key for PDF operations"""
    return f"pdf:{pdf_id}:{operation}"

async def get_cached_pdf_data(pdf_id: str, operation: str) -> Optional[Any]:
    """Get cached PDF data for a specific operation"""
    key = get_cache_key(pdf_id, operation)
    return await cache.get(key)

async def set_cached_pdf_data(pdf_id: str, operation: str, data: Any, ttl: Optional[int] = None) -> bool:
    """Set cached PDF data for a specific operation"""
    key = get_cache_key(pdf_id, operation)
    return await cache.set(key, data, ttl)

async def clear_pdf_cache(pdf_id: str) -> bool:
    """Clear all cached data for a specific PDF"""
    try:
        client = await cache.get_client()
        pattern = f"pdf:{pdf_id}:*"
        keys = await client.keys(pattern)
        if keys:
            await client.delete(*keys)
        return True
    except Exception as e:
        print(f"Clear cache error: {e}")
        return False 