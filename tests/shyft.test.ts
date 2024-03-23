import "dotenv/config";

import ShyftApi from "../src/lib/shyft";

async function main() {
  const shfyt = new ShyftApi({
    apiKey: process.env.SHYFT_API_KEY!,
  });

  console.log(
    await shfyt.queryLpInfo({
      lpMint: {
        _in: [
          "89ZKE4aoyfLBe2RuV6jM3JGNhaV18Nxh8eNtjRcndBip",
          "ELGZATuAb4CTxMNCV45cbH13oRt5jW7Cdbi6wJAX8J3b",
        ],
      },
    }),
  );
}

main().catch(console.log);
