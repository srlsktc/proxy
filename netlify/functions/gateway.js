const fetch = require('node-fetch');

const handler = async (event) => {
  try {
    // if (event.httpMethod === 'OPTIONS') {
    //   return {
    //     statusCode: 200,
    //     headers: {
    //       'Access-Control-Allow-Origin': '*',
    //       'Access-Control-Allow-Headers': 'Content-Type,x-api-key,x-api-signature',
    //       'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    //     },
    //   };
    // }
    console.log('Http method:', event.httpMethod, event.body);

    const headers = event.headers;
    const body = JSON.parse(event.body); // Parse the body
    const apiUrl = `https://fiat-api.changelly.com/v1/orders`;

    console.log('Received headers:', headers);
    console.log('Received body:', body);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://keytrust.one',
        'x-api-key': headers['x-api-key'] || headers['X-Api-Key'],
        'x-api-signature': headers['x-api-signature'] || headers['X-Api-Signature'],
      },
      body: JSON.stringify(body), // Send the parsed body
    });

    console.log('Response status:', response.status);
    const responseBody = await response.text();
    console.log('Response body:', responseBody);

    return {
      statusCode: response.status,
      body: responseBody,
      headers: {
        'Content-Type': 'application/json',
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.toString() }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }
};

module.exports = { handler };
