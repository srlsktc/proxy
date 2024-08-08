import fetch from "node-fetch";
const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const body = JSON.parse(event.body);
  const url = "https://interface.gateway.uniswap.org/v1/graphql";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "text/plain;charset=UTF-8",
      "x-request-source": "uniswap-web",
      Origin: "https://app.uniswap.org",
      Referer: "https://app.uniswap.org/",
    },
    body: JSON.stringify(body),
  });

  const data = await response.text();

  return {
    statusCode: 200,
    body: data,
  };
};

module.exports = { handler };
