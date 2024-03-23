import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { BaseRoute } from ".";
import { serializeBigInt } from "../utils";
import Repository from "../lib/repository";

type Params = {
  wallet: string;
  programId: string;
};

const ParamSchema = {
  params: {
    type: "object",
    properties: {
      wallet: { type: "string" },
      programId: { type: "string" },
    },
  },
};

class TokenVestingRoute extends BaseRoute {
  async getTokenVestingByOwner(
    request: FastifyRequest<{ Querystring: Params }>,
    reply: FastifyReply
  ) {
    const { wallet, programId } = request.query;
    if (!wallet || wallet.trim().length < 32)
      return reply.code(400).send({
        message: "wallet is required in query",
      });

    return serializeBigInt(
      await this.repository.tokenVesting.getContractInfoByOwner(wallet, programId)
    );
  }
}

export const tokenVestingRoutes = (
  fastify: FastifyInstance,
  repository: Repository
) => {
  const route = new TokenVestingRoute(repository);

  fastify.route({
    method: "GET",
    url: "/token-vesting/",
    schema: {
      params: ParamSchema,
    },
    handler: route.getTokenVestingByOwner.bind(route),
  });
};
