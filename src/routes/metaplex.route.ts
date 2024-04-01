import { FastifyInstance, FastifyRequest } from "fastify";

import { BaseRoute } from ".";
import { serializeBigInt } from "../utils";
import Repository from "../lib/repository";
import loadNativeToken from "../lib/solana";

type Params = {
  wallet: string;
};

const Schema = {
  params: {
    type: "object",
    properties: {
      wallet: { type: "string" },
    },
  },
};

class MetaplexRoute extends BaseRoute {
  async getDigitalAssetsByByOwner(req: FastifyRequest<{ Params: Params }>) {
    const { wallet } = req.params;
    const { token, metaplex, connection } = this.repository;
    const tokenAccounts = await token.getNormalTokenAccounts(wallet);
    console.log(tokenAccounts);
    const mints = tokenAccounts.map((tokenAccount) =>
      tokenAccount.account.data.parsed.info.mint.toString()
    );

    const digitalAssets = await metaplex.fetchAllMintMetadata(...mints);
    digitalAssets.forEach((digitalAsset: any) => {
      const tokenAccount = tokenAccounts.find(
        (tokenAccount) =>
          tokenAccount.account.data.parsed.info.mint === digitalAsset.mint
      );
      digitalAsset.token = tokenAccount?.account.data.parsed.info;
    });

    digitalAssets.unshift((await loadNativeToken(connection, wallet)) as any);

    return serializeBigInt(digitalAssets);
  }
}

export const metaplexRoutes = function (
  app: FastifyInstance,
  repository: Repository
) {
  const route = new MetaplexRoute(repository);

  app.route({
    method: "GET",
    schema: Schema,
    url: "/metaplex/digital-assets/:wallet/",
    handler: route.getDigitalAssetsByByOwner.bind(route),
  });
};
