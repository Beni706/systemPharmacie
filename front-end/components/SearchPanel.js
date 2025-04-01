import React, { useState } from "react";

export default function SearchPanel({ searchTerm, setSearchTerm, locations, setLocations, onLocationClick }) {
  const [showDistances, setShowDistances] = useState(false); // État pour contrôler l'affichage des distances

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    console.log("Valeur de searchTerm :", searchTerm);
  };

  const handleFindNearbyPharmacies = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            const response = await fetch(`http://localhost:8080/pharmacie/proche?lat=${latitude}&lng=${longitude}`);
            if (!response.ok) {
              throw new Error(`Erreur HTTP : ${response.status}`);
            }
            const data = await response.json();
            const transformedData = data.map((pharmacie) => ({
              ...pharmacie,
              id: pharmacie.id_pharmacie,
              name: pharmacie.nom,
              distance: pharmacie.distance,
            }));
            setLocations(transformedData);
            setShowDistances(true); // Activer l'affichage des distances
          } catch (error) {
            console.error("Erreur lors de la récupération des pharmacies proches :", error);
          }
        },
        (error) => {
          console.error("Erreur lors de la récupération de la position :", error);
        }
      );
    } else {
      console.error("La géolocalisation n'est pas supportée par ce navigateur.");
    }
  };

  const filteredLocations = locations.filter((location) => {
    if (!location.name) {
      console.warn("Objet sans propriété `name` :", location);
      return false;
    }
    return location.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div style={{ width: "35%", padding: "20px", backgroundColor: "#f8f9fa" }}>
      <h3 style={{ color: "black" }}>Rechercher une pharmacie</h3>
      <input
        type="text"
        placeholder="Rechercher..."
        value={searchTerm}
        onChange={handleSearch}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "20px",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      />
      <button
        onClick={handleFindNearbyPharmacies}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Trouver les pharmacies proches
      </button>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {filteredLocations.length > 0 ? (
          filteredLocations.map((location) => (
            <li
              key={location.id}
              style={{
                padding: "10px",
                marginBottom: "10px",
                backgroundColor: "#fff",
                border: "1px solid #ddd",
                borderRadius: "4px",
                cursor: "pointer",
                color: "black",
              }}
              onClick={() => onLocationClick(location)}
            >
              <h4 style={{ margin: "0 0 5px 0" }}>{location.name}</h4>
              <p style={{ margin: "0 0 5px 0" }}>
                <strong>Adresse :</strong> {location.adresse}
              </p>
              <p style={{ margin: "0 0 5px 0" }}>
                <strong>Téléphone :</strong> {location.telephone || "Non disponible"}
              </p>
              <p style={{ margin: "0 0 5px 0" }}>
                <strong>Services :</strong> {location.services || "Non spécifié"}
              </p>
              {showDistances && ( // Afficher la distance uniquement si `showDistances` est vrai
                <p style={{ margin: "0 0 5px 0" }}>
                  <strong>Distance :</strong> {location.distance ? `${location.distance.toFixed(2)} km` : "Non calculée"}
                </p>
              )}
              <p style={{ margin: "0 0 5px 0" }}>
                <strong>Infos supplémentaires :</strong> {location.info_supplementaire || "Aucune"}
              </p>
            </li>
          ))
        ) : (
          <p style={{ color: "red", textAlign: "center" }}>Aucune pharmacie trouvée</p>
        )}
      </ul>
    </div>
  );
}