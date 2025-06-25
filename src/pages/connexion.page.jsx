import ConnexionForm from "../components/connexion.form.jsx";
import { Box, Image } from "@chakra-ui/react";
import React from "react";

function ConnexionPage() {
    return (
        <Box minH="100vh" display="flex" justifyContent="center" alignItems="center" flexDirection="column" gap="20px" className="gradient">
              <Image
              boxSize='100px'
              objectFit='cover'
              src='/AUSG_logo_blanc.png'
              alt='AUSG logo'>
              </Image>
            <ConnexionForm />
        </Box>
    )
}

export default ConnexionPage