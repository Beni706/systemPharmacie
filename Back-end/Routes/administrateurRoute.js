import express, { Router } from 'express'
import { authentificateToken } from '../Middleware/auth.js'
import { getAllAdministrateurs, getAdministrateurById, createAdministrateur, updateAdministrateur, deleteAdministrateur, loginAdministrateur } from '../Controllers/administrateurController.js'

export const administrateurRouter = express.Router()

// Afficher tous les administrateurs
administrateurRouter.get('/', authentificateToken, getAllAdministrateurs)

// Afficher un administrateur par son ID
administrateurRouter.get('/:id', authentificateToken, getAdministrateurById)

// Ajouter un nouvel administrateur
administrateurRouter.post('/', authentificateToken, createAdministrateur)

// Modifier un administrateur
administrateurRouter.put('/:id', authentificateToken, updateAdministrateur)

// Supprimer un administrateur
administrateurRouter.delete('/:id', authentificateToken, deleteAdministrateur)

// Authentifier un administrateur
administrateurRouter.post('/login', loginAdministrateur)