#!/bin/bash

DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Starting backend..."
cd "$DIR/backend"
npm install
npm run dev &

echo "Starting frontend..."
cd "$DIR/frontend"
open http://localhost:3000
npm install
npm run dev

wait