ARG PNPM_VERSION=10.12.1

FROM node:22-slim AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
ENV PUBLIC_POSTHOG_HOST=${PUBLIC_POSTHOG_HOST:-https://us.posthog.com}
ENV PUBLIC_POSTHOG_PROJECT_TOKEN=${PUBLIC_POSTHOG_PROJECT_TOKEN:-}
RUN pnpm run build

FROM nginx:alpine AS runner
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
