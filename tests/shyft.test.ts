import "dotenv/config";

import ShyftApi from "../src/lib/shyft";
import Repository from "../src/lib/repository";

export async function shyftTest(repository: Repository) {
  const shfyt = repository.shyft;

  console.log(
    await shfyt.queryLpInfo({
      lpMint: {
        _in: [
          "89ZKE4aoyfLBe2RuV6jM3JGNhaV18Nxh8eNtjRcndBip",
          "ELGZATuAb4CTxMNCV45cbH13oRt5jW7Cdbi6wJAX8J3b",
        ],
      },
    })
  );
}
