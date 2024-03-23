import { gql, GraphQLClient } from "graphql-request";

import { LpInfo } from "../models/lpInfo.model";

type Where = {
  [key in keyof LpInfo]: Partial<{
    _eq: string | number;
    _in: (string | number)[];
  }>;
};

export const queryLpInfo = (client: GraphQLClient, where: Partial<Where>) => {
  const query = gql`
    query Raydium_LiquidityPoolv4($where: Raydium_LiquidityPoolv4_bool_exp) {
      Raydium_LiquidityPoolv4(where: $where) {
        _updatedAt
        amountWaveRatio
        baseDecimal
        baseLotSize
        baseMint
        baseNeedTakePnl
        baseTotalPnl
        baseVault
        depth
        lamports
        lpMint
        lpReserve
        lpVault
        marketId
        marketProgramId
        maxOrder
        maxPriceMultiplier
        minPriceMultiplier
        minSeparateDenominator
        minSeparateNumerator
        minSize
        nonce
        openOrders
        orderbookToInitTime
        owner
        padding
        pnlDenominator
        pnlNumerator
        poolOpenTime
        pubkey
        punishCoinAmount
        punishPcAmount
        quoteDecimal
        quoteLotSize
        quoteMint
        quoteNeedTakePnl
        quoteTotalPnl
        quoteVault
        resetFlag
        state
        status
        swapBase2QuoteFee
        swapBaseInAmount
        swapBaseOutAmount
        swapFeeDenominator
        swapFeeNumerator
        swapQuote2BaseFee
        swapQuoteInAmount
        swapQuoteOutAmount
        systemDecimalValue
        targetOrders
        tradeFeeDenominator
        tradeFeeNumerator
        volMaxCutRatio
        withdrawQueue
      }
    }
  `;

  return client.request<{ Raydium_LiquidityPoolv4: LpInfo[] }>(query, {
    where,
  });
};
