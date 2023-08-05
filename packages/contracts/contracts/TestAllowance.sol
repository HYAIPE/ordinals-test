// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {LibMap} from "solady/src/utils/LibMap.sol";
import {LibBitmap} from "solady/src/utils/LibBitmap.sol";
import {IAllowance} from "./IAllowance.sol";

contract TestAllowance is IAllowance {
  LibMap.Uint8Map private claimableCountMap;
  mapping(address => string[]) private claims;

  function claim(string[] calldata _claims) public override {
    uint8 claimableAmount = LibMap.get(
      claimableCountMap,
      uint256(uint160(msg.sender))
    );
    string[] storage currentClaims = claims[msg.sender];
    require(
      claimableAmount >= _claims.length + currentClaims.length,
      "TestAllowance: no claimable amount"
    );

    LibMap.set(
      claimableCountMap,
      uint256(uint160(msg.sender)),
      claimableAmount - uint8(_claims.length)
    );
    for (uint8 i = 0; i < _claims.length; i++) {
      claims[msg.sender].push(_claims[i]);
    }
    emit Claimed(msg.sender, _claims, currentClaims.length - _claims.length);
  }

  function allClaimable(
    address _address
  ) public view override returns (string[] memory currentClaims) {
    currentClaims = claims[_address];
  }

  function claimable(
    address _address,
    uint256 index
  ) public view override returns (string memory) {
    return claims[_address][index];
  }

  function setAddressClaimableCount(address _address, uint8 _count) public {
    LibMap.set(claimableCountMap, uint256(uint160(_address)), _count);
  }
}
