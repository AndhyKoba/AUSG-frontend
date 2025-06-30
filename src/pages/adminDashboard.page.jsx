// src/pages/AdminDashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Flex, Grid, GridItem, Heading, Text,
    VStack, HStack, Button, Spacer, Link as ChakraLink,
    Table, Thead, Tbody, Tr, Th, Td, TableContainer,
    useToast, SimpleGrid, Image, Divider,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
    FormControl, FormLabel, Input, Select,
    useDisclosure,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    getPaginationRowModel,
    getSortedRowModel,
} from '@tanstack/react-table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell, Legend as RechartsLegend } from 'recharts'; // Ajout pour le PieChart

// Composant pour les cartes de statistiques
const StatCard = ({ title, value }) => (
    <Box bg="white" p={4} borderRadius="lg" shadow="md" textAlign="center">
        <Text fontSize="sm" color="gray.500" fontWeight="semibold">{title}</Text>
        <Text fontSize="2xl" fontWeight="bold" mt={1}>{value}</Text>
    </Box>
);

// Composant pour les boutons de navigation de la sidebar
const NavButton = ({ text, isActive, onClick }) => (
    <Button
        variant={isActive ? 'solid' : 'ghost'}
        colorScheme={isActive ? 'cerulean' : 'whiteAlpha'}
        justifyContent="flex-start"
        w="100%"
        leftIcon={null}
        onClick={onClick}
        py={6}
        fontSize="md"
        fontWeight="normal"
        _hover={{ bg: isActive ? 'cerulean.600' : 'whiteAlpha.300' }}
    >
        {text}
    </Button>
);

export default function AdminDashboard() {
    const navigate = useNavigate();
    const toast = useToast();
    const [connectedUserPseudo, setConnectedUserPseudo] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sorting, setSorting] = useState([]);
    const [activeSection, setActiveSection] = useState('overview');

    // États pour les modales d'agent
    const { isOpen: isAgentModalOpen, onOpen: onAgentModalOpen, onClose: onAgentModalClose } = useDisclosure();
    const [currentAgent, setCurrentAgent] = useState(null);
    const [agentForm, setAgentForm] = useState({ pseudo: '', mot_de_passe: '', role: 'agent' });

    // États pour les modales de transaction
    const { isOpen: isTransactionModalOpen, onOpen: onTransactionModalOpen, onClose: onTransactionModalClose } = useDisclosure();
    const [currentTransaction, setCurrentTransaction] = useState(null);
    const [transactionForm, setTransactionForm] = useState({ 
        numero_de_cloture: '',
        date: '',
        point_de_vente: '',
        agent: '',
        total_hors_taxes: 0,
        montant_de_la_taxe: 0,
        total_ttc: 0,
        billet: 0,
        vente_diverses: 0,
        reajustement: 0,
        xbag: 0,
        penalite: 0,
        remboursement: 0,
        especes: 0,
        mobile: 0,
        cb: 0,
        virement: 0,
        cheque: 0,
    });

    // États pour les rapports
    const [reportType, setReportType] = useState('point_de_vente');
    const [reportPeriod, setReportPeriod] = useState('semaine');
    const [reportResults, setReportResults] = useState([]);
    const [reportLoading, setReportLoading] = useState(false);
    const [weekStart, setWeekStart] = useState('');
    const [month, setMonth] = useState('');

    useEffect(() => {
        const storedPseudo = localStorage.getItem('userPseudo');
        const userRole = localStorage.getItem('userRole');
        if (storedPseudo && userRole === 'admin') {
            setConnectedUserPseudo(storedPseudo);
            fetchTransactions();
            fetchAgents();
        } else {
            navigate('/');
        }
    }, []);

    const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL;

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const response = await axios.get(BACKEND_URL + '/transactions');
            setTransactions(response.data.transactions);
        } catch (error) {
            console.error("Erreur lors de la récupération des transactions:", error);
            toast({
                title: 'Erreur de chargement.',
                description: "Impossible de charger les transactions.",
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchAgents = async () => {
        try {
            const response = await axios.get(BACKEND_URL + '/users/utilisateurs'); 
            setAgents(response.data.users || response.data.utilisateurs);
        } catch (error) {
            console.error("Erreur lors de la récupération des agents:", error);
            toast({
                title: 'Erreur de chargement.',
                description: "Impossible de charger les agents.",
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleLogout = async () => {
        if (connectedUserPseudo) {
            try {
                await axios.post(BACKEND_URL + '/users/deconnexion', { pseudo: connectedUserPseudo });
                toast({ title: 'Déconnexion réussie.', status: 'success', duration: 3000, isClosable: true });
            } catch (error) {
                console.error('Erreur lors de la déconnexion:', error);
                toast({ title: 'Erreur de déconnexion.', description: 'Impossible de déconnecter du serveur.', status: 'error', duration: 5000, isClosable: true });
            }
        }
        localStorage.removeItem('userPseudo');
        localStorage.removeItem('userRole');
        navigate('/');
    };

    const handleCreateAgent = () => {
        setCurrentAgent(null);
        setAgentForm({ pseudo: '', mot_de_passe: '', role: 'agent' });
        onAgentModalOpen();
    };

    const handleEditAgent = (agent) => {
        setCurrentAgent(agent);
        setAgentForm({ pseudo: agent.pseudo, mot_de_passe: '', role: agent.role });
        onAgentModalOpen();
    };

    const handleDeleteAgent = async (agentId) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cet agent ? Cette action est irréversible.")) {
            try {
                await axios.delete(`${BACKEND_URL}/users/${agentId}`);
                toast({ title: 'Agent supprimé.', status: 'success', duration: 3000, isClosable: true });
                fetchAgents();
            } catch (error) {
                console.error("Erreur lors de la suppression de l'agent:", error);
                toast({ title: 'Erreur.', description: error.response?.data?.message || "Impossible de supprimer l'agent.", status: 'error', duration: 5000, isClosable: true });
            }
        }
    };

    const handleAgentFormChange = (e) => {
        setAgentForm({ ...agentForm, [e.target.name]: e.target.value });
    };

    const handleAgentSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (currentAgent) {
                await axios.patch(`${BACKEND_URL}/users/${currentAgent._id}`, agentForm);
                toast({ title: 'Agent mis à jour.', status: 'success', duration: 3000, isClosable: true });
            } else {
                await axios.post(`${BACKEND_URL}/users/inscription`, agentForm);
                toast({ title: 'Agent créé.', status: 'success', duration: 3000, isClosable: true });
            }
            onAgentModalClose();
            fetchAgents();
        } catch (error) {
            console.error("Erreur lors de l'opération sur l'agent:", error);
            toast({ title: 'Erreur.', description: error.response?.data?.message || "Une erreur est survenue lors de l'opération sur l'agent.", status: 'error', duration: 5000, isClosable: true });
        } finally {
            setLoading(false);
        }
    };

    const handleEditTransaction = (transaction) => {
        setCurrentTransaction(transaction);
        setTransactionForm({ 
            ...transaction, 
            date: new Date(transaction.date).toISOString().split('T')[0] 
        }); 
        onTransactionModalOpen();
    };

    const handleDeleteTransaction = async (transactionId) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette transaction ? Cette action est irréversible.")) {
            try {
                await axios.delete(`${BACKEND_URL}/transactions/${transactionId}`);
                toast({ title: 'Transaction supprimée.', status: 'success', duration: 3000, isClosable: true });
                fetchTransactions();
            } catch (error) {
                console.error("Erreur lors de la suppression de la transaction:", error);
                toast({ title: 'Erreur.', description: error.response?.data?.message || "Impossible de supprimer la transaction.", status: 'error', duration: 5000, isClosable: true });
            }
        }
    };

    const handleTransactionFormChange = (e) => {
        const { name, value, type } = e.target;
        setTransactionForm({
            ...transactionForm,
            [name]: type === 'number' ? parseFloat(value) || 0 : value
        });
    };

    const handleTransactionSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            console.log('Données du formulaire:', transactionForm);
            
            if (currentTransaction) {
                const url = `${BACKEND_URL}/transactions/${currentTransaction._id}`;
                console.log('Mettre à jour transaction:', url);
                const response = await axios.patch(url, transactionForm);
                console.log('Réponse du serveur:', response.data);
                toast({ title: 'Transaction mise à jour.', status: 'success', duration: 3000, isClosable: true });
            } else {
                const response = await axios.post(`${BACKEND_URL}/transactions`, transactionForm);
                console.log('Réponse du serveur:', response.data);
                toast({ title: 'Transaction créée.', status: 'success', duration: 3000, isClosable: true });
            }
            onTransactionModalClose();
            fetchTransactions();
        } catch (error) {
            console.error("Erreur détaillée:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                config: error.config
            });
            
            let errorMessage = "Une erreur est survenue lors de l'opération sur la transaction.";
            if (error.response) {
                errorMessage = error.response.data?.message || 
                    (error.response.status === 400 ? "Vérifiez que tous les champs sont correctement remplis." : 
                    error.response.data?.errors?.join("\n") || errorMessage);
            }
            
            toast({ 
                title: 'Erreur.', 
                description: errorMessage,
                status: 'error', 
                duration: 5000, 
                isClosable: true 
            });
        } finally {
            setLoading(false);
        }
    };

    const transactionColumns = useMemo(() => [
        { accessorKey: 'numero_de_cloture', header: 'N° Clôture' },
        { accessorKey: 'date', header: 'Date', cell: info => new Date(info.getValue()).toLocaleDateString() },
        { accessorKey: 'point_de_vente', header: 'Point de Vente' },
        { accessorKey: 'agent', header: 'Agent' },
        { accessorKey: 'total_hors_taxes', header: 'Total HT', cell: info => `${info.getValue()} fcfa` },
        { accessorKey: 'montant_de_la_taxe', header: 'Taxe', cell: info => `${info.getValue()} fcfa` },
        { accessorKey: 'total_ttc', header: 'Total TTC', cell: info => `${info.getValue()} fcfa` },
        { accessorKey: 'especes', header: 'Espèces', cell: info => `${info.getValue() || 0} fcfa` },
        { accessorKey: 'mobile', header: 'Mobile', cell: info => `${info.getValue() || 0} fcfa` },
        { accessorKey: 'cb', header: 'CB', cell: info => `${info.getValue() || 0} fcfa` },
        { accessorKey: 'virement', header: 'Virement', cell: info => `${info.getValue() || 0} fcfa` },
        { accessorKey: 'cheque', header: 'Chèque', cell: info => `${info.getValue() || 0} fcfa` },
        { accessorKey: 'billet', header: 'Billet', cell: info => `${info.getValue() || 0} fcfa` },
        { accessorKey: 'vente_diverses', header: 'Ventes Diverses', cell: info => `${info.getValue() || 0} fcfa` },
        { accessorKey: 'reajustement', header: 'Réajustement', cell: info => `${info.getValue() || 0} fcfa` },
        { accessorKey: 'xbag', header: 'XBag', cell: info => `${info.getValue() || 0} fcfa` },
        { accessorKey: 'penalite', header: 'Pénalité', cell: info => `${info.getValue() || 0} fcfa` },
        { accessorKey: 'remboursement', header: 'Remboursement', cell: info => `${info.getValue() || 0} fcfa` },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <HStack>
                    <Button size="sm" colorScheme="blue" onClick={() => handleEditTransaction(row.original)}>Modifier</Button>
                    <Button size="sm" colorScheme="red" onClick={() => handleDeleteTransaction(row.original._id)}>Supprimer</Button>
                </HStack>
            ),
        },
    ], [transactions]);

    const transactionTable = useReactTable({
        data: transactions,
        columns: transactionColumns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: { sorting },
        onSortingChange: setSorting,
        initialState: { pagination: { pageSize: 10 } },
    });

    const agentColumns = useMemo(() => [
        { accessorKey: 'pseudo', header: 'Pseudo' },
        { accessorKey: 'role', header: 'Rôle' },
        { accessorKey: 'connecté', header: 'Connecté', cell: info => info.getValue() ? 'Oui' : 'Non' },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <HStack>
                    <Button size="sm" colorScheme="blue" onClick={() => handleEditAgent(row.original)}>Modifier</Button>
                    {row.original.pseudo !== connectedUserPseudo && row.original.role !== 'admin' && (
                        <Button size="sm" colorScheme="red" onClick={() => handleDeleteAgent(row.original._id)}>Supprimer</Button>
                    )}
                </HStack>
            ),
            enableSorting: false,
        },
    ], [agents, connectedUserPseudo]);

    const agentTable = useReactTable({
        data: agents,
        columns: agentColumns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: { sorting },
        onSortingChange: setSorting,
        initialState: { pagination: { pageSize: 5 } },
    });

    const chartDataByPointDeVente = useMemo(() => {
        const pvTotals = transactions.reduce((acc, transaction) => {
            acc[transaction.point_de_vente] = (acc[transaction.point_de_vente] || 0) + transaction.total_ttc;
            return acc;
        }, {});
        return Object.keys(pvTotals).map(pv => ({ name: pv, total: pvTotals[pv] }));
    }, [transactions]);

    const chartDataByPaymentMethod = useMemo(() => {
        const paymentTotals = transactions.reduce((acc, t) => {
            acc.especes = (acc.especes || 0) + t.especes;
            acc.mobile = (acc.mobile || 0) + t.mobile;
            acc.cb = (acc.cb || 0) + t.cb;
            acc.virement = (acc.virement || 0) + t.virement;
            acc.cheque = (acc.cheque || 0) + t.cheque;
            return acc;
        }, {});
        return Object.keys(paymentTotals).map(method => ({
            name: method.charAt(0).toUpperCase() + method.slice(1),
            value: paymentTotals[method]
        })).filter(item => item.value > 0);
    }, [transactions]);

    const pieColors = ['#3182ce', '#63b3ed', '#90cdf4', '#2b6cb0', '#4299e1', '#38a169', '#e53e3e', '#d69e2e'];




    const renderMainContent = () => {
        if (loading && activeSection !== 'agents') {
            return (
                <Flex justify="center" align="center" h="100%">
                    <Text>Chargement du tableau de bord...</Text>
                </Flex>
            );
        }

        switch (activeSection) {
            case 'overview':
                return (
                    <Box>
                        <Heading size="lg" mb={6}>Vue d'ensemble</Heading>
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={6}>
                            <StatCard title="Total Transactions" value={transactions.length} />
                            <StatCard title="Total Chiffre d'affaires" value={`${transactions.reduce((sum, t) => sum + t.total_ttc, 0).toFixed(2)} Fcfa`} />
                            <StatCard title="Moyenne par transaction" value={`${(transactions.reduce((sum, t) => sum + t.total_ttc, 0) / transactions.length || 0).toFixed(2)} Fcfa`} />
                        </SimpleGrid>

                        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                            <Box bg="white" p={6} borderRadius="lg" shadow="md">
                                <Heading size="md" mb={4}>Transactions par Point de Vente</Heading>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={chartDataByPointDeVente}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis hide />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="total" fill="#8884d8" name="Total TTC" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                            <Box bg="white" p={6} borderRadius="lg" shadow="md">
                                <Heading size="md" mb={4}>Répartition des Modes de Paiement</Heading>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={chartDataByPaymentMethod}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis hide />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="value" fill="#82ca9d" name="Montant Payé" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </SimpleGrid>
                    </Box>
                );

            case 'transactions':
                return (
                    <Box>
                        <Heading size="lg" mb={6}>Suivi et Modification des Transactions</Heading>
                        <Box bg="white" p={6} borderRadius="lg" shadow="md">
                            <TableContainer>
                                <Table variant="simple" size="sm">
                                    <Thead>
                                        {transactionTable.getHeaderGroups().map(headerGroup => (
                                            <Tr key={headerGroup.id}>
                                                {headerGroup.headers.map(header => (
                                                    <Th
                                                        key={header.id}
                                                        onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                                                        cursor={header.column.getCanSort() ? 'pointer' : 'default'}
                                                    >
                                                        <Flex align="center">
                                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                                            {{ asc: ' ⬆️', desc: ' ⬇️', }[header.column.getIsSorted()] ?? ''}
                                                        </Flex>
                                                    </Th>
                                                ))}
                                            </Tr>
                                        ))}
                                    </Thead>
                                    <Tbody>
                                        {transactionTable.getRowModel().rows.length > 0 ? (
                                            transactionTable.getRowModel().rows.map(row => (
                                                <Tr key={row.id}>
                                                    {row.getVisibleCells().map(cell => (
                                                        <Td key={cell.id}>
                                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                        </Td>
                                                    ))}
                                                </Tr>
                                            ))
                                        ) : (
                                            <Tr><Td colSpan={transactionColumns.length} textAlign="center">Aucune transaction trouvée.</Td></Tr>
                                        )}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                            <HStack mt={4} spacing={2} justify="flex-end">
                                <Button onClick={() => transactionTable.previousPage()} isDisabled={!transactionTable.getCanPreviousPage()} size="sm">Précédent</Button>
                                <Text fontSize="sm">Page {transactionTable.getState().pagination.pageIndex + 1} de {transactionTable.getPageCount()}</Text>
                                <Button onClick={() => transactionTable.nextPage()} isDisabled={!transactionTable.getCanNextPage()} size="sm">Suivant</Button>
                            </HStack>
                        </Box>

                        {/* Transaction Edit Modal */}
                        <Modal isOpen={isTransactionModalOpen} onClose={onTransactionModalClose}>
                            <ModalOverlay />
                            <ModalContent>
                                <ModalHeader>Modifier la Transaction</ModalHeader>
                                <ModalBody>
                                <form onSubmit={handleTransactionSubmit}>
                                    <VStack spacing={4}>
                                        <FormControl isRequired>
                                            <FormLabel>N° Clôture</FormLabel>
                                            <Input name="numero_de_cloture" value={transactionForm.numero_de_cloture} onChange={handleTransactionFormChange} />
                                        </FormControl>
                                        <FormControl isRequired>
                                            <FormLabel>Date</FormLabel>
                                            <Input type="date" name="date" value={transactionForm.date} onChange={handleTransactionFormChange} />
                                        </FormControl>
                                        <FormControl isRequired>
                                            <FormLabel>Point de Vente</FormLabel>
                                            <Input name="point_de_vente" value={transactionForm.point_de_vente} onChange={handleTransactionFormChange} />
                                        </FormControl>
                                        <FormControl isRequired>
                                            <FormLabel>Agent</FormLabel>
                                            <Input name="agent" value={transactionForm.agent} onChange={handleTransactionFormChange} />
                                        </FormControl>
                                        <FormControl isRequired>
                                            <FormLabel>Montant de la Taxe</FormLabel>
                                            <Input type="number" name="montant_de_la_taxe" value={transactionForm.montant_de_la_taxe} onChange={handleTransactionFormChange} />
                                        </FormControl>
                                        <FormControl isRequired>
                                            <FormLabel>Montant de la Taxe</FormLabel>
                                            <Input type="number" name="montant_de_la_taxe" value={transactionForm.montant_de_la_taxe} onChange={handleTransactionFormChange} />
                                        </FormControl>
                                        <FormControl isRequired>
                                            <FormLabel>Total TTC</FormLabel>
                                            <Input type="number" name="total_ttc" value={transactionForm.total_ttc} onChange={handleTransactionFormChange} />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Billet</FormLabel>
                                            <Input type="number" name="billet" value={transactionForm.billet} onChange={handleTransactionFormChange} />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Ventes Diverses</FormLabel>
                                            <Input type="number" name="vente_diverses" value={transactionForm.vente_diverses} onChange={handleTransactionFormChange} />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Réajustement</FormLabel>
                                            <Input type="number" name="reajustement" value={transactionForm.reajustement} onChange={handleTransactionFormChange} />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>XBag</FormLabel>
                                            <Input type="number" name="xbag" value={transactionForm.xbag} onChange={handleTransactionFormChange} />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Pénalité</FormLabel>
                                            <Input type="number" name="penalite" value={transactionForm.penalite} onChange={handleTransactionFormChange} />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Remboursement</FormLabel>
                                            <Input type="number" name="remboursement" value={transactionForm.remboursement} onChange={handleTransactionFormChange} />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Espèces</FormLabel>
                                            <Input type="number" name="especes" value={transactionForm.especes} onChange={handleTransactionFormChange} />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Mobile</FormLabel>
                                            <Input type="number" name="mobile" value={transactionForm.mobile} onChange={handleTransactionFormChange} />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Carte Bancaire</FormLabel>
                                            <Input type="number" name="cb" value={transactionForm.cb} onChange={handleTransactionFormChange} />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Virement</FormLabel>
                                            <Input type="number" name="virement" value={transactionForm.virement} onChange={handleTransactionFormChange} />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Chèque</FormLabel>
                                            <Input type="number" name="cheque" value={transactionForm.cheque} onChange={handleTransactionFormChange} />
                                        </FormControl>
                                        <HStack justify="flex-end" mt={4}>
                                            <Button colorScheme="gray" mr={3} onClick={onTransactionModalClose}>Annuler</Button>
                                            <Button colorScheme="blue" type="submit" isLoading={loading}>Sauvegarder les modifications</Button>
                                        </HStack>
                                    </VStack>
                                </form>
                            </ModalBody>
                            </ModalContent>
                        </Modal>
                    </Box>
                );

            case 'agents':
                return (
                    <Box>
                        <HStack justify="space-between" mb={6}>
                            <Heading size="lg">Gestion des Agents</Heading>
                            <Button colorScheme="green" onClick={handleCreateAgent}>Créer un Agent</Button>
                        </HStack>
                        <Box bg="white" p={6} borderRadius="lg" shadow="md">
                            <TableContainer>
                                <Table variant="simple" size="sm">
                                    <Thead>
                                        {agentTable.getHeaderGroups().map(headerGroup => (
                                            <Tr key={headerGroup.id}>
                                                {headerGroup.headers.map(header => (
                                                    <Th
                                                        key={header.id}
                                                        onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                                                        cursor={header.column.getCanSort() ? 'pointer' : 'default'}
                                                    >
                                                        <Flex align="center">
                                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                                            {{ asc: ' ⬆️', desc: ' ⬇️', }[header.column.getIsSorted()] ?? ''}
                                                        </Flex>
                                                    </Th>
                                                ))}
                                            </Tr>
                                        ))}
                                    </Thead>
                                    <Tbody>
                                        {agentTable.getRowModel().rows.length > 0 ? (
                                            agentTable.getRowModel().rows.map(row => (
                                                <Tr key={row.id}>
                                                    {row.getVisibleCells().map(cell => (
                                                        <Td key={cell.id}>
                                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                        </Td>
                                                    ))}
                                                </Tr>
                                            ))
                                        ) : (
                                            <Tr><Td colSpan={agentColumns.length} textAlign="center">Aucun agent trouvé.</Td></Tr>
                                        )}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                            <HStack mt={4} spacing={2} justify="flex-end">
                                <Button onClick={() => agentTable.previousPage()} isDisabled={!agentTable.getCanPreviousPage()} size="sm">Précédent</Button>
                                <Text fontSize="sm">Page {agentTable.getState().pagination.pageIndex + 1} de {agentTable.getPageCount()}</Text>
                                <Button onClick={() => agentTable.nextPage()} isDisabled={!agentTable.getCanNextPage()} size="sm">Suivant</Button>
                            </HStack>
                        </Box>

                        {/* Agent Create/Edit Modal */}
                        <Modal isOpen={isAgentModalOpen} onClose={onAgentModalClose}>
                            <ModalOverlay />
                            <ModalContent>
                                <ModalHeader>{currentAgent ? 'Modifier l\'Agent' : 'Créer un Nouvel Agent'}</ModalHeader>
                                <ModalBody>
                                    <form onSubmit={handleAgentSubmit}>
                                        <VStack spacing={4}>
                                            <FormControl isRequired>
                                                <FormLabel>Pseudo</FormLabel>
                                                <Input name="pseudo" value={agentForm.pseudo} onChange={handleAgentFormChange} />
                                            </FormControl>
                                            <FormControl isRequired={!currentAgent}>
                                                <FormLabel>Mot de passe</FormLabel>
                                                <Input type="password" name="mot_de_passe" value={agentForm.mot_de_passe} onChange={handleAgentFormChange} placeholder={currentAgent ? "Laisser vide pour ne pas changer" : "Nouveau mot de passe"} />
                                            </FormControl>
                                            <FormControl isRequired>
                                                <FormLabel>Rôle</FormLabel>
                                                <Select name="role" value={agentForm.role} onChange={handleAgentFormChange}>
                                                    <option value="agent">Agent</option>
                                                    <option value="admin">Admin</option>
                                                </Select>
                                            </FormControl>
                                            <HStack justify="flex-end" mt={4}>
                                                <Button colorScheme="gray" mr={3} onClick={onAgentModalClose}>Annuler</Button>
                                                <Button colorScheme="blue" type="submit" isLoading={loading}>{currentAgent ? 'Sauvegarder' : 'Créer'}</Button>
                                            </HStack>
                                        </VStack>
                                    </form>
                                </ModalBody>
                            </ModalContent>
                        </Modal>
                    </Box>
                );
                case 'rapport':
                    const handleReportSearch = () => {
                        setReportLoading(true);
                        let filtered = [...transactions];
        
                        // Filtrage par période
                        if (reportPeriod === 'semaine' && weekStart) {
                            const start = new Date(weekStart);
                            const end = new Date(start);
                            end.setDate(start.getDate() + 6);
                            filtered = filtered.filter(t => {
                                const d = new Date(t.date);
                                return d >= start && d <= end;
                            });
                        } else if (reportPeriod === 'mois' && month) {
                            const [year, m] = month.split('-');
                            const start = new Date(year, m - 1, 1);
                            const end = new Date(year, m, 0, 23, 59, 59, 999);
                            filtered = filtered.filter(t => {
                                const d = new Date(t.date);
                                return d >= start && d <= end;
                            });
                        }
        
                        // Agrégation selon le type de rapport
                        let results = [];
                        if (reportType === 'point_de_vente') {
                            const pvMap = {};
                            filtered.forEach(t => {
                                pvMap[t.point_de_vente] = (pvMap[t.point_de_vente] || 0) + 1;
                            });
                            results = Object.entries(pvMap).map(([pv, count]) => ({
                                label: pv,
                                value: count
                            }));
                        } else if (reportType === 'type_paiement') {
                            const payMap = { especes: 0, mobile: 0, cb: 0, virement: 0, cheque: 0 };
                            filtered.forEach(t => {
                                Object.keys(payMap).forEach(key => {
                                    payMap[key] += t[key] || 0;
                                });
                            });
                            results = Object.entries(payMap).map(([type, total]) => ({
                                label: type.charAt(0).toUpperCase() + type.slice(1),
                                value: total
                            }));
                        }
                        setReportResults(results);
                        setReportLoading(false);
                    };
        
                    // Fonction d'export CSV
                    const handleExportCSV = () => {
                        const csv = [
                            ['Label', 'Valeur'],
                            ...reportResults.map(r => [r.label, r.value])
                        ].map(e => e.join(";")).join("\n");
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'rapport.csv';
                        a.click();
                        URL.revokeObjectURL(url);
                    };
        
                    return (
                        <Box>
                            <Heading size="lg" mb={4}>Rapports</Heading>
                            <HStack spacing={4} mb={4} align="flex-end">
                                <FormControl>
                                    <FormLabel>Type de rapport</FormLabel>
                                    <Select value={reportType} onChange={e => setReportType(e.target.value)}>
                                        <option value="point_de_vente">Nombre de ventes par Point de Vente</option>
                                        <option value="type_paiement">Total par Type de Paiement</option>
                                    </Select>
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Période</FormLabel>
                                    <Select value={reportPeriod} onChange={e => setReportPeriod(e.target.value)}>
                                        <option value="semaine">Semaine</option>
                                        <option value="mois">Mois</option>
                                    </Select>
                                </FormControl>
                                {reportPeriod === 'semaine' && (
                                    <FormControl>
                                        <FormLabel>Début de la semaine</FormLabel>
                                        <Input type="date" value={weekStart} onChange={e => setWeekStart(e.target.value)} />
                                    </FormControl>
                                )}
                                {reportPeriod === 'mois' && (
                                    <FormControl>
                                        <FormLabel>Mois</FormLabel>
                                        <Input type="month" value={month} onChange={e => setMonth(e.target.value)} />
                                    </FormControl>
                                )}
                                <Button
                                    colorScheme="blue"
                                    onClick={handleReportSearch}
                                    isLoading={reportLoading}
                                    isDisabled={
                                        (reportPeriod === 'semaine' && !weekStart) ||
                                        (reportPeriod === 'mois' && !month)
                                    }
                                    size="md"
                                    px={6}
                                >
                                    <SearchIcon boxSize={5} />
                                </Button>
                            </HStack>
                            {/* Résumé période */}
                            {(reportPeriod === 'semaine' && weekStart) && (
                                <Text mb={2} color="gray.600">
                                    Semaine du {new Date(weekStart).toLocaleDateString()}
                                </Text>
                            )}
                            {(reportPeriod === 'mois' && month) && (
                                <Text mb={2} color="gray.600">
                                    Mois de {new Date(month + '-01').toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}
                                </Text>
                            )}
                            <Box bg="white" p={6} borderRadius="lg" shadow="md">
                                <TableContainer>
                                    <Table variant="simple" size="sm">
                                        <Thead>
                                            <Tr>
                                                <Th>{reportType === 'point_de_vente' ? 'Point de Vente' : 'Type de Paiement'}</Th>
                                                <Th isNumeric>{reportType === 'point_de_vente' ? 'Nombre de ventes' : 'Total (Fcfa)'}</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {reportResults.length > 0 ? (
                                                reportResults.map((row, idx) => (
                                                    <Tr key={idx}>
                                                        <Td>{row.label}</Td>
                                                        <Td isNumeric>{row.value}</Td>
                                                    </Tr>
                                                ))
                                            ) : (
                                                <Tr>
                                                    <Td colSpan={2} textAlign="center">Aucun résultat</Td>
                                                </Tr>
                                            )}
                                        </Tbody>
                                    </Table>
                                </TableContainer>
                                {/* Pie Chart */}
                                {reportResults.length > 0 && (
                                    <Box mt={8}>
                                        <Heading size="md" mb={4}>Visualisation graphique</Heading>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie
                                                    data={reportResults}
                                                    dataKey="value"
                                                    nameKey="label"
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={100}
                                                    label
                                                >
                                                    {reportResults.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <RechartsLegend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    );
        }
    };


    return (
        <Grid
            templateAreas={`"sidebar main"`}
            gridTemplateColumns="250px 1fr"
            gridTemplateRows="1fr"
            h="100vh"
            bg="gray.50"
        >
            {/* Sidebar */}
            <GridItem
                area={'sidebar'}
                bg="antiFlask.800"
                color="antiFlask.50"
                p={4}
                shadow="md"
                display="flex"
                flexDirection="column"
            >
                <VStack spacing={6} align="stretch">
                    <Box p={2} mb={4}>
                        <Image
                            src='/Ausg_logo_blanc.png'
                            alt='AUSG Logo'
                            boxSize='80px'
                            objectFit='contain'
                            mx="auto"
                        />
                    </Box>
                    <Divider borderColor="gray.600" />

                    <NavButton text="Vue d'ensemble" isActive={activeSection === 'overview'} onClick={() => setActiveSection('overview')} />
                    <NavButton text="Suivi des Transactions" isActive={activeSection === 'transactions'} onClick={() => setActiveSection('transactions')} />
                    <NavButton text="Gestion des Agents" isActive={activeSection === 'agents'} onClick={() => setActiveSection('agents')} />
                    <NavButton text="Rapports" isActive={activeSection === 'rapport'} onClick={() => setActiveSection('rapport')} />
                </VStack>

                <Spacer />

                <VStack spacing={3} pb={4}>
                    <Text fontSize="sm">Connecté: {connectedUserPseudo}</Text>
                    <Button colorScheme="brand" size="sm" onClick={handleLogout} w="100%">
                        Déconnexion
                    </Button>
                </VStack>
            </GridItem>

            {/* Main Content Area */}
            <GridItem area={'main'} p={8} overflowY="auto">
                {renderMainContent()}
            </GridItem>
        </Grid>
    );
}