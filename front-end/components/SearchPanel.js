import React from "react";

export default function SearchPanel({ searchTerm, setSearchTerm, locations, onLocationClick }) {
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  
  return (
    <div style={{ width: "35%", padding: "20px", backgroundColor: "#f8f9fa" }}>
      <h3 style={{ color: "black" }}>Rechercher un lieu</h3>
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
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {locations.map((location) => (
          <li
            key={location.id}
            style={{
              padding: "10px",
              marginBottom: "10px",
              backgroundColor: "#fff",
              border: "1px solid #ddd",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            onClick={() => onLocationClick(location)}
          >
            {location.name}
          </li>
        ))}
      </ul>
    </div>
  );
}