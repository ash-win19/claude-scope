FROM node:22-slim

# Install ffmpeg (includes ffprobe) and Chromium dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Install Playwright Chromium browser
RUN npx playwright install --with-deps chromium

# Copy source
COPY . .

# Build
RUN npm run build

# Expose port
EXPOSE 8080

CMD ["sh", "-c", "npm run db:migrate:prod && node dist/main"]
