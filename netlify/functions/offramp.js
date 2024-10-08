const fetch = require('node-fetch');
const ApiSigner = require('../utils/signer');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,x-api-key,x-api-signature',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const handler = async (event) => {
  try {
    console.log('Http method:', event.httpMethod, event.body);

    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: corsHeaders,
      };
    }

    const body = event.body;
    const apiUrl = 'https://fiat-api.changelly.com/v1/sell/orders';

    const API_PUBLIC_KEY = process.env.API_PUBLIC_KEY;
    const API_PRIVATE_KEY = process.env.API_PRIVATE_KEY;

    if (!API_PUBLIC_KEY || !API_PRIVATE_KEY) {
      throw new Error('Missing API keys'); 
    }

    const apiSigner = new ApiSigner(API_PRIVATE_KEY);
    const payload = apiUrl + body;
    const signature = apiSigner.sign(payload);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://keytrust.one',
        'X-Api-Key': API_PUBLIC_KEY,
        'X-Api-Signature': signature,
      },
      body,
    });

    const responseBody = await response.text();
    console.log('Response body:', responseBody);

    return {
      statusCode: response.status,
      body: responseBody,
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
