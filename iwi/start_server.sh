#!/bin/bash
# Start local development server for Brede Welkaart

echo "========================================="
echo "Starting Brede Welkaart Local Server"
echo "========================================="
echo ""
echo "Server will be available at:"
echo "  http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop the server"
echo "========================================="
echo ""

# Start Python HTTP server
python3 -m http.server 8000

