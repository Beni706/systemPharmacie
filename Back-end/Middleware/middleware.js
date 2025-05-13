import express from 'express'
import cors from 'cors'
const app = express()

// Middlewaires
export const configurationMiddleware = (app) => {
    app.use(cors({origin: "*",}))
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }))
}
