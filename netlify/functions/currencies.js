const fetch = require('node-fetch');
const ApiSigner = require('../utils/signer');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,x-api-key,x-api-signature',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const networkToChainId = {
  bitcoin: 'bitcoin',
  cardano: 'cardano',
  algorand: 'algorand',
  aptos: 'apt',
  cosmos: 'cosmos',
  bitcoinCash: 'bitcoin_cash',
  binanceCoin: 'binance_smart_chain',
  digiByte: 'digibyte',
  doge: 'doge',
  polkadot: 'polkadot',
  multiversX: 'elrond',
  filecoin: 'filecoin',
  flow: 'flow',
  hedera: 'hedera',
  kava: 'kava',
  klay: 'klaytn',
  eos: 'eos',
  litecoin: 'litecoin',
  near: 'near',
  nimiq: 'nimiq',
  okt: 'okt',
  qtum: 'qtum',
  solana: 'solana',
  stacks: 'stacks',
  sui: 'sui',
  ton: 'ton',
  tron: 'tron',
  wax: 'wax',
  stellar: 'stellar',
  nano: 'nano',
  xrp: 'ripple',
  tezos: 'tezos',
  zilliqa: 'zilliqa',
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
    const apiUrl = 'https://fiat-api.changelly.com/v1/currencies?type=crypto&supportedFlow=buy';

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
    const responseBody = await response.text();
    console.log('Response body:', responseBody);
    // Process the response
    const supportedTokens = JSON.parse(responseBody).map(token => {
      const chainId = networkToChainId[token.network] || null;

      return {
        cryptoCurrencyCode: token.ticker,
        displayName: token.name,
        address: null, // Address can be added if needed
        cryptoCurrencyChain: token.network.charAt(0).toUpperCase() + token.network.slice(1), // Capitalize first letter of network
        chainId: chainId,
        symbol: `https://images-currency.meld.io/crypto/${token.ticker}/symbol.png`
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
