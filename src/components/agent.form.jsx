// src/components/AgentForm.jsx
import React, { useState, useEffect } from 'react';
import {
    FormControl, FormLabel, Input, Box, Grid, Button, Text,
    Image, Spacer, Flex, GridItem, Select, Heading, NumberInput, NumberInputField,
    Stepper, Step, StepIndicator, StepStatus, StepIcon, StepNumber, StepSeparator, StepTitle,
    useSteps, SimpleGrid,
    Link as ChakraLink, useToast,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AgentForm() {
    // Step 0: Détails de l'opération
    const [numero_de_cloture, setNumeroDeCloture] = useState('');
    const [date, setDate] = useState('');
    const [point_de_vente, setPointDeVente] = useState('');
    const [connectedUserPseudo, setConnectedUserPseudo] = useState('');

    // Step 1: Types de Transaction (all initialized to 0 for number inputs)
    const [billet, setBillet] = useState(0);
    const [vente_diverses, setVenteDiverses] = useState(0);
    const [reajustement, setReajustement] = useState(0);
    const [xbag, setXbag] = useState(0);
    const [penalite, setPenalite] = useState(0);
    const [remboursement, setRemboursement] = useState(0);

    // Step 2: Modes de Paiement (all initialized to 0 for number inputs)
    const [especes, setEspeces] = useState(0);
    const [mobile, setMobile] = useState(0);
    const [cb, setCb] = useState(0);
    const [virement, setVirement] = useState(0);
    const [cheque, setCheque] = useState(0);

    // Step 3: Totaux
    const [total_hors_taxes, setTotalHorsTaxes] = useState(0);
    const [montant_de_la_taxe, setMontantDeLaTaxe] = useState(0);
    const [total_ttc, setTotalTtc] = useState(0);

    const navigate = useNavigate();
    const toast = useToast();

    const [initialPseudoForLogout, setInitialPseudoForLogout] = useState('');

    useEffect(() => {
        const storedPseudo = localStorage.getItem('userPseudo');
        if (storedPseudo) {
            setConnectedUserPseudo(storedPseudo);
            setInitialPseudoForLogout(storedPseudo);
        }
    }, []);

    const steps = [
        { title: 'Détails de l\'opération' },
        { title: 'Types de Transaction' },
        { title: 'Modes de Paiement' },
        { title: 'Totaux' },
        { title: 'Récapitulatif & Validation' },
    ];

    const { activeStep, setActiveStep } = useSteps({
        index: 0,
        count: steps.length,
    });

    const calculateTtc = (totalHorsTaxes, taxAmount) => {
        const sum = parseFloat(totalHorsTaxes || 0);
        const tax = parseFloat(taxAmount || 0);
        return sum + tax;
      };
      
      const handleCalculateAndVerifyTotals = () => {
        // Ici, total_hors_taxes et montant_de_la_taxe sont les valeurs entrées par l'utilisateur.
        // total_ttc est la valeur calculée et affichée automatiquement par le useEffect.
      
        // 1. Vérification INTERNE : Est-ce que le TTC affiché est bien (Hors Taxes + Taxe) ?
        const expectedTtcFromInputs = total_hors_taxes + montant_de_la_taxe;
      
        if (Math.abs(total_ttc - expectedTtcFromInputs) > 0.01) {
          toast({
            title: 'Erreur de calcul du TTC détectée !',
            description: `Le Total TTC affiché (${total_ttc.toFixed(2)}) ne correspond PAS à (Total Hors Taxes + Montant de la Taxe) (${expectedTtcFromInputs.toFixed(2)}).`,
            status: 'error', // C'est une erreur de logique de calcul, donc 'error' est approprié.
            duration: 9000,
            isClosable: true,
          });
          // On pourrait retourner ici si cette erreur est critique et bloque la suite
          // return;
        }
      
        // 2. Vérification de COHÉRENCE : Est-ce que le TTC (correctement calculé) correspond aux modes de paiement ?
        // La somme des modes de paiement représente l'argent RÉELLEMENT reçu, qui devrait inclure la taxe.
        const sumOfPaymentMethods = especes + mobile + cb + virement + cheque;
      
        // IMPORTANT : On retire cette ligne car elle fausse la comparaison si sumOfPaymentMethods est déjà TTC
        // const sumOfPaymentMethodsPlusTaxes = sumOfPaymentMethods + montant_de_la_taxe;
      
        if (Math.abs(total_ttc - sumOfPaymentMethods) > 0.01) {
          toast({
            title: 'Discrépance des paiements détectée !',
            description: `Le Total TTC calculé (${total_ttc.toFixed(2)}) ne correspond PAS à la somme des modes de paiement (${sumOfPaymentMethods.toFixed(2)}). Veuillez vérifier.`,
            status: 'warning', // C'est une discrépance, pas forcément une erreur de code.
            duration: 9000,
            isClosable: true,
          });
        } else {
          // Si toutes les vérifications passent
          toast({
            title: 'Totaux vérifiés.',
            description: 'Le Total TTC est correct et correspond à la somme des modes de paiement.',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        }
      };

    const handleLogout = async () => {
        const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL;

        if (initialPseudoForLogout) {
            try {
                const response = await axios.post(BACKEND_URL + '/users/deconnexion', {
                    pseudo: initialPseudoForLogout
                });

                if (response.data.success) {
                    toast({
                        title: 'Déconnexion réussie.',
                        description: 'Vous avez été déconnecté(e).',
                        status: 'success',
                        duration: 3000,
                        isClosable: true,
                    });
                } else {
                    toast({
                        title: 'Erreur de déconnexion.',
                        description: response.data.message || 'Une erreur est survenue lors de la déconnexion côté serveur.',
                        status: 'error',
                        duration: 5000,
                        isClosable: true,
                    });
                }

            } catch (error) {
                console.error('Erreur lors de l\'appel de déconnexion au backend:', error);
                toast({
                    title: 'Erreur réseau.',
                    description: 'Impossible de contacter le serveur pour la déconnexion.',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
            }
        }

        localStorage.removeItem('userPseudo');
        localStorage.removeItem('userRole');
        navigate('/connexion');
    };

    // Fonction pour réinitialiser tous les états du formulaire
    const resetForm = () => {
        // Step 0
        setNumeroDeCloture('');
        setDate('');
        setPointDeVente('');
        // setConnectedUserPseudo(''); // Ne pas réinitialiser le pseudo de l'agent, il reste connecté

        // Step 1: Types de Transaction
        setBillet(0);
        setVenteDiverses(0);
        setReajustement(0);
        setXbag(0);
        setPenalite(0);
        setRemboursement(0);

        // Step 2: Modes de Paiement
        setEspeces(0);
        setMobile(0);
        setCb(0);
        setVirement(0);
        setCheque(0);

        // Step 3: Totaux
        setTotalHorsTaxes(0);
        setMontantDeLaTaxe(0);
        setTotalTtc(0);

        // Reset to the first step
        setActiveStep(0);
    };

    const handleSubmitTransaction = async () => {
        const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL;
        const agentName = localStorage.getItem('userPseudo');

        // Ensure totals are calculated before submission
        const sumOfTransactionTypes = billet + vente_diverses + reajustement + xbag + penalite + remboursement;
        const calculatedTtc = sumOfTransactionTypes + montant_de_la_taxe;

        const transactionData = {
            numero_de_cloture,
            date,
            point_de_vente,
            agent: agentName,

            billet,
            vente_diverses,
            reajustement,
            xbag,
            penalite,
            remboursement,

            especes,
            mobile,
            cb,
            virement,
            cheque,

            total_hors_taxes,
            montant_de_la_taxe,
            total_ttc: calculatedTtc, 
        };

        console.log("Données de la transaction à envoyer:", transactionData);

        try {
            const response = await axios.post(BACKEND_URL + '/transactions', transactionData);
            console.log('Transaction soumise avec succès:', response.data);
            toast({
                title: 'Transaction soumise.',
                description: 'La transaction a été enregistrée avec succès.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });

            // Réinitialiser le formulaire après succès
            resetForm();

        } catch (error) {
            console.error('Erreur lors de la soumission de la transaction:', error);
            toast({
                title: 'Erreur de soumission.',
                description: error.response?.data?.message || 'Une erreur est survenue lors de l\'enregistrement de la transaction.',
                status: 'error',
                duration: 9000,
                isClosable: true,
            });
        }
    };

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <Box>
                        <Heading size="md" mb={4}>Détails de l'opération</Heading>
                        <FormControl id='numero_de_cloture' mb={4} isRequired>
                            <FormLabel>Numéro de clôture</FormLabel>
                            <Input
                                size="sm"
                                w='full'
                                value={numero_de_cloture}
                                onChange={(e) => setNumeroDeCloture(e.target.value)}
                                placeholder='Entrer le numéro de clôture'
                            />
                        </FormControl>
                        <FormControl id='date' mb={4} isRequired>
                            <FormLabel>Date</FormLabel>
                            <Input
                                type='date'
                                size="sm"
                                w='full'
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </FormControl>
                        <FormControl id="point_de_vente" mb={4} isRequired>
                            <FormLabel>Point de vente</FormLabel>
                            <Select
                                placeholder='Sélectionner le point de vente'
                                size="sm"
                                value={point_de_vente}
                                onChange={(e) => setPointDeVente(e.target.value)}
                            >
                                <option value="ADL1">ADL 1</option>
                                <option value="ADL1">ADL 2</option>
                                <option value="ADP">ADP</option>
                                <option value="ADP">MFF</option>
                                <option value="ADP">FCV</option>
                            </Select>
                        </FormControl>
                        <Flex mt={6} justify="flex-end">
                            <Button onClick={() => setActiveStep(activeStep + 1)}>
                                Suivant
                            </Button>
                        </Flex>
                    </Box>
                );
            case 1:
                return (
                    <Box>
                        <Heading size="md" mb={4}>Types de Transaction</Heading>
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                            <FormControl id='billet' mb={3}>
                                <FormLabel fontSize="sm">Billet</FormLabel>
                                <NumberInput size="sm" min={0} value={billet} onChange={(valueString, valueAsNumber) => setBillet(valueAsNumber || 0)}>
                                    <NumberInputField />
                                </NumberInput>
                            </FormControl>
                            <FormControl id='vente_diverses' mb={3}>
                                <FormLabel fontSize="sm">Vente diverses</FormLabel>
                                <NumberInput size="sm" min={0} value={vente_diverses} onChange={(valueString, valueAsNumber) => setVenteDiverses(valueAsNumber || 0)}>
                                    <NumberInputField />
                                </NumberInput>
                            </FormControl>
                            <FormControl id='reajustement' mb={3}>
                                <FormLabel fontSize="sm">Réajustement</FormLabel>
                                <NumberInput size="sm" min={0} value={reajustement} onChange={(valueString, valueAsNumber) => setReajustement(valueAsNumber || 0)}>
                                    <NumberInputField />
                                </NumberInput>
                            </FormControl>
                            <FormControl id='xbag' mb={3}>
                                <FormLabel fontSize="sm">Xbag</FormLabel>
                                <NumberInput size="sm" min={0} value={xbag} onChange={(valueString, valueAsNumber) => setXbag(valueAsNumber || 0)}>
                                    <NumberInputField />
                                </NumberInput>
                            </FormControl>
                            <FormControl id='penalite' mb={3}>
                                <FormLabel fontSize="sm">Pénalité</FormLabel>
                                <NumberInput size="sm" min={0} value={penalite} onChange={(valueString, valueAsNumber) => setPenalite(valueAsNumber || 0)}>
                                    <NumberInputField />
                                </NumberInput>
                            </FormControl>
                            <FormControl id='remboursement' mb={3}>
                                <FormLabel fontSize="sm">Remboursement</FormLabel>
                                <NumberInput size="sm" min={0} value={remboursement} onChange={(valueString, valueAsNumber) => setRemboursement(valueAsNumber || 0)}>
                                    <NumberInputField />
                                </NumberInput>
                            </FormControl>
                        </SimpleGrid>
                        <Flex mt={6} justify="space-between">
                            <Button onClick={() => setActiveStep(activeStep - 1)}>
                                Précédent
                            </Button>
                            <Button onClick={() => setActiveStep(activeStep + 1)}>
                                Suivant
                            </Button>
                        </Flex>
                    </Box>
                );
            case 2:
                return (
                    <Box>
                        <Heading size="md" mb={4}>Modes de Paiement</Heading>
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                            <FormControl id='especes' mb={3}>
                                <FormLabel fontSize="sm">Espèces</FormLabel>
                                <NumberInput size="sm" min={0} value={especes} onChange={(valueString, valueAsNumber) => setEspeces(valueAsNumber || 0)}>
                                    <NumberInputField />
                                </NumberInput>
                            </FormControl>
                            <FormControl id='mobile' mb={3}>
                                <FormLabel fontSize="sm">Mobile Money</FormLabel>
                                <NumberInput size="sm" min={0} value={mobile} onChange={(valueString, valueAsNumber) => setMobile(valueAsNumber || 0)}>
                                    <NumberInputField />
                                </NumberInput>
                            </FormControl>
                            <FormControl id='cb' mb={3}>
                                <FormLabel fontSize="sm">Carte Bancaire</FormLabel>
                                <NumberInput size="sm" min={0} value={cb} onChange={(valueString, valueAsNumber) => setCb(valueAsNumber || 0)}>
                                    <NumberInputField />
                                </NumberInput>
                            </FormControl>
                            <FormControl id='virement' mb={3}>
                                <FormLabel fontSize="sm">Virement Bancaire</FormLabel>
                                <NumberInput size="sm" min={0} value={virement} onChange={(valueString, valueAsNumber) => setVirement(valueAsNumber || 0)}>
                                    <NumberInputField />
                                </NumberInput>
                            </FormControl>
                            <FormControl id='cheque' mb={3}>
                                <FormLabel fontSize="sm">Chèque</FormLabel>
                                <NumberInput size="sm" min={0} value={cheque} onChange={(valueString, valueAsNumber) => setCheque(valueAsNumber || 0)}>
                                    <NumberInputField />
                                </NumberInput>
                            </FormControl>
                        </SimpleGrid>
                        <Flex mt={6} justify="space-between">
                            <Button onClick={() => setActiveStep(activeStep - 1)}>
                                Précédent
                            </Button>
                            <Button onClick={() => setActiveStep(activeStep + 1)}>
                                Suivant
                            </Button>
                        </Flex>
                    </Box>
                );
            case 3:
                return (
                    <Box>
                        <Heading size="md" mb={4}>Totaux</Heading>

                        <FormControl id='total_hors_taxes' mb={3} isRequired>
                        <FormLabel fontSize="sm">Total hors taxes</FormLabel>
                        <NumberInput
                            size="sm"
                            min={0}
                            value={total_hors_taxes} // Value comes directly from state
                            onChange={(valueString, valueAsNumber) => setTotalHorsTaxes(valueAsNumber || 0)} // User can change this
                        >
                            <NumberInputField />
                        </NumberInput>
                        </FormControl>

                        <FormControl id='montant_de_la_taxe' mb={3} isRequired>
                        <FormLabel fontSize="sm">Montant de la Taxe</FormLabel>
                        <NumberInput
                            size="sm"
                            min={0}
                            value={montant_de_la_taxe}
                            onChange={(valueString, valueAsNumber) => setMontantDeLaTaxe(valueAsNumber || 0)}
                        >
                            <NumberInputField />
                        </NumberInput>
                        </FormControl>

                        <FormControl id='total_ttc' mb={3} isRequired>
                        <FormLabel fontSize="sm">Total TTC (Calculé)</FormLabel>
                        <NumberInput size="sm" min={0} value={total_ttc.toFixed(2)} isReadOnly>
                            <NumberInputField _readOnly={{ bg: 'gray.100' }} />
                        </NumberInput>
                        </FormControl>

                        <Flex mt={6} justify="space-between">
                        <Button onClick={() => setActiveStep(activeStep - 1)}>
                            Précédent
                        </Button>
                        <Button onClick={handleCalculateAndVerifyTotals} colorScheme="blue">
                            Calculer & Vérifier Totaux
                        </Button>
                        <Button onClick={() => setActiveStep(activeStep + 1)}>
                            Suivant
                        </Button>
                        </Flex>
                    </Box>
                );
            case 4: // Final step for review and submission
                return (
                    <Box>
                        <Heading size="md" mb={4}>Récapitulatif & Validation</Heading>
                        <Box maxHeight="290px" overflowY="auto" p={2} border="1px" borderColor="gray.200" borderRadius="md">
                            <Text mb={2} fontWeight="semibold">Détails de l'opération</Text>
                            <Text>Numéro de clôture: **{numero_de_cloture}**</Text>
                            <Text>Date: **{date}**</Text>
                            <Text>Point de vente: **{point_de_vente}**</Text>
                            <Text>Agent: **{connectedUserPseudo}**</Text>
                            <br/>

                            <Text mb={2} fontWeight="semibold">Types de Transaction</Text>
                            <Text>Billet: **{billet.toFixed(2)}**</Text>
                            <Text>Vente diverses: **{vente_diverses.toFixed(2)}**</Text>
                            <Text>Réajustement: **{reajustement.toFixed(2)}**</Text>
                            <Text>Xbag: **{xbag.toFixed(2)}**</Text>
                            <Text>Pénalité: **{penalite.toFixed(2)}**</Text>
                            <Text>Remboursement: **{remboursement.toFixed(2)}**</Text>
                            <br/>

                            <Text mb={2} fontWeight="semibold">Modes de Paiement</Text>
                            <Text>Espèces: **{especes.toFixed(2)}**</Text>
                            <Text>Mobile Money: **{mobile.toFixed(2)}**</Text>
                            <Text>Carte Bancaire: **{cb.toFixed(2)}**</Text>
                            <Text>Virement Bancaire: **{virement.toFixed(2)}**</Text>
                            <Text>Chèque: **{cheque.toFixed(2)}**</Text>
                            <br/>

                            <Text mb={2} fontWeight="semibold">Totaux Saisis & Calculés</Text>
                            <Text>Total hors taxes (calculé): **{total_hors_taxes.toFixed(2)}**</Text>
                            <Text>Montant de la Taxe (saisi): **{montant_de_la_taxe.toFixed(2)}**</Text>
                            <Text>Total TTC (calculé): **{total_ttc.toFixed(2)}**</Text>
                        </Box>

                        <Flex mt={6} justify="space-between">
                            <Button onClick={() => setActiveStep(activeStep - 1)}>
                                Précédent
                            </Button>
                            <Button colorScheme="cerulean" onClick={handleSubmitTransaction}>
                                Valider la Transaction
                            </Button>
                        </Flex>
                    </Box>
                );
            default:
                return <Text>Contenu de l'étape non défini.</Text>;
        }
    };

    return (
        <div>
            {/* Header section (contains logo, user info, and logout button) */}
            <Flex
                minWidth='max-content'
                alignItems='center'
                gap='2'
                px='10'
                bg='whiteAlpha.300'
                position="relative"
            >
                <Image
                    boxSize='64px'
                    objectFit='contain'
                    src='/Ausg_logo_blanc.png'
                    alt='AUSG logo'
                />
                <Spacer />
                <Text fontWeight="400" fontSize={'sm'} mr={4} color={"antiFlask.800"}>
                    {connectedUserPseudo ? `Connecté en tant que : ${connectedUserPseudo}` : 'Chargement du nom...'}
                </Text>
                <Button colorScheme="red" onClick={handleLogout} size="sm">
                    Déconnexion
                </Button>
            </Flex>

            {/* Main content: Stepper and Form Grid */}
            <Grid
                templateAreas={`"steps form"`}
                gridTemplateColumns="250px 1fr"
                gridTemplateRows="1fr"
                mt={'5'}
                w="1000px"
                minH="80vh"
                bg="antiFlask.50"
                mx='auto'
                borderRadius='2xl'
                boxShadow='lg'
            >
                <GridItem
                    area={'steps'}
                    p='6'
                    borderRight="1px solid lightgray"
                    bg='antiFlask.800'
                    borderTopStartRadius='2xl'
                    borderBottomStartRadius='2xl'
                    color='antiFlask.50'
                >
                    <Text fontSize="xl" fontWeight="semibold" mb={12}>
                        Nouvelle transaction
                    </Text>
                    <Stepper
                        size='md'
                        index={activeStep}
                        orientation='vertical'
                        gap={10}
                        colorScheme="cerulean"
                    >
                        {steps.map((step, index) => (
                            <Step key={index} onClick={() => setActiveStep(index)} cursor={'pointer'}>
                                <StepIndicator>
                                    <StepStatus
                                        complete={<StepIcon />}
                                        incomplete={<StepNumber />}
                                        active={<StepNumber />}
                                    />
                                </StepIndicator>
                                <Box flexShrink='0'>
                                    <StepTitle>{step.title}</StepTitle>
                                </Box>
                                <StepSeparator />
                            </Step>
                        ))}
                    </Stepper>
                </GridItem>

                <GridItem
                    area="form"
                    p='6'
                    pt={12}
                    display='flex'
                    flexDirection='column'
                    gap={4}
                    maxHeight="calc(80vh - 40px)"
                    overflowY="auto"
                >
                    {renderStepContent()}
                </GridItem>
            </Grid>
        </div>
    );
}