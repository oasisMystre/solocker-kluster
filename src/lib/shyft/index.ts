import { GraphQLClient } from "graphql-request";
import { queryLpInfo } from "./queries";

type ShyftApiParams = {
  apiKey: string;
};

export default class ShyftApi {
  protected client: GraphQLClient;

  constructor({ apiKey: api_key }: ShyftApiParams) {
    this.client = new GraphQLClient(
      this.buildURLWithQueryParams("https://programs.shyft.to/v0/graphql/", {
        api_key,
      }),
      {
        method: "POST",
        jsonSerializer: {
          parse: JSON.parse,
          stringify: JSON.stringify,
        },
      },
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
