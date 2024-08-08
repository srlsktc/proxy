const fetch = require('node-fetch');

const handler = async (event) => {
  try {
    const { headers, body, path } = event;
    console.log('input data', headers, body, path)
    const apiUrl = `https://fiat-api.changelly.com${path}`;
    
    const response = await fetch(apiUrl, {
      method: event.httpMethod,
      headers: {
        ...headers,
        'Content-Type': 'application/json', // Ensure JSON content type
      },
      body: body,
    });
    
    console.log('response', response)
    const responseBody = await response.text();

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
