import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { BaseRoute } from ".";
import { serializeBigInt } from "../utils";
import Repository from "../lib/repository";

type Body = {
  wallet: string;
  programId: string;
};

const Schema = {
  body: {
    type: "object",
    properties: {
      wallet: { type: "string" },
      programId: { type: "string" },
    },
  },
};

class TokenVestingRoute extends BaseRoute {
  async getContractInfoByOwner(req: FastifyRequest<{ Querystring: Body }>) {
    const { wallet, programId } = req.query;

    return serializeBigInt(
      await this.repository.tokenVesting.getContractInfoByOwner(
        wallet,
        programId
      )
    );
  }

  async getLpContractInfoByOwner(req: FastifyRequest<{ Querystring: Body }>) {
    const { wallet, programId } = req.query;

    return serializeBigInt(
      await this.repository.tokenVesting.getLpContractInfoByOwner(
        wallet,
        programId
      )
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
    url: "/token-vesting/contract-infos/",
    schema: {
      querystring: Schema,
    },
    handler: route.getContractInfoByOwner.bind(route),
  });

  fastify.route({
    method: "GET",
    url: "/token-vesting/lp-contract-infos/",
    schema: {
      querystring: Schema,
    },
    handler: route.getLpContractInfoByOwner.bind(route),
  });
};
