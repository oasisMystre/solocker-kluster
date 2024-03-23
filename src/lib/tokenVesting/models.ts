export type ContractInfo = {
  tx: string;
  createdAt: string;
  mintAddress: string;
  destinationAddress: string;
  schedule: {
    period: string;
    amount: number;
  }[];
};
