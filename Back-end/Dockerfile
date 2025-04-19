FROM node:18

WORKDIR /app

COPY package*.json ./

# Installer pnpm
RUN npm install -g pnpm

# Ajoute Prisma CLI si besoin
RUN pnpm install prisma --save-dev

# Copie le code source
COPY . .

# Génère le client Prisma
RUN pnpx prisma generate

EXPOSE 8080

CMD ["pnpm", "start"]
