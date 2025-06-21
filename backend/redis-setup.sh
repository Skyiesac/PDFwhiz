#!/bin/bash

# Redis Docker Management Script for PDFwhiz

REDIS_CONTAINER="pdfwhiz-redis"

case "$1" in
    "start")
        echo "Starting Redis container..."
        docker run -d -p 6379:6379 --name $REDIS_CONTAINER redis:alpine
        echo "Redis started successfully!"
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