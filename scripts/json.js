const fs = require("fs");
/**
 *
 * @param {string} path
 * @param  {string[]} keys
 */
function excludeKeys(obj, keys) {
  for (const key of keys) delete obj[key];
}

/**
 * @param {string} path
 */
function trimRaydiumLiquidityPoolJson(path) {
  const file = JSON.parse(fs.readFileSync(path, "utf-8"));
  const infos = [file.official, file.unOfficial].flat();
  const mints = [];
  for (const info of infos) {
    mints.push({
        id: info.id,
        lpMint: info.lpMint,
        baseMint: info.baseMint,
        quoteMint: info.quoteMint,
    });
  }
  fs.writeFileSync(path, JSON.stringify(mints));
}

function main() {
  trimRaydiumLiquidityPoolJson("./src/assets/raydium.json");
}

main();
