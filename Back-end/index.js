import express from 'express'
import { configurationMiddleware } from './Middleware/middleware.js'
import { pharmacieRouter } from './Routes/pharmacieRoute.js'
import { administrateurRouter } from './Routes/administrateurRoute.js'

// Créer une instance de l'application Express
const app = express()

// Middlewaires
configurationMiddleware(app)

// route principale
app.get('/', (rea, res) => {
    res.send('Système de localisation de pharmacies les plus proches')
})

// Route pour les pharmacies
app.use('/pharmacie', pharmacieRouter)

// Route pour les administrateurs
app.use('/administrateur', administrateurRouter)

// Ecoute du serveur
app.listen(8080, () => {
    console.log('Serveur en écoute au http://localhost:8080')
})