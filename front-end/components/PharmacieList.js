"use client";

import React, { useEffect, useState } from "react";
import SearchBar from "./SearchBar"; // Importer le composant SearchBar

export default function PharmacieList({ onPharmacieClick }) {
  const [pharmacies, setPharmacies] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // État pour la barre de recherche

  // Récupérer les données des pharmacies depuis l'API
  useEffect(() => {
    fetch("http://localhost:8080/pharmacie")
      .then((response) => response.json())
      .then((data) => setPharmacies(data))
      .catch((error) => console.error("Erreur lors de la récupération des pharmacies :", error));
  }, []);

  // Filtrer les pharmacies en fonction du terme de recherche
  const filteredPharmacies = pharmacies.filter((pharmacie) =>
    pharmacie.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ width: "300px", padding: "10px" }}>
      {/* Barre de recherche */}
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {/* Liste des pharmacies */}
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {filteredPharmacies.map((pharmacie) => (
          <li
            key={pharmacie.id_pharmacie}
            style={{
              marginBottom: "10px",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={() => onPharmacieClick(pharmacie)}
          >
            {pharmacie.nom}
          </li>
        ))}
      </ul>
    </div>
  );
}