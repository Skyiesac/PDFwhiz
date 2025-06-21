#!/bin/bash

# Redis Docker Management Script for PDFwhiz

REDIS_CONTAINER="pdfwhiz-redis"

case "$1" in
    "start")
        echo "Starting Redis container..."
        # Check if container already exists
        if docker ps -a --format "table {{.Names}}" | grep -q "^$REDIS_CONTAINER$"; then
            echo "Container exists, starting it..."
            docker start $REDIS_CONTAINER
        else
            echo "Creating new Redis container..."
            docker run -d -p 6379:6379 --name $REDIS_CONTAINER redis:alpine
        fi
        
        # Wait for Redis to be ready
        echo "Waiting for Redis to be ready..."
        for i in {1..10}; do
            if docker exec $REDIS_CONTAINER redis-cli ping > /dev/null 2>&1; then
                echo "Redis is ready!"
                exit 0
            fi
            sleep 1
        done
        echo "Redis failed to start properly"
        exit 1
        ;;
    "stop")
        echo "Stopping Redis container..."
        docker stop $REDIS_CONTAINER
        echo "Redis stopped!"
        ;;
    "restart")
        echo "Restarting Redis container..."
        docker restart $REDIS_CONTAINER
        echo "Redis restarted!"
        ;;
    "status")
        echo "Redis container status:"
        docker ps -a | grep $REDIS_CONTAINER
        ;;
    "logs")
        echo "Redis logs:"
        docker logs $REDIS_CONTAINER
        ;;
    "remove")
        echo "Removing Redis container..."
        docker stop $REDIS_CONTAINER 2>/dev/null
        docker rm $REDIS_CONTAINER 2>/dev/null
        echo "Redis container removed!"
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|remove}"
        echo ""
        echo "Commands:"
        echo "  start   - Start Redis container"
        echo "  stop    - Stop Redis container"
        echo "  restart - Restart Redis container"
        echo "  status  - Show container status"
        echo "  logs    - Show container logs"
        echo "  remove  - Remove container completely"
        exit 1
        ;;
esac 