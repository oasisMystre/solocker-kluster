import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";

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
  async getLpInfos(request: FastifyRequest<{ Querystring: Body }>) {
    const { wallet } = request.query;
    return serializeBigInt(
      await this.repository.raydium.fetchTokenAccountsLpPoolInfo(
        await this.repository.token.getLpTokenAccounts(wallet)
      )
    );
  }

  async getLpInfo(
    request: FastifyRequest<{ Querystring: Body; Params: Params }>,
    reply: FastifyReply
  ) {
    const { wallet } = request.query;
    const { mint } = request.params;
    const accountInfos = await (wallet
      ? this.repository.token
          .getTokenAccount(mint, wallet)
          .then((tokenAccount) =>
            tokenAccount ? tokenAccount.tokenAccounts : null
          )
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

    const poolInfos =
      await this.repository.raydium.fetchTokenAccountsLpPoolInfo(accountInfos);

    if (poolInfos.length > 0) return serializeBigInt(poolInfos[0]);

    return reply.code(404).send({
      message: "poolInfo not found for mint " + mint,
    });
  }
}

export const raydiumRoutes = (
  fastify: FastifyInstance,
  repository: Repository
) => {
  const route = new RaydiumRoute(repository);

  fastify.route({
    method: "GET",
    url: "/raydium/lp-infos/",
    schema: {
      querystring: BodySchema,
    },
    handler: route.getLpInfos.bind(route),
  });

  fastify.route({
    method: "GET",
    url: "/raydium/lp-infos/:mint/",
    schema: {
      querystring: BodySchema,
      params: ParamSchema,
    },
    handler: route.getLpInfo.bind(route),
  });
};
