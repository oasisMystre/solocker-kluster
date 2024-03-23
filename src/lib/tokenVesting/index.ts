import { TOKEN_VESTING_PROGRAM_ID } from "@bonfida/token-vesting";

import Repository from "../repository";
import { ContractInfo } from "./models";
import InjectRepository from "../injection";
import { extractSeedFromTxData } from "./utils";

export class TokenVesting extends InjectRepository {
  constructor(repository: Repository) {
    super(repository);
  }

  async getContractInfoByOwner(wallet: string, programId?: string) {
    programId = programId ?? TOKEN_VESTING_PROGRAM_ID.toBase58();
    const { raydium, shyft, token, firebase } = this.repository;
    const { docs } = await firebase.firestore
      .collection(wallet)
      .where("tx", "!=", null)
      .get();

    const contractInfos = docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as unknown as ContractInfo)
    );
    const txIds = contractInfos.map(({ tx }) => tx);
    const seeds = await this.decodeSeeds(txIds, programId);

    return Promise.all(
      txIds.map(async (tx, index) => {
        const seed = seeds.at(index);
        if (seed === null) return null;
        const contractInfo = contractInfos.find(
          (contractInfo) => contractInfo.tx === tx
        )!;

        const [lpInfo] = await shyft.queryLpInfo({
          lpMint: {
            _eq: contractInfo.mintAddress,
          },
        });

        const [tokenAccount] = (await token.getTokenAccount(
          contractInfo.mintAddress,
          wallet
        ))!;

        return {
          seed,
          contractInfo,
          lpInfo: await raydium.fetchPoolInfo(lpInfo, tokenAccount),
        };
      })
    );
  }

  async decodeSeeds(txIds: string[], programId: string) {
    const { connection } = this.repository;
    const transactions = await connection.getParsedTransactions(txIds);

    return transactions.map((transaction) => {
      if (transaction == null) return null;
      let instructions = transaction!.transaction.message.instructions;
      instructions = instructions.filter(
        (instruction) => instruction.programId.toString() === programId
      );

      if (instructions.length > 0) {
        const instruction = instructions.at(0)!;
        return "data" in instruction
          ? extractSeedFromTxData(instruction.data)
          : null;
      }

      return null;
    });
  }
}
