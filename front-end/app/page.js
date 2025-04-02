"use client";

import { useState } from "react";
import Map from "../components/Map";


export default function Home() {
  const [searchTerm, setSearchTerm] = useState(""); // État pour le terme de recherche
  const [locations, setLocations] = useState([]); // État pour les données de localisation

  const handleLocationClick = (location) => {
    console.log("Location clicked:", location);
    // Ajoutez ici toute logique supplémentaire pour gérer le clic sur une localisation
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%" }}>
            <Map locations={locations} />
    </div>
  );
}
