import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useSession, signIn, signOut } from "next-auth/react";
import { useConnect, useAccount, useNetwork, useSignMessage } from "wagmi";
import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

import {
  Box,
  Button,
  Stat,
  StatLabel,
  StatHelpText,
  Center,
  Flex,
  Spacer,
  Link,
} from "@chakra-ui/react";

const DiscordCard = () => {
  const { data: session } = useSession();
  if (session) {
    return (
      <Box
        maxW="30rem"
        minW="30rem"
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        m="3rem"
        p="1rem"
      >
        <Center>
          <Stat>
            <StatLabel>Discord connected</StatLabel>
            <StatHelpText>
              Signed in as {session.session.user.name}
            </StatHelpText>
            <StatHelpText>UID {session.token.sub}</StatHelpText>
          </Stat>
          <Button
            colorScheme="blue"
            onClick={() => signOut()}
            m="1rem"
            w="12rem"
          >
            Disconnect Discord
          </Button>
        </Center>
      </Box>
    );
  } else {
    return (
      <Box
        maxW="30rem"
        minW="30rem"
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        m="3rem"
        p="1rem"
      >
        <Center>
          <Stat>
            <StatLabel>Connect Discord</StatLabel>
            <StatHelpText>
              Sign in with Discord to fetch your Discord username.
            </StatHelpText>
          </Stat>
          <Button
            colorScheme="blue"
            onClick={() => signIn()}
            m="1rem"
            w="12rem"
          >
            Connect Discord
          </Button>
        </Center>
      </Box>
    );
  }
};

function truncateString(str, num) {
  if (str.length > num) {
    return str.slice(0, num) + "...";
  } else {
    return str;
  }
}

const WalletCard = () => {
  const [{ data: connectData }, connect] = useConnect();
  const [{ data: accountData }, disconnect] = useAccount();

  if (accountData) {
    return (
      <Box
        maxW="30rem"
        minW="30rem"
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        mx="3rem"
        p="1rem"
      >
        <Center>
          <Stat>
            <StatLabel>Wallet connected</StatLabel>
            <StatHelpText>
              Account: {truncateString(accountData.address, 8)}
            </StatHelpText>
          </Stat>
          <Button
            colorScheme="blue"
            onClick={() => {
              disconnect(connectData.connectors[0]);
            }}
            m="1rem"
            w="12rem"
          >
            Disconnect wallet
          </Button>
        </Center>
      </Box>
    );
  } else {
    return (
      <Box
        maxW="30rem"
        minW="30rem"
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        mx="3rem"
        p="1rem"
      >
        <Center>
          <Stat>
            <StatLabel>Connect wallet</StatLabel>
            <StatHelpText>
              Sign in with web3 wallet to prove ownership.
            </StatHelpText>
          </Stat>
          <Button
            colorScheme="blue"
            onClick={() => {
              connect(connectData.connectors[0]);
            }}
            m="1rem"
            w="12rem"
          >
            Connect wallet
          </Button>
        </Center>
      </Box>
    );
  }
};

const Header = () => {
  return (
    <Box mt="2rem">
      <h1 className={styles.title}>
        Welcome to <a href="https://stakeborgdao.com">StakeborgDAO!</a>
      </h1>
    </Box>
  );
};

const Body = () => {
  return (
    <Flex direction="column" align="center">
      <div className={styles.grid}>
        <DiscordCard />
        <WalletCard />
      </div>
    </Flex>
  );
};

const Footer = () => {
  const markdownGithubPage =
    "![GitHub last commit](https://img.shields.io/github/last-commit/andreivdev/stakeborgdao-web3-roles-bot?style=flat-square)";
  return (
    <Link
      href="https://github.com/andreivdev/stakeborgdao-web3-roles-bot"
      mb="2rem"
    >
      <ReactMarkdown>{markdownGithubPage}</ReactMarkdown>
    </Link>
  );
};

export default function Home() {
  const { data: session } = useSession();
  const [{ data: accountData }, disconnect] = useAccount();

  useEffect(() => {
    if (accountData && session) {
      if (accountData.address && session.token) {
        console.log(`address: ${accountData.address}`);
        console.log(`uid: ${session.token.sub}`);

        let postData = {
          address: accountData.address,
          uid: session.token.sub,
        };

        fetch("/api/role/discord", {
          method: "POST",
          headers: {
            "Content-Type": "application/json; charset=utf8",
          },
          body: JSON.stringify(postData),
        });
      }
    }
  }, [accountData, session]);

  return (
    <Flex
      direction="column"
      align="center"
      alignContent="space-between"
      h="100vh"
    >
      <Header />
      <Spacer />
      <Body />
      <Spacer />
      <Footer />
    </Flex>
  );
}
