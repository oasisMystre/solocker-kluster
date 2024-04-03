import { GraphQLClient } from "graphql-request";

import Repository from "../repository";
import InjectRepository from "../injection";

import { queryLpInfo } from "./queries";
import { LpInfo } from "./models/lpInfo.model";

type ShyftApiParams = {
  apiKey: string;
  network?: "devnet" | "mainnet-beta";
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
        //network,
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
      let notCached: (string | number)[] = where.lpMint._in;

      const caches = await this.repository.redis.getMany<LpInfo>(
        where.lpMint._in.map((_in) => _in.toString())
      );

      for (const cache of caches) {
        if (cache) {
          previousCached.push(cache);
          notCached = notCached.filter((value) => value !== cache.lpMint);
        }
      }

      where.lpMint._in = notCached;
    }

    if (
      where.lpMint &&
      where.lpMint._in &&
      where.lpMint._in.length === previousCached.length
    )
      return previousCached;

    const lpPools = (await queryLpInfo(this.client, where))
      .Raydium_LiquidityPoolv4;
    await Promise.all(
      lpPools.map((lpPool) => this.repository.redis.set(lpPool.lpMint, lpPool))
    );

    return [...previousCached, ...lpPools];
  }

  buildURLWithQueryParams(path: string, params: Record<string, any>) {
    const q = new URLSearchParams(params);
    return `${path}?${q.toString()}`;
  }
}
