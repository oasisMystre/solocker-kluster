import { GraphQLClient } from "graphql-request";

import Repository from "../repository";
import InjectRepository from "../injection";

import { queryLpInfo } from "./queries";
import { LpInfo } from "./models/lpInfo.model";

type ShyftApiParams = {
  apiKey: string;
  network: "devnet" | "mainnet-beta";
};

export default class ShyftApi extends InjectRepository {
  protected client: GraphQLClient;

  constructor(
    repository: Repository,
    { apiKey: api_key, network }: ShyftApiParams
  ) {
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
    let previousCached: LpInfo[] = [];

    if (where.lpMint && where.lpMint._in) {
      const notCached: (string | number)[] = [];

      previousCached = await Promise.all(
        where.lpMint._in
          .map(async (_in) => {
            const cached = await this.repository.redis.get<LpInfo | null>(
              _in.toString()
            );
            if (!cached) notCached.push(_in);
            return cached;
          })
          .filter((cached) => Boolean(cached)) as unknown as LpInfo[]
      );

      where.lpMint._in = notCached;
    }

    const lpPools = (await queryLpInfo(this.client, where))
      .Raydium_LiquidityPoolv4;
    await Promise.all(
      lpPools.map((lpPool) => this.repository.redis.set(lpPool.lpMint, lpPool))
    );

    return lpPools;
  }

  buildURLWithQueryParams(path: string, params: Record<string, any>) {
    const q = new URLSearchParams(params);
    return `${path}?${q.toString()}`;
  }
}
