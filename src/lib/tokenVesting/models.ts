export type ContractInfo = {
  seed: string;
  tx: string;
  createdAt: string;
  mintAddress: string;
  destinationAddress: string;
  schedule: {
    period: string;
    amount: number;
  }[];
};
