
FROM node:16-alpine
# Installing libvips-dev for sharp Compatability
RUN apk update && apk add  build-base gcc autoconf automake zlib-dev libpng-dev nasm bash vips-dev
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}
WORKDIR /opt/
COPY /providers ./providers
COPY ./package.json ./yarn.lock ./
ENV PATH /opt/node_modules/.bin:$PATH
RUN yarn config set network-timeout 600000 -g && yarn install --frozen-lockfile
WORKDIR /opt/app
COPY ./ .
RUN rm -rf /opt/app/node_modules
RUN cp -r /opt/node_modules /opt/app/node_modules
RUN yarn build
EXPOSE 1337
CMD ["yarn", "develop"]
