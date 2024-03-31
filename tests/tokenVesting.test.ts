import "dotenv/config";

import Repository from "../src/lib/repository";

export async function tokenVesting(repository: Repository) {
  console.log(
    await repository.tokenVesting.getContractInfoByOwner(
      "E9Sq8hSnH4zSuScu53gykLEFCqrVU9DD1i6FjD4Et5Mf"
    )
  );
}
