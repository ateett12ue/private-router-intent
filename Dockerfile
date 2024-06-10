# Build
FROM node:14.18-alpine AS build
WORKDIR /usr/src/nitro-api
COPY package.json package-lock.json* ./
RUN npm install --prod
COPY . .
RUN npm run build
# Prepare final deployment image
FROM node:14.18-alpine AS runner
WORKDIR /usr/src/nitro-api
COPY .env .
COPY --from=build /usr/src/nitro-api/node_modules ./node_modules
COPY --from=build /usr/src/nitro-api/package.json ./package.json
COPY --from=build /usr/src/nitro-api/dist ./dist
EXPOSE 3014
CMD ["npm", "run", "serve"]
