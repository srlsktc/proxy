import fetch from "node-fetch";
const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const body = JSON.parse(event.body);
  const url = "https://interface.gateway.uniswap.org/v2/quote";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=UTF-8",
      "X-Request-Source": "uniswap-web",
      "Accept-Encoding": "gzip, deflate, br, zstd",
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
