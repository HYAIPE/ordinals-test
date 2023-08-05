// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

abstract contract IAllowance {
  event Claimed(
    address indexed _address,
    string[] _claims,
    uint256 _startIndex
  );

  function claim(string[] calldata claims) public virtual;

  function allClaimable(
    address _address
  ) public view virtual returns (string[] memory);

  function claimable(
    address _address,
    uint256 index
  ) public view virtual returns (string memory);
}
