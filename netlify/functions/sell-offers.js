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

    let queryParams = event.queryStringParameters;
    let apiUrl = `https://fiat-api.changelly.com/v1/sell/offers?${serializeQueryParams(queryParams)}`;

    const API_PUBLIC_KEY = process.env.API_PUBLIC_KEY;
    const API_PRIVATE_KEY = process.env.API_PRIVATE_KEY;

    if (!API_PUBLIC_KEY || !API_PRIVATE_KEY) {
      throw new Error('Missing API keys'); 
    }
    
    const apiSigner = new ApiSigner(API_PRIVATE_KEY);
    const message = {};
    const payload = apiUrl + JSON.stringify(message);
    const signature = apiSigner.sign(payload);

    let response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://keytrust.one',
        'X-Api-Key': API_PUBLIC_KEY,
        'X-Api-Signature': signature,
      }
    });

    let responseBody = await response.json();
    console.log('Response status:', response.status);
    console.log('Response body:', responseBody);

    // if (response.status === 200) {
    //   return {
    //     statusCode: response.status,
    //     body: JSON.stringify(responseBody),
    //     headers: {
    //       ...corsHeaders,
    //       'Content-Type': 'application/json',
    //     },
    //   };
    // }

    // Check if the error is related to "Too low in amount"
    if (Array.isArray(responseBody) && responseBody.length > 0) {
      const errorResponse = responseBody[0];
      if (errorResponse.providerCode === 'moonpay' && errorResponse.errorType === 'limits') {

        console.log('catch block', responseBody)
        const minValue = parseFloat(responseBody[0]?.errorDetails[0]?.value);
        const roundedMinValue = Math.ceil(minValue);
        
        // Update the query params with the new min value
        queryParams.amountFrom = roundedMinValue;
        console.log('catch block2', queryParams, roundedMinValue)
        apiUrl = `https://fiat-api.changelly.com/v1/sell/offers?${serializeQueryParams(queryParams)}`;

        const payload = apiUrl + JSON.stringify(message);
        const signature = apiSigner.sign(payload);

        response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Origin': 'https://keytrust.one',
            'X-Api-Key': API_PUBLIC_KEY,
            'X-Api-Signature': signature,
          }
        });

        responseBody = await response.json();
        console.log('Retried response status:', response.status);
        console.log('Retried response body:', responseBody);
      }
    }

    return {
      statusCode: response.status,
      body: JSON.stringify(responseBody),
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
