FROM node:22.8.0-alpine
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY index.js package.json pnpm-lock.yaml /app/
COPY commands /app/commands
WORKDIR /app
RUN pnpm install --prod --ignore-scripts --frozen-lockfile
EXPOSE 3000
CMD [ "pnpm", "run", "start" ]
