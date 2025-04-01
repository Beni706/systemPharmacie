"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Map from "../../components/Map.js";
import SearchPanel from "../../components/SearchPanel.js"; // Importez le composant SearchPanel
import { useState, useEffect } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [locations, setLocations] = useState([]);

  // Charger les données depuis l'API au montage du composant
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch("http://localhost:8080/pharmacie"); // Remplacez par l'URL de votre API
        const data = await response.json();
        setLocations(data); // Assurez-vous que `data` contient un tableau d'objets avec `name` et `coordinates`
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
      }
    };

    fetchLocations();
  }, []);

  const handleLocationClick = (location) => {
    console.log(`Centrer la carte sur : ${location.name}`);
    // Ajoutez ici la logique pour centrer la carte sur le lieu sélectionné
  };

  return (
    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <div style={{ display: "flex", height: "100vh", width: "100%" }}>
          {/* Colonne gauche : Barre de recherche et liste des lieux */}
          <SearchPanel
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            locations={locations}
            onLocationClick={handleLocationClick}
          />

          {/* Colonne droite : Carte */}
          <div style={{ width: "65%", height: "100%" }}>
            <Map locations={locations} />
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
