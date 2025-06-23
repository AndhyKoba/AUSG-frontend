// Dans src/components/ConnexionForm.jsx

import React, { useState } from 'react';
import {
    FormControl,
    FormLabel,
    Input,
    Box,
    Button,
    Text,
    Link as ChakraLink,
    useToast
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ConnexionForm() {
    const [pseudo, setPseudo] = useState('');
    const [mot_de_passe, setMotDePasse] = useState(''); // Gardez mot_de_passe ici
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL;

        try {
            const response = await axios.post(BACKEND_URL + '/users/connexion', {
                pseudo,
                mot_de_passe, // Gardez mot_de_passe ici pour l'envoi
            });

            console.log('Connexion réussie :', response.data);

            const userRole = response.data.user?.role;
            const userPseudo = response.data.user?.pseudo;

            if (userPseudo) {
                localStorage.setItem('userPseudo', userPseudo);
                console.log('ConnexionForm: Pseudo stocké dans localStorage:', userPseudo);
            }
            if (userRole) {
                localStorage.setItem('userRole', userRole); // Ceci est crucial !
                console.log('ConnexionForm: Rôle stocké dans localStorage:', userRole);
            }

            toast({
                title: 'Connexion réussie.',
                description: `Bienvenue, ${userPseudo}!`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            if (userRole === "admin") {
                navigate('/admin-dashboard');
            } else if (userRole === "agent") {
                navigate('/agent'); 
            } else {
                navigate('/');
            }

        } catch (error) {
            console.error('Erreur lors de la connexion :', error);
            toast({
                title: 'Erreur de connexion.',
                description: error.response?.data?.message || 'Identifiants invalides ou une erreur est survenue. Veuillez réessayer.',
                status: 'error',
                duration: 9000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <Box
                w="400px"
                p="40px"
                bg="white"
                borderRadius="10px"
                boxShadow="lg"
                as="form"
                onSubmit={handleSubmit}
            >
                <Text fontSize="2xl" fontWeight="bold" mb="20px">Connexion</Text>

                <FormControl mb="15px" id="pseudo">
                    <FormLabel>Pseudo</FormLabel>
                    <Input
                        value={pseudo}
                        onChange={(e) => setPseudo(e.target.value)}
                    />
                </FormControl>

                <FormControl mb="20px" id="mot_de_passe"> {/* Gardez id="mot_de_passe" */}
                    <FormLabel>Mot de passe</FormLabel>
                    <Input
                        type="password"
                        value={mot_de_passe} // Gardez mot_de_passe ici
                        onChange={(e) => setMotDePasse(e.target.value)} // Gardez setMotDePasse ici
                    />
                </FormControl>

                <Button
                    colorScheme="brand"
                    mt="20px"
                    w="100%"
                    type="submit"
                    isLoading={isLoading}
                    loadingText="Connexion en cours..."
                >
                    Connexion
                </Button>

            </Box>
        </div>
    );
}

export default ConnexionForm;