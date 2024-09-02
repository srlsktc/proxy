import fetch from "node-fetch";
const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  console.log('input data ', event.body)

  const body = JSON.parse(event.body);
  const url = "https://interface.gateway.uniswap.org/v1/graphql";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Origin: "https://app.uniswap.org",
      Referer: "https://app.uniswap.org/",
      Accept: '*/*',
      "Accept-Encoding": "gzip, deflate, br, zstd",
      "Accept-Language": "en-GB,en;q=0.6",
      "Cache-Control": "no-cache",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body),
  });

  const data = await response.text();
  console.log('response', data, body)

  return {
    statusCode: 200,
    body: data,
  };
};

module.exports = { handler };
