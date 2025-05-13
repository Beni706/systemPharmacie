import express, { Router } from 'express';
import { authentificateToken } from '../Middleware/auth.js';
import { getAllFollowers, getFollowersById, createFollower, updateFollower, deleteFollower, loginFollower } from '../Controllers/followersController.js';

export const FollowersRouter = express.Router()

// Afficher tous les followers
FollowersRouter.get('/', authentificateToken, getAllFollowers)

// Afficher un follower par son id
FollowersRouter.get('/:id', authentificateToken, getFollowersById)

// Ajouter un follower
FollowersRouter.post('/', createFollower)

// Modifier un follower
FollowersRouter.put('/:id', authentificateToken, updateFollower)

// Supprimer un follower
FollowersRouter.delete('/:id', authentificateToken, deleteFollower)

// authentifier un follower
FollowersRouter.post('/login', loginFollower)