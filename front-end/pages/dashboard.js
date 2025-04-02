"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Head from "next/head"

const Dashboard = () => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("liste")
  const [pharmacies, setPharmacies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // État pour le formulaire d'ajout/modification
  const [formData, setFormData] = useState({
    nom: "",
    adresse: "",
    latitude: "",
    longitude: "",
    telephone: "",
    services: "",
    info_supplementaire: "",
  })

  // État pour l'édition
  const [editMode, setEditMode] = useState(false)
  const [currentPharmacieId, setCurrentPharmacieId] = useState(null)

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
    } else {
      fetchPharmacies()
    }
  }, [])

  // Récupérer la liste des pharmacies
  const fetchPharmacies = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:8080/pharmacie", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des pharmacies")
      }

      const data = await response.json()
      setPharmacies(data)
    } catch (err) {
      console.error("Erreur:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Gérer la déconnexion
  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/login")
  }

  // Gérer le changement dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      nom: "",
      adresse: "",
      latitude: "",
      longitude: "",
      telephone: "",
      services: "",
      info_supplementaire: "",
    })
    setEditMode(false)
    setCurrentPharmacieId(null)
  }

  // Soumettre le formulaire (ajout ou modification)
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("token")
      const url = editMode ? `http://localhost:8080/pharmacie/${currentPharmacieId}` : "http://localhost:8080/pharmacie"

      const method = editMode ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erreur lors de l'opération")
      }

      // Rafraîchir la liste des pharmacies
      await fetchPharmacies()

      // Afficher un message de succès
      setSuccess(editMode ? "Pharmacie modifiée avec succès" : "Pharmacie ajoutée avec succès")

      // Réinitialiser le formulaire et revenir à la liste
      resetForm()
      setActiveTab("liste")
    } catch (err) {
      console.error("Erreur:", err)
      setError(err.message)
    }
  }

  // Supprimer une pharmacie
  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette pharmacie ?")) {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`http://localhost:8080/pharmacie/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Erreur lors de la suppression de la pharmacie")
        }

        // Mettre à jour la liste des pharmacies
        setPharmacies(pharmacies.filter((pharmacie) => pharmacie.id_pharmacie !== id))
        setSuccess("Pharmacie supprimée avec succès")
      } catch (err) {
        console.error("Erreur:", err)
        setError(err.message)
      }
    }
  }

  // Éditer une pharmacie
  const handleEdit = (pharmacie) => {
    setFormData({
      nom: pharmacie.nom || "",
      adresse: pharmacie.adresse || "",
      latitude: pharmacie.latitude || "",
      longitude: pharmacie.longitude || "",
      telephone: pharmacie.telephone || "",
      services: pharmacie.services || "",
      info_supplementaire: pharmacie.info_supplementaire || "",
    })
    setEditMode(true)
    setCurrentPharmacieId(pharmacie.id_pharmacie)
    setActiveTab("formulaire")
  }

  // Ajouter une nouvelle pharmacie
  const handleAdd = () => {
    resetForm()
    setActiveTab("formulaire")
  }

  // Afficher le contenu en fonction de l'onglet actif
  const renderContent = () => {
    if (loading) {
      return (
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
        </div>
      )
    }

    switch (activeTab) {
      case "liste":
        return (
          <div style={styles.tabContent}>
            <div style={styles.header}>
              <h2 style={styles.title}>Liste des pharmacies</h2>
              <button onClick={handleAdd} style={styles.addButton}>
                + Ajouter une pharmacie
              </button>
            </div>

            {error && <div style={styles.errorMessage}>{error}</div>}
            {success && <div style={styles.successMessage}>{success}</div>}

            {pharmacies.length > 0 ? (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Nom</th>
                      <th style={styles.th}>Adresse</th>
                      <th style={styles.th}>Téléphone</th>
                      <th style={styles.th}>Coordonnées</th>
                      <th style={styles.th}>Services</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pharmacies.map((pharmacie) => (
                      <tr key={pharmacie.id_pharmacie} style={styles.tr}>
                        <td style={styles.td}>{pharmacie.nom}</td>
                        <td style={styles.td}>{pharmacie.adresse}</td>
                        <td style={styles.td}>{pharmacie.telephone || "Non renseigné"}</td>
                        <td style={styles.td}>
                          {pharmacie.latitude}, {pharmacie.longitude}
                        </td>
                        <td style={styles.td}>{pharmacie.services || "Non renseigné"}</td>
                        <td style={styles.td}>
                          <div style={styles.actionButtons}>
                            <button onClick={() => handleEdit(pharmacie)} style={styles.editButton}>
                              Modifier
                            </button>
                            <button onClick={() => handleDelete(pharmacie.id_pharmacie)} style={styles.deleteButton}>
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={styles.noData}>Aucune pharmacie trouvée</p>
            )}
          </div>
        )

      case "formulaire":
        return (
          <div style={styles.tabContent}>
            <div style={styles.header}>
              <h2 style={styles.title}>{editMode ? "Modifier la pharmacie" : "Ajouter une pharmacie"}</h2>
              <button onClick={() => setActiveTab("liste")} style={styles.backButton}>
                Retour à la liste
              </button>
            </div>

            {error && <div style={styles.errorMessage}>{error}</div>}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nom de la pharmacie *</label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Adresse *</label>
                  <input
                    type="text"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleChange}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Latitude *</label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Longitude *</label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Téléphone</label>
                  <input
                    type="text"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Services</label>
                  <input
                    type="text"
                    name="services"
                    value={formData.services}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Informations supplémentaires</label>
                <textarea
                  name="info_supplementaire"
                  value={formData.info_supplementaire}
                  onChange={handleChange}
                  rows={4}
                  style={styles.textarea}
                ></textarea>
              </div>

              <div style={styles.formActions}>
                <button type="button" onClick={() => setActiveTab("liste")} style={styles.cancelButton}>
                  Annuler
                </button>
                <button type="submit" style={styles.submitButton}>
                  {editMode ? "Modifier" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div style={styles.container}>
      <Head>
        <title>Administration des Pharmacies</title>
        <meta name="description" content="Interface d'administration des pharmacies" />
      </Head>

      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h1 style={styles.sidebarTitle}>Admin Pharmacies</h1>
        </div>
        <nav style={styles.nav}>
          <ul style={styles.navList}>
            <li style={styles.navItem}>
              <button
                onClick={() => setActiveTab("liste")}
                style={activeTab === "liste" ? { ...styles.navLink, ...styles.activeNavLink } : styles.navLink}
              >
                Liste des pharmacies
              </button>
            </li>
            <li style={styles.navItem}>
              <button
                onClick={handleAdd}
                style={
                  activeTab === "formulaire" && !editMode
                    ? { ...styles.navLink, ...styles.activeNavLink }
                    : styles.navLink
                }
              >
                Ajouter une pharmacie
              </button>
            </li>
          </ul>
        </nav>
        <div style={styles.sidebarFooter}>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Déconnexion
          </button>
        </div>
      </div>

      <div style={styles.content}>{renderContent()}</div>
    </div>
  )
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
  },
  sidebar: {
    width: "250px",
    backgroundColor: "white",
    borderRight: "1px solid #e0e0e0",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    height: "100vh",
  },
  sidebarHeader: {
    padding: "20px",
    borderBottom: "1px solid #e0e0e0",
  },
  sidebarTitle: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    margin: 0,
  },
  nav: {
    flex: 1,
    padding: "20px 0",
  },
  navList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  navItem: {
    margin: "5px 0",
  },
  navLink: {
    display: "block",
    padding: "10px 20px",
    textDecoration: "none",
    color: "#333",
    borderLeft: "3px solid transparent",
    width: "100%",
    textAlign: "left",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
  },
  activeNavLink: {
    borderLeft: "3px solid #0070f3",
    backgroundColor: "#f0f7ff",
    fontWeight: "bold",
  },
  sidebarFooter: {
    padding: "20px",
    borderTop: "1px solid #e0e0e0",
  },
  logoutButton: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  content: {
    flex: 1,
    marginLeft: "250px",
    padding: "20px",
  },
  tabContent: {
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    padding: "20px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    margin: 0,
  },
  addButton: {
    padding: "8px 16px",
    backgroundColor: "#0070f3",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  backButton: {
    padding: "8px 16px",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  tableContainer: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "12px",
    backgroundColor: "#f8f9fa",
    borderBottom: "2px solid #dee2e6",
  },
  tr: {
    borderBottom: "1px solid #dee2e6",
  },
  td: {
    padding: "12px",
  },
  actionButtons: {
    display: "flex",
    gap: "8px",
  },
  editButton: {
    padding: "6px 12px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  deleteButton: {
    padding: "6px 12px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  noData: {
    textAlign: "center",
    padding: "20px",
    color: "#6c757d",
  },
  form: {
    width: "100%",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
  },
  formGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "5px",
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    resize: "vertical",
  },
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
  },
  cancelButton: {
    padding: "10px 20px",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  submitButton: {
    padding: "10px 20px",
    backgroundColor: "#0070f3",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  errorMessage: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    padding: "10px",
    borderRadius: "4px",
    marginBottom: "20px",
  },
  successMessage: {
    backgroundColor: "#d4edda",
    color: "#155724",
    padding: "10px",
    borderRadius: "4px",
    marginBottom: "20px",
  },
  loading: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "200px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid rgba(0, 0, 0, 0.1)",
    borderRadius: "50%",
    borderTop: "4px solid #0070f3",
    animation: "spin 1s linear infinite",
  },
  "@keyframes spin": {
    "0%": { transform: "rotate(0deg)" },
    "100%": { transform: "rotate(360deg)" },
  },
}

export default Dashboard

