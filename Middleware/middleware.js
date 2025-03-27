import express from 'express'
const app = express()

// Middlewaires
export const configurationMiddleware = (app) => {
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
}
