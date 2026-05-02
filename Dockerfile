FROM apify/actor-node:20

# No system deps required - pure HTTP + JSON, no Playwright, no Python, no ONNX
COPY package*.json ./
RUN npm install --omit=dev --prefer-offline \
    && echo "NPM dependencies installed"

COPY src/ ./src/
COPY .actor/ ./.actor/
COPY README.md ./

CMD ["node", "src/main.js"]
