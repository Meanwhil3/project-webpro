#!/bin/bash

DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Giving permission to run.command..."
chmod +x "$DIR/run.command"

echo "Starting run.command..."
open "$DIR/run.command"