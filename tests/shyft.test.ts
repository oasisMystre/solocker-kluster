import { ShyftSdk, Network } from "@shyft-to/js";

import Repository from "../src/lib/repository";

export async function shyftTest(repository: Repository) {
  // const  shfyt = repository.shyft;
  // const shyft = new ShyftSdk({
  //   apiKey: process.env.SHYFT_API_KEY!,
  //   network: Network.Devnet,
  // });

  console.log(
    await  repository.shyft.queryLpInfo({
      lpMint: {
        _in: [
          "89ZKE4aoyfLBe2RuV6jM3JGNhaV18Nxh8eNtjRcndBip",
          "ELGZATuAb4CTxMNCV45cbH13oRt5jW7Cdbi6wJAX8J3b",
        ],
      },
    })
  );

  // console.log(JSON.stringify(await shyft.wallet.getPortfolio({wallet: "2menEvaDu9VmUawWEjTthGaN9DQ4SSN6ZfXHfZJvf8rn"})))
  // const info = await shyft.wallet.getPortfolio({
  //   tokenAddress: "HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr",
  // });

  // console.log(JSON.stringify(info, undefined, 2))
}
