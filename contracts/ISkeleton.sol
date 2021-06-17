// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @title Future Web smart contract template interface
 * @dev Just another smart contract
 */

interface ISkeleton {
  /////////
  // events
  /////////

  event GasWithdrawn(address _caller, address _to, uint256 _balance);
  event NewMember(uint256 count, address _member);

  ////////////////
  // admin actions
  ////////////////

  function pause() external;

  function unpause() external;

  function addAdmin(address _admin) external;

  function removeAdmin(address _admin) external;

  function renounceAdmin() external;

  function withdrawGas(address _to) external;

  ///////////////
  // user actions
  ///////////////

  function register() external payable;

  ///////////////
  // view actions
  ///////////////

  function adminCount() external returns (uint256);

  function isAdmin(address _admin) external returns (bool);

  function getAdmin(uint256 _admin) external returns (address);
}
