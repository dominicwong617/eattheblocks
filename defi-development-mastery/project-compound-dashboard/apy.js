import dotenv from 'dotenv'
dotenv.config();

import Compound from '@compound-finance/compound-js';

const provider = `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`;

const comptroller = Compound.util.getAddress(Compound.Comptroller);
const opf = Compound.util.getAddress(Compound.PriceFeed);

const cTokenDecimals = 8;
const blocksPerDay = 4 * 60 * 24;
const daysPerYear = 365;
const ethMantissa = Math.pow(10, 18);

async function calculateSupplyApy(cToken, ticker) {
  const supplyRatePerBlock = await Compound.eth.read(
    cToken,
    'function supplyRatePerBlock() returns (uint)',
    [],
    { provider }
  );

  return 100 * (Math.pow((supplyRatePerBlock / ethMantissa * blocksPerDay) + 1, daysPerYear - 1) - 1);
}

async function calculateCompApy(cToken, ticker, underlyingDecimals) {
  let compSpeed = await Compound.eth.read(
    comptroller,
    'function compSpeeds(address cToken) public returns (uint)',
    [ cToken ],
    { provider }
  );

  let compPrice = await Compound.eth.read(
    opf,
    'function price(string memory symbol) external view returns (uint)',
    [ Compound.COMP ],
    { provider }
  );

  let totalSupply = await Compound.eth.read(
    cToken,
    'function totalSupply() returns (uint)',
    [],
    { provider }
  );

  let exchangeRate = await Compound.eth.read(
    cToken,
    'function exchangeRateCurrent() returns (uint)',
    [],
    { provider }
  );

  exchangeRate = +exchangeRate.toString() / ethMantissa;
  compSpeed = compSpeed / 1e18; // COMP has 18 decimal places
  compPrice = compPrice / 1e6;  // price feed is USD price with 6 decimal places
  totalSupply = (+totalSupply.toString() * exchangeRate) / (Math.pow(10, underlyingDecimals));
  const compPerDay = compSpeed * blocksPerDay;

  return 100 * (compPrice * compPerDay / totalSupply) * 365;
}

async function calculateApy(cToken, ticker) {
  const underlyingDecimals = Compound.decimals[cToken.slice(1, 10)];
  const cTokenAddress = Compound.util.getAddress(cToken);
  const [supplyApy, compApy] = await Promise.all([
    calculateSupplyApy(cTokenAddress, ticker),
    calculateCompApy(cTokenAddress, ticker, underlyingDecimals)
  ]);
  return {ticker, supplyApy, compApy};
}

export default calculateApy;
