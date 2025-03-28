-- CreateTable
CREATE TABLE "pharmacies" (
    "id_pharmacie" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "telephone" INTEGER,
    "services" TEXT,
    "info_supplementaire" TEXT
);

-- CreateTable
CREATE TABLE "administrateur" (
    "id_administrateur" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom_prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "pharmacies_nom_key" ON "pharmacies"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "administrateur_email_key" ON "administrateur"("email");
