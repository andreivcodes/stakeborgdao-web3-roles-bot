import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useSession, signIn, signOut } from "next-auth/react";
import { useConnect, useAccount, useNetwork, useSignMessage } from "wagmi";
import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useToast } from "@chakra-ui/react";
import useWindowSize from "react-use/lib/useWindowSize";
import Confetti from "react-confetti";

import {
  Box,
  Button,
  Stat,
  StatLabel,
  StatHelpText,
  Flex,
  Spacer,
  Link,
  Alert,
  AlertIcon,
  AlertDescription,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  Heading,
} from "@chakra-ui/react";

const DiscordCard = () => {
  const { data: session } = useSession();
  if (session) {
    return (
      <Box w="20rem" borderWidth="1px" borderRadius="lg" mb="1rem" p="1rem">
        <Flex direction="column">
          <Stat>
            <StatLabel>Discord connected</StatLabel>
            <StatHelpText>
              Signed in as {session.session.user.name}
            </StatHelpText>
            <StatHelpText>UID {session.token.sub}</StatHelpText>
          </Stat>
          <Button
            alignSelf="center"
            colorScheme="blue"
            onClick={() => signOut()}
            w="12rem"
          >
            Disconnect Discord
          </Button>
        </Flex>
      </Box>
    );
  } else {
    return (
      <Box w="20rem" borderWidth="1px" borderRadius="lg" mb="1rem" p="1rem">
        <Flex direction="column">
          <Stat>
            <StatLabel>Connect Discord</StatLabel>
            <StatHelpText>
              Sign in with Discord to fetch your Discord username.
            </StatHelpText>
          </Stat>
          <Button
            alignSelf="center"
            colorScheme="blue"
            onClick={() => signIn()}
            w="12rem"
          >
            Connect Discord
          </Button>
        </Flex>
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
      <Box w="20rem" borderWidth="1px" borderRadius="lg" p="1rem">
        <Flex direction="column">
          <Stat>
            <StatLabel>Wallet connected</StatLabel>
            <StatHelpText>
              Account: {truncateString(accountData.address, 8)}
            </StatHelpText>
          </Stat>
          <Button
            alignSelf="center"
            colorScheme="blue"
            onClick={() => {
              disconnect(connectData.connectors[0]);
            }}
            w="12rem"
          >
            Disconnect wallet
          </Button>
        </Flex>
      </Box>
    );
  } else {
    return (
      <Box w="20rem" borderWidth="1px" borderRadius="lg" p="1rem">
        <Flex direction="column">
          <Stat>
            <StatLabel>Connect wallet</StatLabel>
            <StatHelpText>
              Sign in with web3 wallet to prove ownership.
            </StatHelpText>
          </Stat>
          <Button
            alignSelf="center"
            colorScheme="blue"
            onClick={() => {
              connect(connectData.connectors[0]);
            }}
            w="12rem"
          >
            Connect wallet
          </Button>
        </Flex>
      </Box>
    );
  }
};

const Header = () => {
  return (
    <Box mt="2rem">
      <Heading align="center">
        Welcome to <a href="https://stakeborgdao.com">StakeborgDAO!</a>
      </Heading>
      <Flex direction="column" align="center" maxW="50rem">
        <Tabs>
          <TabList>
            <Tab>EN</Tab>
            <Tab>RO</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Alert status="warning" variant="left-accent" mt="1rem">
                <AlertIcon />
                <AlertDescription fontSize="small">
                  Disclosure: In order to have the information up to date, the
                  association between your Discord username and your Metamask
                  address is required. If you do not want to associate the main
                  wallet, you can use a new wallet with a minimum of 10
                  STANDARD, to qualify as a Hodler / Staker.
                </AlertDescription>
              </Alert>
            </TabPanel>
            <TabPanel>
              <Alert status="warning" variant="left-accent" mt="1rem">
                <AlertIcon />
                <AlertDescription fontSize="small">
                  Disclosure: Pentru a avea informația up to date, este necesară
                  asocierea dintre username-ul de Discord și adresa de Metamask.
                  În cazul în care nu doriți asocierea wallet-ului principal,
                  puteți folosi un portofel nou cu minim 10 STANDARD, pentru a
                  vă încadra la rolul de Hodler/Staker.
                </AlertDescription>
              </Alert>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Flex>
    </Box>
  );
};

const Body = () => {
  return (
    <Flex direction="column" align="center">
      <DiscordCard />
      <WalletCard />
    </Flex>
  );
};

const Footer = () => {
  const markdownGithubPage =
    "![GitHub last commit](https://img.shields.io/github/last-commit/andreivdev/stakeborgdao-web3-roles-bot?style=flat-square)";
  return (
    <Link
      href="https://github.com/andreivdev/stakeborgdao-web3-roles-bot"
      mt="1rem"
    >
      <ReactMarkdown>{markdownGithubPage}</ReactMarkdown>
    </Link>
  );
};

export default function Home() {
  const { data: session } = useSession();
  const [{ data: accountData }, disconnect] = useAccount();
  const toast = useToast();
  const [progress, setProgress] = useState(0);
  const { width, height } = useWindowSize();

  useEffect(() => {
    if (accountData && session) {
      if (accountData.address && session.token && !progress) {
        let postData = {
          address: accountData.address,
          uid: session.token.sub,
        };
        toast({
          title: "Working on it...",
          status: "info",
          duration: 9000,
          isClosable: true,
        });
        setProgress(1);
        fetch("/api/role/discord", {
          method: "POST",
          headers: {
            "Content-Type": "application/json; charset=utf8",
          },
          body: JSON.stringify(postData),
        }).then((response) => {
          const status = response.status;
          if (status == 200) {
            toast({
              title: "You're all set, check Discord for your new role.",
              status: "success",
              duration: 9000,
              isClosable: true,
            });
            setProgress(2);
          } else
            toast({
              title: "Something bad happened.",
              status: "error",
              duration: 9000,
              isClosable: true,
            });
        });
      }
    }
  }, [accountData, session, toast]);

  return (
    <Box>
      {progress > 1 && <Confetti width={width} height={height} />}
      <Flex
        direction="column"
        align="center"
        alignContent="space-between"
        ml="1rem"
        mr="1rem"
      >
        <Header />
        <Spacer />
        <Body />
        <Spacer />
        <Footer />
      </Flex>
    </Box>
  );
}
