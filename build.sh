#!/bin/bash
# Vercel Build Script for Vanilla JS Frontend
# This script reads environment variables from Vercel and injects them into the static site

mkdir -p js
echo "window.ENV = {" > js/env.js
if [ -n "$VITE_API_BASE_URL" ]; then
    echo "  API_BASE_URL: '$VITE_API_BASE_URL'" >> js/env.js
fi
echo "};" >> js/env.js
