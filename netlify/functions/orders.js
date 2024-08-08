import fetch from "node-fetch";
const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { account, hashes } = event.queryStringParameters;

  const body = JSON.parse(event.body);
  const url = "https://interface.gateway.uniswap.org/v2/orders/";

  const response = await fetch(
    url + `swapper=${account}&orderHashes=${hashes}`,
    {
      method: "GET",
      headers: {
        "content-type": "text/plain;charset=UTF-8",
        "x-request-source": "uniswap-web",
        Origin: "https://app.uniswap.org",
        Referer: "https://app.uniswap.org/",
      },
      body: JSON.stringify(body),
    }
  );

  const data = await response.text();

  return {
    statusCode: 200,
    body: data,
  };
};

module.exports = { handler };
