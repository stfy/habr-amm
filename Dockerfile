FROM node:14-alpine

ARG HOST_NETWORK
ENV HOST_NETWORK ${HOST_NETWORK}

WORKDIR /usr/app

ADD package.json package.json
ADD package-lock.json package-lock.json

RUN npm ci

ADD src src
ADD tsconfig.json tsconfig.json
ADD index.ts index.ts

RUN npm run build

ADD entrypoint.sh entrypoint.sh
RUN chmod +x entrypoint.sh

RUN ls -l

ENTRYPOINT ["/usr/app/entrypoint.sh"]
