// App.jsx
import { Button } from "@chakra-ui/react"
import {
  Box,
  Image
} from '@chakra-ui/react'
import "./App.css"
import { Link as RouterLink } from "react-router-dom"

function App() {
  return (
    <Box minH="100vh" display="flex" justifyContent="center" alignItems="center" flexDirection="column" gap="20px" className="gradient">
      <Image
      boxSize='100px'
      objectFit='cover'
      src='src/assets/AUSG logo blanc.png'
      alt='AUSG logo'
      />
      <Box display="flex" flexDirection="column" gap="10px" w="300px" p="40px" bg="white" borderRadius="10px" boxShadow="lg">
        <RouterLink to="/connexion">
          <Button colorScheme="brand" w="100%">Connexion</Button>
        </RouterLink>
        <RouterLink to="/inscription">
          <Button colorScheme="brand" w="100%">Inscription</Button>
        </RouterLink>
      </Box>
    </Box>
  )
}

export default App