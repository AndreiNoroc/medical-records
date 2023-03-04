// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./Data.sol";

contract Client is Data {
    function _readData(bytes32 key) private view returns (string memory) {
        return personData[key];
    }
}
