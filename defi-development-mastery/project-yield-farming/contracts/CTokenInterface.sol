pragma solidity ^0.5.7;

interface CTokenInterface {
  function mint(uint mintAmount) external returns (unit);
  function redeem(uint redeemTokens) external returns (unit);
  function borrow(uint borrowAmount) external returns (unit);
  function repayBorrow(uint repayAmount) external returns (unit);
  function borrowBalanceCurrent(address account) external returns (unit);
  function balanceOf(address account) external view returns (unit);
  function underlying() external view returns(address);
}
