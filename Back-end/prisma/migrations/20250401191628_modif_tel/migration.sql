-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_pharmacies" (
    "id_pharmacie" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "telephone" TEXT,
    "services" TEXT,
    "info_supplementaire" TEXT
);
INSERT INTO "new_pharmacies" ("adresse", "id_pharmacie", "info_supplementaire", "latitude", "longitude", "nom", "services", "telephone") SELECT "adresse", "id_pharmacie", "info_supplementaire", "latitude", "longitude", "nom", "services", "telephone" FROM "pharmacies";
DROP TABLE "pharmacies";
ALTER TABLE "new_pharmacies" RENAME TO "pharmacies";
CREATE UNIQUE INDEX "pharmacies_nom_key" ON "pharmacies"("nom");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
