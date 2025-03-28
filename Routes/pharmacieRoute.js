import express from 'express'
import { authentificateToken } from '../Middleware/auth.js'
import { getAllPharmacies, getAllPharmacieProche, createPharmacie, updatePharmacie, deletePharmacie } from '../Controllers/pharmacieController.js'

export const pharmacieRouter = express.Router()

// Afficher toutes les pharmacies
pharmacieRouter.get('/', getAllPharmacies)

// Afficher les 5 pharmacies les plus proches
pharmacieRouter.get('/proche', getAllPharmacieProche)

// Ajouter une nouvelle pharmacie
pharmacieRouter.post('/', authentificateToken, createPharmacie)

// Modifier une pharmacie
pharmacieRouter.put('/:id', authentificateToken, updatePharmacie)

// Supprimer une pharmacie
pharmacieRouter.delete('/:id', authentificateToken, deletePharmacie)