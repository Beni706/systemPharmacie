"use client";

import React from "react";

export default function SearchBar({ searchTerm, setSearchTerm }) {
  return (
    <input
      type="text"
      placeholder="Rechercher une pharmacie..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      style={{
        width: "95%",
        padding: "10px",
        marginBottom: "20px",
        border: "1px solid #ddd",
        borderRadius: "5px",
        fontSize: "14px",
        fontFamily: "'Roboto', Arial, sans-serif",
      }}
    />
  );
}