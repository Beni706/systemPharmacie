"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import PharmacieList from "./PharmacieList";
import SearchBar from "./SearchBar"; // Importer la barre de recherche
import "leaflet/dist/leaflet.css";

let L;
if (typeof window !== "undefined") {
  L = require("leaflet");

  // Corrige le problème d'icône par défaut de Leaflet
  delete L.Icon.Default.prototype._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

// Charger react-leaflet dynamiquement pour éviter le SSR
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

export default function Map() {
  const [pharmacies, setPharmacies] = useState([]);
  const [filteredPharmacies, setFilteredPharmacies] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // État pour la barre de recherche
  const [selectedPharmacie, setSelectedPharmacie] = useState(null);
  const mapRef = useRef(null);
  const markerRefs = useRef({});

  // Récupérer les données des pharmacies
  useEffect(() => {
    async function fetchPharmacies() {
      try {
        const response = await fetch("http://localhost:8080/pharmacie");
        const data = await response.json();
        setPharmacies(data);
        setFilteredPharmacies(data); // Initialiser avec toutes les pharmacies
      } catch (error) {
        console.error("Erreur lors de la récupération des pharmacies :", error);
      }
    }

    fetchPharmacies();
  }, []);

  // Filtrer les pharmacies en fonction du terme de recherche
  useEffect(() => {
    const filtered = pharmacies.filter((pharmacie) =>
      pharmacie.nom.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPharmacies(filtered);
  }, [searchTerm, pharmacies]);

  const handlePharmacieClick = (pharmacie) => {
    setSelectedPharmacie(pharmacie);

    if (mapRef.current) {
      const map = mapRef.current;
      map.flyTo([pharmacie.latitude, pharmacie.longitude], 18);
    }

    if (markerRefs.current[pharmacie.id_pharmacie]) {
      markerRefs.current[pharmacie.id_pharmacie].openPopup();
    }
  };

  const handleLocateUser = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const userLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          console.log("Localisation utilisateur :", userLocation);

          try {
            const url = `http://localhost:8080/pharmacie/proche?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}`;
            console.log("URL de la requête :", url);

            const response = await fetch(url);
            const data = await response.json();
            console.log("Données reçues de l'API :", data);

            if (Array.isArray(data)) {
              setFilteredPharmacies(data);
            } else {
              console.error("La réponse de l'API n'est pas un tableau :", data);
              setFilteredPharmacies([]);
            }
          } catch (error) {
            console.error("Erreur lors de la récupération des pharmacies proches :", error);
            setFilteredPharmacies([]);
          }
        },
        (error) => {
          console.error("Erreur lors de la récupération de la localisation :", error);
          alert("Impossible de récupérer votre localisation. Vérifiez vos permissions.");
        }
      );
    } else {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%" }}>
      {/* Liste des pharmacies */}
      <div style={{ width: "300px", padding: "20px" }}>
        <button
          onClick={handleLocateUser}
          style={{
            marginBottom: "15px",
            padding: "10px",
            width: "100%",
            backgroundColor: "#007BFF",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Trouver les pharmacies proches
        </button>

        {/* Barre de recherche */}
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
          {Array.isArray(filteredPharmacies) &&
            filteredPharmacies.map((pharmacie) => (
              <li
                key={pharmacie.id_pharmacie}
                style={{
                  marginBottom: "15px",
                  padding: "15px",
                  border: "1px solid #ddd",
                  borderRadius: "10px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  cursor: "pointer",
                  backgroundColor: "#ffffff",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onClick={() => handlePharmacieClick(pharmacie)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.03)";
                  e.currentTarget.style.boxShadow = "0 6px 12px rgba(0, 0, 0, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
                }}
              >
                <strong
                  style={{
                    fontSize: "18px",
                    color: "#333",
                    display: "block",
                    textAlign: "center",
                    marginBottom: "10px",
                  }}
                >
                  {pharmacie.nom}
                </strong>
                <div style={{ marginBottom: "8px" }}>
                  <strong style={{ fontSize: "14px", color: "#555" }}>Adresse:</strong> {pharmacie.adresse}
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <strong style={{ fontSize: "14px", color: "#555" }}>Téléphone:</strong> {pharmacie.telephone || "N/A"}
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <strong style={{ fontSize: "14px", color: "#555" }}>Services:</strong> {pharmacie.services || "N/A"}
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <strong style={{ fontSize: "14px", color: "#555" }}>Distance:</strong>{" "}
                  {pharmacie.distance !== undefined ? `${pharmacie.distance.toFixed(2)} km` : "N/A"}
                </div>
                <div>
                  <strong style={{ fontSize: "14px", color: "#555" }}>Info Supplémentaire:</strong>{" "}
                  {pharmacie.info_supplementaire || "N/A"}
                </div>
              </li>
            ))}
        </ul>
      </div>

      {/* Carte */}
      <div style={{ flex: 1 }}>
        <MapContainer
          center={selectedPharmacie ? [selectedPharmacie.latitude, selectedPharmacie.longitude] : [0.3901, 9.4544]}
          zoom={selectedPharmacie ? 15 : 11}
          style={{ height: "100%", width: "100%" }}
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {filteredPharmacies.map((pharmacie) => (
            <Marker
              key={pharmacie.id_pharmacie}
              position={[pharmacie.latitude, pharmacie.longitude]}
              ref={(el) => (markerRefs.current[pharmacie.id_pharmacie] = el)}
              eventHandlers={{
                click: () => handlePharmacieClick(pharmacie),
              }}
            >
              <Popup>
                <h4>{pharmacie.nom}</h4>
                <p>{pharmacie.adresse}</p>
                <p>Distance : {pharmacie.distance} km</p>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}