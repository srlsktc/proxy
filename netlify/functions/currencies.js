const fetch = require('node-fetch');
const ApiSigner = require('../utils/signer');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,x-api-key,x-api-signature',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const networkToChainId = {
  ethereum: "1",
  cardano: "58008", // Placeholder, Cardano's chain id may vary based on the provider
  algorand: "4160", // Algorand uses a different system, no direct chainId
  apt: "1", // Placeholder, Aptos mainnet
  cosmos: "cosmoshub-4", // Cosmos Hub
  avaxc: "43114", // Avalanche C-Chain
  bitcoin: "bitcoin", // Bitcoin doesn't have a typical chainId, use network name
  bitcoin_cash: "bitcoin-cash", // Bitcoin Cash network name
  binance_dex: "bnb", // Binance DEX uses BNB chain
  binance_smart_chain: "56", // Binance Smart Chain mainnet
  celo: "42220", // Celo mainnet
  digibyte: "20", // DigiByte uses a different system
  doge: "dogecoin", // Dogecoin network name
  dot: "polkadot", // Polkadot network uses a different system
  elrond: "elrond-mainnet", // MultiversX (Elrond)
  eos: "eos", // EOS uses network name
  ethereum_classic: "61", // Ethereum Classic mainnet
  filecoin: "314", // Filecoin mainnet
  flow: "flow-mainnet", // Flow network
  hedera: "hedera-mainnet", // Hedera Hashgraph
  klaytn: "8217", // Klaytn mainnet
  litecoin: "litecoin", // Litecoin network
  near: "near-mainnet", // NEAR Protocol mainnet
  nimiq: "nimiq-mainnet", // Nimiq network
  okt: "66", // OKExChain mainnet
  optimism: "10", // Optimism mainnet
  polygon: "137", // Polygon mainnet
  qtum: "qtum-mainnet", // Qtum network
  ripple: "ripple", // Ripple (XRP) network
  solana: "solana-mainnet", // Solana mainnet
  stacks: "stacks-mainnet", // Stacks network
  sui: "sui-mainnet", // Sui mainnet
  tezos: "tezos-mainnet", // Tezos network
  thorchain: "thorchain-mainnet", // ThorChain network
  tron: "tron-mainnet", // Tron network
  vechainthor: "100", // VeChain mainnet
  wax: "wax-mainnet", // WAX network
  zilliqa: "zilliqa-mainnet", // Zilliqa network
};

const handler = async (event) => {
  try {
    console.log('Http method:', event.httpMethod, event.queryStringParameters);

    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: corsHeaders,
      };
    }

    // const apiUrl = 'https://fiat-api.changelly.com/v1/currencies' + (event.queryStringParameters ? `?${event.queryStringParameters}` : '');
    const apiUrl = 'https://fiat-api.changelly.com/v1/currencies?providerCode=moonpay&type=crypto&supportedFlow=buy';

    const API_PUBLIC_KEY = process.env.API_PUBLIC_KEY;
    const API_PRIVATE_KEY = process.env.API_PRIVATE_KEY;

    if (!API_PUBLIC_KEY || !API_PRIVATE_KEY) {
      throw new Error('Missing API keys'); 
    }

    const apiSigner = new ApiSigner(API_PRIVATE_KEY);
    const message = {};
    const payload = apiUrl + JSON.stringify(message);
    const signature = apiSigner.sign(payload);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://keytrust.one',
        'X-Api-Key': API_PUBLIC_KEY,
        'X-Api-Signature': signature,
      }
    });

    console.log('Response status:', response.status);
    // const responseBody = await response.text();
    // console.log('Response body:', responseBody);
    // Process the response
    const supportedTokens = response.map(token => {
      const chainId = networkToChainId[token.network] || null;

      return {
        cryptoCurrencyCode: token.ticker,
        displayName: token.name,
        address: null, // Address can be added if needed
        cryptoCurrencyChain: token.network.charAt(0).toUpperCase() + token.network.slice(1), // Capitalize first letter of network
        chainId: chainId,
        symbol: token.iconUrl
      };
    });

    const result = {
      supportedTokens
    };

    console.log('Processed result:', result);

    return {
      statusCode: 200,
      body: JSON.stringify(result),
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    };
  } catch (error) {
    console.log('catch error', JSON.stringify({ error: error.toString() }));
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.toString() }),
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    };
  }
};

module.exports = { handler };
