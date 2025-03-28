import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const authentificateToken = async (req, res, next) => {
    // Recupérer le token depuis l'en-tête authorization
    const token = req.header('Authorization')?.split(' ')[1]

    // Verifier si le token est present
    if(!token){
       return res.status(401).json({ message: 'Accès refusé' })
    }

    try {
     // Verifier et decoder le token
     const verified = jwt.verify(token, JWT_SECRET)
     
     // Ajout de l'ID de l'administrateur verifié à la requête
     req.administrateurId= verified.id

     // passer au middleware suivant ou à la route 
     next()
     
    } catch (error) {
        console.log(error)
        res.status(400).json({ message: "Token invalide" })
    }
}