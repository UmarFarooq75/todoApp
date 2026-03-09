#!/bin/bash

# 🧪 Todo App - Quick Test Commands

echo "📝 Todo App - Testing Commands"
echo "================================"
echo ""

# Display available commands
echo "Available Test Commands:"
echo ""
echo "1. Run all tests:"
echo "   npm test"
echo ""
echo "2. Run unit tests only (fast):"
echo "   npm run test:service"
echo ""
echo "3. Run API tests (requires server):"
echo "   npm run test:api"
echo ""
echo "4. Run tests with verbose output:"
echo "   npm run test:all"
echo ""
echo "5. Run specific test file:"
echo "   node --test src/backend/todoService.test.js"
echo ""
echo "6. Run with grep filter:"
echo "   node --test src/backend/todoService.test.js --grep 'create'"
echo ""

# Optional: Run tests if argument provided
if [ "$1" == "run" ]; then
    echo "Running tests..."
    npm test
elif [ "$1" == "service" ]; then
    echo "Running service tests..."
    npm run test:service
elif [ "$1" == "api" ]; then
    echo "Running API tests..."
    npm run test:api
elif [ "$1" == "all" ]; then
    echo "Running all tests with verbose output..."
    npm run test:all
fi
