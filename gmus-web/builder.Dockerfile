FROM node:14-alpine AS builder

RUN mkdir /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup && chown appuser:appgroup /app
USER appuser
WORKDIR /app

COPY --chown=appuser:appgroup package.json yarn.lock ./
RUN yarn
COPY --chown=appuser:appgroup src ./src
COPY --chown=appuser:appgroup public ./public
COPY --chown=appuser:appgroup README.md .env.test .prettierrc.js .eslintrc.js tsconfig.json ./

ARG REACT_APP_API_URL=http://localhost:3002
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
RUN yarn build
