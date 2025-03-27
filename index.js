import express from 'express'
import { configurationMiddleware } from './Middleware/middleware.js'

const app = express()

// Middlewaires
configurationMiddleware(app)

// route principale
app.get('/', (rea, res) => {
    res.send('Système de localisation de pharmacies les plus proches')
})

// ecoute du serveur
app.listen(8080, () => {
    console.log('Serveur en écoute au http://localhost:8080')
})