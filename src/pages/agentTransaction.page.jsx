//src/pages/agentTransactions.page.jsx

import React from 'react';
import { Box, Image } from "@chakra-ui/react";
import AgentForm from '../components/agent.form.jsx';


export default function AgentTransactionPage() {
  return (
    <div>
      <Box
      minH="100vh" 
      bg={'antiFlask.400'}>
        <AgentForm />

      </Box>
    </div>
  )
}
