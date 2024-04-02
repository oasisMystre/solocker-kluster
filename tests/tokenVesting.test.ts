import "dotenv/config";

import Repository from "../src/lib/repository";
import {
  getContractInfoByTokenAddress,
  TOKEN_VESTING_PROGRAM_ID,
} from "@solocker/vesting";
import { Connection, PublicKey } from "@solana/web3.js";
import { serializeBigInt } from "../src/utils";

export async function tokenVesting(repository: Repository) {
  console.log(
    await repository.tokenVesting.getLpContractInfoByOwner(
      "E9Sq8hSnH4zSuScu53gykLEFCqrVU9DD1i6FjD4Et5Mf"
    )
  );

  // const contractInfos = await repository.connection.getProgramAccounts(
  //   TOKEN_VESTING_PROGRAM_ID,
  //   {
  //     filters: [
  //       {
  //         memcmp: {
  //           offset: 32
  //         }
  //       }
  //     ]
  //   }
  // );

  // console.log(JSON.stringify(serializeBigInt(contractInfos), undefined, 2))
}
