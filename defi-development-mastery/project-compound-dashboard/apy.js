import dotenv from 'dotenv'
dotenv.config();

import Compound from '@compound-finance/compound-js';

const provider = `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`;

const comptroller = Compound.util.getAddress(Compound.Comptroller);
const opf = Compound.util.getAddress(Compound.PriceFeed);

const cTokenDecimals = 8;
const blocksPerDay = 4 * 60 * 24;
const daysPerYear = 365;
const ethMaintissa = Math.pow(10, 18);

async function calculateSupplyApy(cToken) {
  const supplyRatePerBlock = await Compound.eth.read(
    cToken,
    'function supplyRatePerBlock() returns(uint)',
    [],
    { provider },
  );

  return 100 * (Math.pow((supplyRatePerBlock / ethMantissa * blocksPerDay) + 1, daysPerYear - 1) - 1);
}
