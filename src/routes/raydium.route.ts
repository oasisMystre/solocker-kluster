import Fastify, { FastifyRequest, FastifyReply } from "fastify";

import { BaseRoute } from ".";
import { serializeBigInt } from "../utils";

import Repository from "../lib/repository";

type Params = {
  mint: string;
};

type Body = {
  wallet: string;
};

const BodySchema = {
  body: {
    type: "object",
    properties: {
      wallet: { type: "string" },
    },
  },
};

const ParamSchema = {
  params: {
    type: "object",
    properties: {
      mintAddress: { type: "string" },
    },
  },
};

class RaydiumRoute extends BaseRoute {
  async getLpInfos(request: FastifyRequest<{ Body: Body }>) {
    const { wallet } = request.body;
    return serializeBigInt(
      await this.repository.raydium.fetchAllPoolInfos(
        await this.repository.token.getTokenAccounts(wallet)
      )
    );
  }

  async getLpInfo(
    request: FastifyRequest<{ Body: Body; Params: Params }>,
    reply: FastifyReply
  ) {
    const { wallet } = request.body;
    const { mint } = request.params;
    const accountInfos = await (wallet
      ? this.repository.token.getTokenAccount(mint, wallet)
      : this.repository.token.getAccountInfo(mint));

    if (!accountInfos || accountInfos.length === 0)
      return reply.code(404).send({
        message: "account info not found for " + mint,
      });

    const lpInfos = await this.repository.shyft.queryLpInfo({
      lpMint: { _eq: mint },
    });

    if (lpInfos.length === 0)
      return reply.code(404).send({
        message: mint + " is not a lp mint",
      });

    const [lpInfo] = lpInfos;
    const [accountInfo] = accountInfos;

    const poolInfo = await this.repository.raydium.fetchPoolInfo(
      lpInfo,
      accountInfo
    );

    if (poolInfo) return serializeBigInt(poolInfo);
    return reply.code(404).send({
      message: "poolInfo not found for mint " + mint,
    });
  }
}

export const raydiumRoutes = (
  fastify: ReturnType<typeof Fastify>,
  repository: Repository
) => {
  const route = new RaydiumRoute(repository);

  fastify.route({
    method: "POST",
    url: "/raydium/lp-infos/",
    schema: {
      body: BodySchema,
    },
    handler: route.getLpInfos.bind(route),
  });

  fastify.route({
    method: "POST",
    url: "/raydium/lp-infos/:mint/",
    schema: {
      body: BodySchema,
      params: ParamSchema,
    },
    handler: route.getLpInfo.bind(route),
  });
};
