# Redis Setup for PDFwhiz

This backend uses Redis for caching bullet points and topics operations.

## Quick Start

### 1. Start Redis with Docker
```bash

# Or use the provided script
./redis-setup.sh start
```

### 2. Verify Redis is Running
```bash
# Check container status
docker ps | grep redis

# Test connection
curl http://localhost:8000/health/cache
```

Expected response:
```json
{"status":"healthy","cache":"connected"}
```

## Redis Management Script

Use the provided script to manage Redis:

```bash
# Start Redis
./redis-setup.sh start

# Stop Redis
./redis-setup.sh stop

# Restart Redis
./redis-setup.sh restart

# Check status
./redis-setup.sh status

# View logs
./redis-setup.sh logs

# Remove container
./redis-setup.sh remove
```
