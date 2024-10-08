const fetch = require('node-fetch');
const ApiSigner = require('../utils/signer');
const { serializeQueryParams } = require('../utils/serializer');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,x-api-key,x-api-signature',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const blockchains = {
  bitcoin: 'bitcoin',
  cardano: 'cardano',
  ethereum: 'ethereum',
  polygon: 'polygon',
  klaytn: 'klaytn',
  celo: 'celo',
  avaxc: 'avaxc',
  algorand: 'algorand',
  aptos: 'aptos',
  cosmos: 'cosmos',
  bitcoin_cash: 'bitcoin_cash',
  binance_smart_chain: 'binance_smart_chain',
  digibyte: 'digibyte',
  doge: 'doge',
  polkadot: 'polkadot',
  multiversX: 'elrond',
  filecoin: 'filecoin',
  optimism: 'optimism',
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
  ripple: 'ripple',
  tezos: 'tezos',
  zilliqa: 'zilliqa',
};

const blockchainAcronyms = {
  ethereum: 'ERC20',
  cardano: 'ADA',
  algorand: 'ALGO',
  apt: 'APT',
  cosmos: 'ATOM',
  avaxc: 'Avalanche C-Chain',
  bitcoin: 'BTC',
  bitcoin_cash: 'BCH',
  binance_dex: 'BEP-2',
  binance_smart_chain: 'BSC (BEP20)',
  celo: 'CELO',
  digibyte: 'DGB',
  doge: 'DOGE',
  elrond: 'EGLD',
  eos: 'EOS',
  ethereum_classic: 'ETC',
  filecoin: 'FIL',
  flow: 'FLOW',
  hedera: 'HBAR',
  kava: 'KAVA',
  klaytn: 'KLAY',
  litecoin: 'LTC',
  near: 'NEAR',
  nimiq: 'NIM',
  okt: 'OKT',
  optimism: 'OP Mainnet',
  polygon: 'Polygon',
  qtum: 'QTUM',
  roninchain: 'Ronin',
  solana: 'SOL',
  stacks: 'STX',
  sui: 'SUI',
  ton: 'TON',
  tron: 'TRC20',
  vechainthor: 'VET',
  wax: 'WAX',
  ripple: 'XRP',
  stellar: 'XLM',
  nano: 'NANO',
  tezos: 'XTZ',
  zilliqa: 'ZIL',
};

const ChainId = {
  DEFAULT: 0,
  MAINNET: 1,
  OPTIMISM: 10,
  ARBITRUM_ONE: 42161,
  POLYGON: 137,
  CELO: 42220,
  GNOSIS: 100,
  MOONBEAM: 1284,
  BNB: 56,
  AVALANCHE: 43114,
  BASE: 8453,
  ZORA: 7777777,
  ROOTSTOCK: 30,
  BLAST: 81457,
  ZKSYNC: 324
}

const ethNetworkToChainIdMap = {
  // bitcoin: ChainId.DEFAULT,
  ethereum: ChainId.MAINNET,
  optimism: ChainId.OPTIMISM,
  arbitrum: ChainId.ARBITRUM_ONE,
  polygon: ChainId.POLYGON,
  celo: ChainId.CELO,
  gnosis: ChainId.GNOSIS,
  moonbeam: ChainId.MOONBEAM,
  bnb: ChainId.BNB,
  avalanche: ChainId.AVALANCHE,
  base: ChainId.BASE,
  zora: ChainId.ZORA,
  rootstock: ChainId.ROOTSTOCK,
  blast: ChainId.BLAST,
  zksync: ChainId.ZKSYNC,
};

function getSymbolFromTicker(ticker) {
  if (ticker.startsWith('USDT')) {
    return 'USDT';
  } else if (ticker.startsWith('USDC')) {
    return 'USDC';
  } else if (ticker.startsWith('BNB')) {
    return 'BNB';
  } else if (ticker.startsWith('MATIC')) {
    return 'MATIC';
  } else if (ticker.startsWith('NEAR')) {
    return 'NEAR';
  } else {
    return ticker;
  }
}

const handler = async (event) => {
  try {
    console.log('Http method:', event.httpMethod, event.queryStringParameters);

    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: corsHeaders,
      };
    }

    const apiUrl = `https://fiat-api.changelly.com/v1/currencies?type=crypto&${serializeQueryParams(event.queryStringParameters)}`;

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

    // console.log('Response status:', response.status);
    const responseBody = await response.text();
    // console.log('Response body:', responseBody);
    // Process the response
    const supportedTokens = JSON.parse(responseBody)
      .filter(token => token.providers.some(provider => provider.providerCode === 'moonpay'))
      .map(token => {
        const network = token.network.toLowerCase()
        let chainId = 0;
        
        if (network in ethNetworkToChainIdMap) {
          chainId = ethNetworkToChainIdMap[network];  
        }

        const symbol = getSymbolFromTicker(token.ticker);

        return {
          cryptoCurrencyCode: token.ticker,
          displayName: token.name,
          address: '0x0000000000000000000000000000000000000000',
          cryptoCurrencyChain: token.network.charAt(0).toUpperCase() + token.network.slice(1),
          chainId: chainId,
          symbol: `https://images-currency.meld.io/crypto/${symbol}/symbol.png`,
          blockchain: blockchainAcronyms[token.network] || token.network,
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
