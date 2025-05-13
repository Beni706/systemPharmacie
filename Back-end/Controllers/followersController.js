import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET;

//afficher tous les followers
export const getAllFollowers = async (req, res) => {
  try {
    const followers = await prisma.followers.findMany();
    res.status(200).json(followers);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des followers" });
  }
};

//afficher un follower par son ID
export const getFollowersById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const followers = await prisma.followers.findUnique({
      where: { id_follower: id },
    });

    // Vérifier si le follower existe
    if (!followers) {
      return res.status(403).json({ message: "Aucun follower trouvé" });
    } else {
      return res.status(200).json(followers);
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération du follower" });
  }
};

// Ajouter un follower
export const createFollower = async (req, res) => {
  try {
    const { nom, prenom, email, password } = req.body; // Correction ici

    // Vérifier si tous les champs sont remplis
    if (!nom || !prenom || !email || !password) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    // Vérifier si le follower existe déjà
    const existeFollower = await prisma.followers.findUnique({
      where: { email: email },
    });
    if (existeFollower) {
      return res.status(404).json({ message: "Cet utilisateur existe déjà" });
    }

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    const follower = await prisma.followers.create({
      data: {
        nom,
        prenom,
        email,
        password: hashedPassword,
      },
    });
    res.status(201).json({ message: "Follower ajouté avec succès", follower });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur lors de l'ajout du follower" });
  }
};


// Modifier un follower
export const updateFollower = async (req, res) => {
    try {
        const id = parseInt(req.params.is);
        const { nom, prenom, email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password,10);

        const follower = await prisma.followers.update({
            where: { id_follower: id },
            data: {
                nom,
                prenom,
                email,
                password: hashedPassword
            },
        });
        res.status(200).json({ message: "Follower modifier avec succès", follower });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Erreur lors de la modification du follower" });
        
    };
};


// Supprimer un follower
export const deleteFollower = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const follower = await prisma.followers.delete({
      where: { id_follower: id },
    });

    // Vérifier si le follower existe
    if(!follower) {
        return res.status(400).json({ message: "Aucun follower trouvé" });
    } else {
        res.status(200).json({ message: "Follower supprimé avec succès", follower });
    }
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur lors de la suppression du follower" });
  }
};


// Authentifier un follower
export const loginFollower = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Vérifier si tous les champs sont remplis
        if (!email || !password) {
            return res.status(400).json({ message: "Tous les champs sont requis" });
        }

        // Vérifier si le follower existe
        const follower = await prisma.followers.findUnique({
            where: { email: email },
        });
        if (!follower) {
            return res.status(400).json({ message: "Identifiant incorrect" });
        }

        // Vérifier le mot de passe
        const isPasswordValid = await bcrypt.compare(password, follower.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Identifiant incorrect" });
        }

        // Générer le token
        const token = jwt.sign({ id_follower: follower.id_follower}, JWT_SECRET, { expiresIn: "7d" } );
        res.status(200).json({ message: "Connexion réussie", token });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Erreur lors de l'authentification du follower" });
        
    }
}