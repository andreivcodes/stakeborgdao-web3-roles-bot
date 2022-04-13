import "../styles/globals.css";
import { SessionProvider } from "next-auth/react";
import { Provider, chain, defaultChains } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { ChakraProvider } from "@chakra-ui/react";

// Chains for connectors to support
const chains = defaultChains;

// Set up connectors
const connectors = ({ chainId }) => {
  return [
    new InjectedConnector({
      chains,
      options: { shimDisconnect: true },
    }),
  ];
};

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <ChakraProvider>
      <Provider autoConnect connectors={connectors}>
        <SessionProvider session={session}>
          <Component {...pageProps} />
        </SessionProvider>
      </Provider>
    </ChakraProvider>
  );
}

export default MyApp;
