import "dotenv/config";

import Repository from "../src/lib/repository";

export async function tokenVesting(repository: Repository) {
  console.log(
    await repository.tokenVesting.getContractInfoByOwner(
      "225uwqkTBvk9P8h7KaQNvmz5mAL4M5cUVMrJfU3zk5xP"
    )
  );
}
