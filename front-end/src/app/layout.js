"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Map from "../../components/Map";
import SearchPanel from "../../components/SearchPanel";
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

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch("http://localhost:8080/pharmacie");
        if (!response.ok) {
          throw new Error(`Erreur HTTP : ${response.status}`);
        }
        const data = await response.json();

        const transformedData = data.map((pharmacie) => ({
          id: pharmacie.id_pharmacie,
          name: pharmacie.nom,
          adresse: pharmacie.adresse,
          latitude: pharmacie.latitude, 
          longitude: pharmacie.longitude,
          telephone: pharmacie.telephone,
          services: pharmacie.services,
          info_supplementaire: pharmacie.info_supplementaire,
        }));

        console.log("Données transformées :", transformedData); // Vérifiez les données transformées
        setLocations(transformedData);
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
          <SearchPanel
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            locations={locations}
            setLocations={setLocations}
            onLocationClick={handleLocationClick}
          />
          <div style={{ width: "65%", height: "100%" }}>
            <Map locations={locations} />
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
