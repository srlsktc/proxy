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
    console.log('Http method:', event.httpMethod, event);

    // Handle preflight request
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: corsHeaders,
      };
    }

    // Get the IP from the request, defaulting to the requester's IP if none provided
    const ip = event.headers['X-Forwarded-For'] || event.identity?.sourceIp || event.requestContext.identity?.sourceIp;
    console.log('ip', ip, event)

    if (!ip) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'IP address is required' }),
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      };
    }

    // Send request to IP info API
    const apiUrl = `https://freeipapi.com/api/json/${ip}`;
    const response = await fetch(apiUrl);
    const responseBody = await response.json();

    console.log('Raw Response:', responseBody);

    // Format the response to the needed format
    const formattedResponse = {
      countryCode: responseBody.countryCode,
      displayName: responseBody.countryName,
    };

    console.log('Formatted Response:', JSON.stringify(formattedResponse));
    
    return {
      statusCode: response.status,
      body: JSON.stringify(formattedResponse), // Convert formatted response to a string
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
