import { PrismaClient } from "@prisma/client"
import dotenv from "dotenv"
dotenv.config()

const prisma = new PrismaClient()

// Fonction améliorée pour calculer la distance entre deux points (Haversine)
function calculateDistance(lat1, lon1, lat2, lon2) {
  // Convertir les coordonnées en nombres flottants avec précision
  lat1 = Number.parseFloat(Number.parseFloat(lat1).toFixed(6))
  lon1 = Number.parseFloat(Number.parseFloat(lon1).toFixed(6))
  lat2 = Number.parseFloat(Number.parseFloat(lat2).toFixed(6))
  lon2 = Number.parseFloat(Number.parseFloat(lon2).toFixed(6))

  // Vérifier la validité des coordonnées
  if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
    console.error("Coordonnées invalides:", { lat1, lon1, lat2, lon2 })
    return Number.MAX_VALUE // Retourner une grande valeur en cas d'erreur
  }

  const R = 6371 // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // Distance en km

  // Journaliser la distance calculée
  console.log("Distance calculée:", distance, "km")

  return distance
}

// Afficher toutes les pharmacies
export const getAllPharmacies = async (req, res) => {
  try {
    const pharmacie = await prisma.pharmacies.findMany()
    res.json(pharmacie)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Erreur lors de la récupération des pharmacies" })
  }
}

// Afficher les 5 pharmacies les plus proches
export const getAllPharmacieProche = async (req, res) => {
  const { latitude, longitude } = req.query

  // Validation améliorée des coordonnées
  if (!latitude || !longitude) {
    return res.status(400).json({ error: "Latitude et longitude requises." })
  }

  try {
    // Vérifier si les coordonnées sont valides
    const lat = Number.parseFloat(latitude)
    const lng = Number.parseFloat(longitude)

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        error: "Coordonnées invalides",
        details: { latitude, longitude, parsed: { lat, lng } },
      })
    }

    // Arrondir les coordonnées à 6 décimales pour une meilleure précision
    const roundedLat = Number.parseFloat(lat.toFixed(6))
    const roundedLng = Number.parseFloat(lng.toFixed(6))


    const pharmacies = await prisma.pharmacies.findMany()

    // Vérifier si des pharmacies ont été trouvées
    if (!pharmacies || pharmacies.length === 0) {
      return res.status(404).json({ message: "Aucune pharmacie trouvée dans la base de données" })
    }


    const pharmaciesAvecDistance = pharmacies.map((pharmacie) => {
      // Vérifier si les coordonnées de la pharmacie sont valides
      if (!pharmacie.latitude || !pharmacie.longitude) {
        console.warn(`Pharmacie ${pharmacie.id_pharmacie} (${pharmacie.nom}) a des coordonnées manquantes`)
        return { ...pharmacie, distance: Number.MAX_VALUE }
      }

      const distance = calculateDistance(lat, lng, pharmacie.latitude, pharmacie.longitude)
      return { ...pharmacie, distance }
    })

    // Filtrer les pharmacies avec des distances valides
    const validPharmacies = pharmaciesAvecDistance.filter((p) => p.distance !== Number.MAX_VALUE)

    // Trier par distance
    validPharmacies.sort((a, b) => a.distance - b.distance)

    // Prendre les 5 plus proches
    const nearestPharmacies = validPharmacies.slice(0, 5)


    res.json(nearestPharmacies)
  } catch (error) {
    console.error("Erreur complète:", error)
    res.status(500).json({
      message: "Erreur lors de la récupération des pharmacies les plus proches",
      error: error.message,
    })
  }
}

// Ajouter une nouvelle pharmacie
export const createPharmacie = async (req, res) => {
  try {
    const { nom, adresse, latitude, longitude, telephone, services, info_supplementaire } = req.body

    //Verifier si les champs sont bien present
    if (!nom || !adresse || !latitude || !longitude) {
      return res.status(400).json({ message: "Tous les champs sont requis" })
    }

    // Vérifier si les coordonnées sont valides
    const lat = Number.parseFloat(latitude)
    const lng = Number.parseFloat(longitude)

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        error: "Coordonnées invalides",
        details: { latitude, longitude, parsed: { lat, lng } },
      })
    }

    // Verifier si la pharmacie existe déjà
    const existePharmacie = await prisma.pharmacies.findUnique({ where: { nom: nom } })

    if (existePharmacie) {
      return res.status(400).json({ message: "Cette pharmacie existe déjà !" })
    }

    // Créer une nouvelle pharmacie
    const pharmacie = await prisma.pharmacies.create({
      data: {
        nom,
        adresse,
        latitude: lat,
        longitude: lng,
        telephone: telephone || null,
        services: services || null,
        info_supplementaire: info_supplementaire || null,
      },
    })

    res.status(201).json({ message: "Pharmacie ajouté avec succès", pharmacie })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Erreur lors de la création de la pharmacie" })
  }
}

// Mettre à jour une pharmacie
export const updatePharmacie = async (req, res) => {
  try {
    const { id } = req.params

    const { nom, adresse, latitude, longitude, telephone, services, info_supplementaire } = req.body

    // Vérifier si les coordonnées sont valides
    const lat = Number.parseFloat(latitude)
    const lng = Number.parseFloat(longitude)

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        error: "Coordonnées invalides",
        details: { latitude, longitude, parsed: { lat, lng } },
      })
    }

    // Mettre à jour la pharmacie
    const pharmacie = await prisma.pharmacies.update({
      where: { id_pharmacie: Number.parseInt(id) },
      data: {
        nom,
        adresse,
        latitude: lat,
        longitude: lng,
        telephone,
        services,
        info_supplementaire,
      },
    })

    res.json({ message: "Pharmacie mise à jour avec succès", pharmacie })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Erreur lors de la mise à jour de la pharmacie" })
  }
}

// Supprimer une pharmacie
export const deletePharmacie = async (req, res) => {
  try {
    const { id_Pharmacie } = req.params

    // Supprimer la pharmacie
    await prisma.pharmacies.delete({
      where: { id: Number.parseInt(id_Pharmacie) },
    })
    res.json({ message: "Pharmacie supprimé avec succès" })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Erreur lors de la suppression de la pharmacie" })
  }
}
