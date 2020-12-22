FROM docker.fela.space/gmus-web-builder:latest

FROM nginx:alpine

RUN mkdir /app
RUN touch /var/run/nginx.pid && chown -R nginx:nginx /app /var/cache/nginx /var/run/nginx.pid
USER nginx
WORKDIR /app

COPY --chown=nginx:nginx nginx.conf /etc/nginx/nginx.conf
COPY --chown=nginx:nginx --from=0 /app/build .
