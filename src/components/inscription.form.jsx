import React, { useState } from 'react'
import {
    FormControl,
    FormLabel,
    Input,
    Box,
    Select,
    Button,
    Text,
    Link as ChakraLink
} from '@chakra-ui/react'
import { Link as RouterLink } from "react-router-dom"
import axios from 'axios'
import { useToast } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"

function InscriptionForm() {
    const [pseudo, setPseudo] = useState('');
    const [mot_de_passe, setMotDePasse] = useState('');
    const [role, setRole] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Pour gérer l'état de chargement du bouton
    const toast = useToast(); // Initialisez useToast
    const navigate = useNavigate(); // Initialisez useNavigate pour la redirection

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true); // Active l'état de chargement du bouton
        const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL;

        try {
        const response = await axios.post(BACKEND_URL + '/users/inscription', {
            pseudo,
            mot_de_passe,
            role,
        });

        console.log('Inscription réussie :', response.data);

        toast({
            title: 'Inscription réussie.',
            description: 'Votre compte a été créé.',
            status: 'success',
            duration: 5000,
            isClosable: true,
        });

        // Rediriger l'utilisateur vers la page de connexion après l'inscription réussie
        navigate('/connexion');

        } catch (error) {
        console.error('Erreur lors de l\'inscription :', error);
        toast({
            title: 'Erreur d\'inscription.',
            description: error.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.',
            status: 'error',
            duration: 5000,
            isClosable: true,
        });
        } finally {
        setIsLoading(false); // Désactive l'état de chargement
        }
    };

  return (
    <div>
        <Box w="400px" p="40px" bg="white" borderRadius="10px" boxShadow="lg">
            <Text fontSize="2xl" fontWeight="bold" mb="20px">Inscription</Text>
            <FormControl mb="15px" id="pseudo">
                <FormLabel>Pseudo</FormLabel>
                <Input onChange={(e) => setPseudo(e.target.value)} />
            </FormControl>
            <FormControl mb="20px" id="mot_de_passe">
                <FormLabel>Mot de passe</FormLabel>
                <Input type="password" onChange={(e) => setMotDePasse(e.target.value)} />
            </FormControl>
            <FormControl mb="20px" id="role">
                <FormLabel>Role</FormLabel>
                <Select placeholder='Séléctionner un role' onChange={(e) => setRole(e.target.value)}>
                    <option value="admin">Administrateur</option>
                    <option value="agent">Agent</option>
                </Select>
            </FormControl>
            <Button colorScheme="brand" mt="20px" w="100%" isLoading={isLoading} onClick={handleSubmit}>Inscription</Button>
            <Text fontSize="sm" mt="10px" textAlign="center">
              Vous avez déjà un compte ?{' '}
              <RouterLink to="/connexion">
                <ChakraLink color='cerulean.500'>
                  Connectez-vous
                </ChakraLink>
              </RouterLink>
            </Text>
        </Box>
    </div>
  )
}

export default InscriptionForm;