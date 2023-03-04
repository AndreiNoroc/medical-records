// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Data {
    // key = data + consultType + CNP
    // string = codificare, mesajul in sine si semnatura doc si adresa doc
    mapping (bytes32 => string) personData;
}
