const fetch = require('node-fetch');
const ApiSigner = require('../utils/signer');
const { serializeQueryParams } = require('../utils/serializer');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,x-api-key,x-api-signature',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

    const apiUrl = `https://fiat-api.changelly.com/v1/currencies?${serializeQueryParams(event.queryStringParameters)}`;

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
    
    const fiatCurrencies = JSON.parse(responseBody)
      .filter(token => token.providers.some(provider => provider.providerCode === 'moonpay'))
      .map(token => {
        // const symbol = getSymbolFromTicker(token.ticker);

        return {
          fiatCurrencyCode: token.ticker,
          displayName: token.name,
          symbol: token.iconUrl
          // symbol: `https://images-currency.meld.io/crypto/${symbol}/symbol.png`
        };
      });

    const result = {
      fiatCurrencies
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
