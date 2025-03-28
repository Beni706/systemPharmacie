import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET

const prisma = new PrismaClient()

// Afficher tous les administrateurs
export const getAllAdministrateurs = async (req, res) => {
    try {
        const administrateur = await prisma.administrateur.findMany()
        res.status(200).json(administrateur)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Erreur lors de la récupération des administrateurs' })
    }
}


// Afficher un administrateur par son ID
export const getAdministrateurById = async (req, res) =>{
    try {
        const { id } = req.params
        const administrateur = await prisma.administrateur.findUnique({
            where: { id_administrateur: parseInt(id) }
        })
        if(!administrateur){
            return res.status(400).json({ message: 'Aucun administrateur trouvé' })
        } else {
           return res.status(200).json(administrateur)
        }
        
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Erreur lors de la récupération de l\'administrateur' })
    }
}


// Ajouter un nouvel administrateur
export const createAdministrateur = async (req, res) => {
    try {
        const { nom_prenom, email, password } = req.body;

        if (!nom_prenom || !email || !password) {
            return res.status(400).json({ message: 'Tous les champs sont requis' })
        }

        const existeAdministrateur = await prisma.administrateur.findUnique({ where: { email: email } });
        if (existeAdministrateur) {
            return res.status(400).json({ message: 'Cet administrateur existe déjà !' })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const administrateur = await prisma.administrateur.create({
            data: {
                nom_prenom,
                email,
                password: hashedPassword
            }
        });

        const token = jwt.sign({ id: administrateur.id_administrateur }, JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ message: 'Administrateur ajouté avec succès', administrateur, token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Erreur lors de la création de l\'administrateur' });
    }
};


// Modifier un administrateur
export const updateAdministrateur = async (req, res) => {
    try {
        const { id } = req.params
        const { nom_prenom, email, password } = req.body

        // Crypter le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10)

        // Mettre à jour l'administrateur
        const administrateur = await prisma.administrateur.update({
            where: { id_administrateur: parseInt(id) },
            data: {
                nom_prenom,
                email,
                password: hashedPassword
            }
        })

        res.status(200).json({ message: 'Administrateur modifié avec succès', administrateur })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Erreur lors de la modification de l\'administrateur' })
    }
}


// Supprimer un administrateur
export const deleteAdministrateur = async (req, res) => {
    try {
        const {id} = req.params
        await prisma.administrateur.delete({ where: { id: parseInt(id) } })

        res.status(200).json({ message: 'Administrateur supprimé avec succès' })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Erreur lors de la suppression de l\'administrateur '})
        
    }
}


// Authentifier un administrateur
export const loginAdministrateur = async (req, res) => {
    try {
        const { email, password } = req.body
        // Verifier si l'email et le mot de passe sont fournis
        if(!email || !password) {
            return res.status(400).json({ message: 'Tous les champs sont requis' })
        }

        // Verifier si l'administrateur existe
        const existeAdministrateur = await prisma.administrateur.findUnique({ where: { email: email } })
        if(!existeAdministrateur) {
            return res.status(400).json({ message: 'Email incorrect' })
        }

        const motDePasseValide = await bcrypt.compare(password, existeAdministrateur.password)
        if(!motDePasseValide) {
            return res.status(400).json({ message: 'Mot de passe incorrect' })
        }

        // Genere le token
        const token = jwt.sign({ id: existeAdministrateur.id_administrateur }, JWT_SECRET, { expiresIn: '1h'})

        res.status(200).json({ message: 'Connexion réussie', token })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Erreur lors de la connexion de l\'administrateur' })        
    }
}
