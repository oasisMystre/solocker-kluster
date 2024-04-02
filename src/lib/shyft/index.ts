import { GraphQLClient } from "graphql-request";
import { queryLpInfo } from "./queries";
import InjectRepository from "../injection";
import Repository from "../repository";

type ShyftApiParams = {
  apiKey: string;
  network: "devnet" | "mainnet-beta";
};

export default class ShyftApi extends InjectRepository {
  protected client: GraphQLClient;

  constructor(repository: Repository, { apiKey: api_key, network }: ShyftApiParams) {
    super(repository);
    this.client = new GraphQLClient(
      this.buildURLWithQueryParams("https://programs.shyft.to/v0/graphql/", {
        api_key,
        network,
      }),
      {
        method: "POST",
        jsonSerializer: {
          parse: JSON.parse,
          stringify: JSON.stringify,
        },
      }
    );
  }

  async queryLpInfo(where: Parameters<typeof queryLpInfo>[1]) {
    return (await queryLpInfo(this.client, where)).Raydium_LiquidityPoolv4;
  }

  buildURLWithQueryParams(path: string, params: Record<string, any>) {
    const q = new URLSearchParams(params);
    return `${path}?${q.toString()}`;
  }
}
