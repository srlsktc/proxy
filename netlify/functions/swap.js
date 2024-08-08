const {
  UNISWAP_GRAPH_URL,
  TEST_WALLET_PRIVATE_KEY,
} = require("./uniswap_constants");
const ethers = require("ethers");
const routerAbi = require("./router_abi.js");

const handler = async (req) => {
  const { next_run } = await req.json();

  console.log("Received event! Next invocation at:", next_run);

  const pools = await getPools();

  await Promise.all([
    pools.map(async (pool) => {
      console.log(
        "==================== SETTING UP TX-ES FOR POOL: ",
        pool,
        "===================="
      );

      // Define the amount you want to swap
      const X = ethers.utils.parseEther("1000"); // 1 ETH, for example

      // Calculate 70% of X
      const seventyPercentOfX = X.mul(7).div(10);

      // Create a new instance of the ethers provider
      const provider = new ethers.providers.JsonRpcProvider(
        process.env.INFURA_URL
      );

      // Create a new instance of the ethers wallet
      const wallet = new ethers.Wallet(TEST_WALLET_PRIVATE_KEY, provider);

      // Define the Uniswap router address and ABI
      const uniswapRouterAddress = "0xC5C0A2C28C000788Fcf41ACa8Dc8B5fd4c1838C8"; // Uniswap V2 router address

      // Create a new contract instance
      const uniswap = new ethers.Contract(
        uniswapRouterAddress,
        routerAbi,
        wallet
      );

      // Swap token1 for X amount
      const swap1Tx = await uniswap.swapExactTokensForTokens(
        X,
        0,
        [pool.token1.id, pool.token0.id],
        wallet.address
      );
      const swap1 = await swap1Tx.wait();

      if (swap1.status !== 1) {
        console.log("Swap failed");
        return;
      } else {
        console.log(
          `Swap succeeded for pool: ${pool.id} token: ${pool.token1.id} to token: ${pool.token0.id} amount: ${X}`
        );
      }

      // Swap token0 for 70% of X
      const swap2Tx = await uniswap.swapExactTokensForTokens(
        seventyPercentOfX,
        0,
        [pool.token0.id, pool.token1.id],
        wallet.address
      );
      const swap2 = await swap2Tx.wait();

      if (swap2.status !== 1) {
        console.log("Swap failed");
        return;
      } else {
        console.log(
          `Swap succeeded for pool: ${pool.id} token: ${pool.token0.id} to token: ${pool.token1.id} amount: ${seventyPercentOfX}`
        );
      }
    }),
  ]);

  return new Response("Success", { status: 200 });
};

const config = {
  schedule: "*/3 * * * *",
};

const getPools = async () => {
  const query = `
        {
        pools {
            id
            token0 {
            id
            symbol
            }
            token1 {
            id
            symbol
            }
            liquidity
        }
        }
    `;

  const response = await fetch(UNISWAP_GRAPH_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  const { data } = await response.json();
  return data.pools;
};

module.exports = { handler, config };
