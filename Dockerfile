FROM oven/bun:latest AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN bun install

# ── Builder ───────────────────────────────────────────────────────────────────
FROM oven/bun:latest AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN bunx prisma generate

ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# ── Runner ────────────────────────────────────────────────────────────────────
FROM oven/bun:latest AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Hugging Face Spaces requires port 7860
EXPOSE 7860

ENV PORT=7860
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "server.js"]
