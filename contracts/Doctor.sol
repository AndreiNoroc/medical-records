// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./Data.sol";
import "./DoctorDB.sol";

contract Doctor is Data, DoctorDB {
    function _createData(bytes32 key, string memory content) public {
        personData[key] = content;
    }

    function _readData(bytes32 key) public view returns (string memory) {
        return personData[key];
    }
}
