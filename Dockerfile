FROM node:22-alpine

WORKDIR /app

COPY package.json yarn.lock* .yarnrc.yml* ./
COPY .yarn ./.yarn
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn yarn install --immutable

COPY . .
RUN yarn db:generate

EXPOSE 3000
CMD ["yarn", "dev"]
