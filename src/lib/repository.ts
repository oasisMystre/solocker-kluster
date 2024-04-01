import { type Umi } from "@metaplex-foundation/umi";
import { type Connection } from "@solana/web3.js";

import Token from "./token";
import Metaplex from "./metaplex";
import Raydium from "./raydium";
import ShyftApi from "./shyft";
import { TokenVesting } from "./tokenVesting";

export default class Repository {
  readonly token: Token;
  readonly shyft: ShyftApi;
  readonly raydium: Raydium;
  readonly metaplex: Metaplex;
  readonly tokenVesting: TokenVesting;

  constructor(readonly connection: Connection, readonly umi: Umi) {
    this.token = new Token(this);
    this.metaplex = new Metaplex(this);
    this.raydium = new Raydium(this);
    this.tokenVesting = new TokenVesting(this);
    this.shyft = new ShyftApi({
      apiKey: process.env.SHYFT_API_KEY!,
      network: "mainnet-beta",
    });
  }
}
