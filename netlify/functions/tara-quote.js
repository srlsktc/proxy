import fetch from "node-fetch";
const handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  const {
    tokenInChainId,
    tokenInAddress,
    tokenOutChainId,
    tokenOutAddress,
    amount,
    type,
    recipient,
  } = event.queryStringParameters;
  const url = `https://1sa7bn1r8f.execute-api.us-east-1.amazonaws.com/prod/quote?tokenInChainId=${tokenInChainId}&tokenInAddress=${tokenInAddress}&tokenOutChainId=${tokenOutChainId}&tokenOutAddress=${tokenOutAddress}&amount=${amount}&type=${type}&recipient=${recipient}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "content-type": "text/plain;charset=UTF-8",
      "x-request-source": "uniswap-web",
    },
  });

  const data = await response.text();

  return {
    statusCode: 200,
    body: data,
  };
};

module.exports = { handler };
