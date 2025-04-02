import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv'
dotenv.config()

const prisma = new PrismaClient()

// Fonction pour calculer la distance entre deux points (Haversine)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance en km
}


// Afficher toutes les pharmacies
export const getAllPharmacies = async (req, res) => {
    try {
        const pharmacie = await prisma.pharmacies.findMany()
        res.json(pharmacie)
    }catch(error) {
        console.log(error)
        res.status(500).json({ message: 'Erreur lors de la récupération des pharmacies' })
    }
}


// Afficher les 5 pharmacies les plus proches
export const getAllPharmacieProche = async (req, res) => {
        const { latitude, longitude } = req.query;
    if (!latitude || !longitude) {
        return res.status(400).json({ error: "Latitude et longitude requises." });
    }

    try {
        const pharmacies = await prisma.pharmacies.findMany();
        
        const pharmaciesAvecDistance = pharmacies.map(pharmacie => {
            const distance = calculateDistance(
                parseFloat(latitude), parseFloat(longitude),
                pharmacie.latitude, pharmacie.longitude
            );
            return { ...pharmacie, distance };
        });

        pharmaciesAvecDistance.sort((a, b) => a.distance - b.distance);
        res.json(pharmaciesAvecDistance.slice(0, 5));
    } catch(error) {
        console.log(error);
        res.status(500).json({message:'Erreur lors de la récupération des pharmacies les plus proches'})
        
    }
}


// Ajouter une nouvelle pharmacie
export const createPharmacie = async (req, res) => {
    try {
        const { nom, adresse, latitude, longitude, telephone, services, info_supplementaire } = req.body;

        //Verifier si les champs sont bien present
        if(!nom || !adresse || !latitude || !longitude) {
            return res.status(400).json({message:'Tous les champs sont requis'})
        }

        // Verifier si la pharmacie existe déjà
        const existePharmacie = await prisma.pharmacies.findUnique({ where: { nom: nom } })

        if(existePharmacie) {
            return res.status(400).json({ message: 'Cette pharmacie existe déjà !' })
        }

        // Créer une nouvelle pharmacie
        const pharmacie = await prisma.pharmacies.create({
            data: {
                nom,
                adresse,
                latitude,
                longitude,
                telephone: telephone || null,
                services: services || null,
                info_supplementaire: info_supplementaire || null
            }
        })

        res.status(201).json({ message: 'Pharmacie ajouté avec succès', pharmacie })

    } catch(error) {
        console.log(error)
        res.status(500).json({message:'Erreur lors de la création de la pharmacie'})
    }
}


// Mettre à jour une pharmacie
export const updatePharmacie = async (req, res) => {
    try {
        const { id } = req.params;

        const { nom, adresse, latitude, longitude, telephone, services, info_supplementaire } = req.body;


        // Mettre à jour la pharmacie
        const pharmacie = await prisma.pharmacies.update({
            where: { id_pharmacie: parseInt(id) },
            data: {
                nom,
                adresse,
                latitude,
                longitude,
                telephone,
                services,
                info_supplementaire
            }
        });

        res.json({ message: 'Pharmacie mise à jour avec succès', pharmacie });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour de la pharmacie' });
    }
};


// Supprimer une pharmacie
export const deletePharmacie = async (req, res) => {
    try {
        const { id_Pharmacie } = req.params

        // Supprimer la pharmacie
        await prisma.pharmacie.delete({
            where: { id: parseInt(id_Pharmacie) }
        })
        res.json({ message: 'Pharmacie supprimé avec succès' })
    } catch(error) {
        console.log(error)
        res.status(500).json({ message: 'Erreur lors de la suppression de la pharmacie' })
    }
}

