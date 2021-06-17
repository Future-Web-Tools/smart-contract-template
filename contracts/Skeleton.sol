// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/Context.sol";

import "./ISkeleton.sol";

/**
 * @title Future Web smart contract template
 * @dev Just another smart contract
 */
contract Skeleton is Context, AccessControlEnumerable, Pausable, ISkeleton {
  //////////
  // storage
  //////////

  uint256 public count;
  mapping(address => bool) public members;

  //////////////
  // constructor
  //////////////

  /// @dev Grants `DEFAULT_ADMIN_ROLE` to address that created contract
  // solhint-disable-next-line func-visibility
  constructor() {
    _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
  }

  ////////////
  // modifiers
  ////////////

  modifier onlyAdmin() {
    require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "Not authorized");
    _;
  }

  ////////////////
  // admin actions
  ////////////////

  /// @dev Pause contract
  function pause() public override onlyAdmin {
    _pause();
  }

  /// @dev Unpause contract
  function unpause() public override onlyAdmin {
    _unpause();
  }

  /// @dev Add admin
  function addAdmin(address _admin) public override onlyAdmin {
    grantRole(DEFAULT_ADMIN_ROLE, _admin);
  }

  /// @dev Remove admin
  function removeAdmin(address _admin) public override onlyAdmin {
    require(
      getRoleMemberCount(DEFAULT_ADMIN_ROLE) > 1,
      "Cannot remove last admin"
    );
    revokeRole(DEFAULT_ADMIN_ROLE, _admin);
  }

  /// @dev Quit being admin
  function renounceAdmin() public override onlyAdmin {
    require(
      getRoleMemberCount(DEFAULT_ADMIN_ROLE) > 1,
      "Cannot remove last admin"
    );
    renounceRole(DEFAULT_ADMIN_ROLE, _msgSender());
  }

  /// @dev Withdraw gas tokens
  function withdrawGas(address _to) public override onlyAdmin {
    uint256 _balance = address(this).balance;
    payable(_to).transfer(_balance);
    emit GasWithdrawn(_msgSender(), _to, _balance);
  }

  ///////////////
  // user actions
  ///////////////

  function register() public payable override whenNotPaused {
    members[_msgSender()] = true;
    count++;
    emit NewMember(count, _msgSender());
  }

  ///////////////
  // view actions
  ///////////////

  /// @dev Get admin count
  function adminCount() public view override returns (uint256) {
    return getRoleMemberCount(DEFAULT_ADMIN_ROLE);
  }

  /// @dev Checks if an admin
  function isAdmin(address _admin) public view override returns (bool) {
    return hasRole(DEFAULT_ADMIN_ROLE, _admin);
  }

  /// @dev Returns admin at index
  function getAdmin(uint256 _admin) public view override returns (address) {
    return getRoleMember(DEFAULT_ADMIN_ROLE, _admin);
  }

  /////////////////
  // meta functions
  /////////////////

  // solhint-disable-next-line
  fallback() external payable {}

  receive() external payable {}
}
