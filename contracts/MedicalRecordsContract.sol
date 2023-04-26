// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "hardhat/console.sol";

contract MedicalRecordsContract {
    mapping (bytes32 => string) private userData;
    mapping (address => bool) private isDoctor;
    mapping (address => bool) private isClient;
    mapping (address => bool) private isAdmin;
    mapping (address => bool) private isPharmacist;
    mapping (bytes32 => bool) private isOutdated;

    event RequestDataTransaction(address indexed _from, address indexed _to, string _value);
    event SendResponse(address indexed _from, address indexed _to, string _value);

    constructor() {
        isAdmin[0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266] = true;
    }

    receive() external payable {}
    fallback() external payable {}

    function insertData(bytes32 key, string memory content) public {
        require(isDoctor[msg.sender], "Current account is not a doctor");
        // console.log(userData[key]);
        // console.log(content);

        // require(keccak256(abi.encodePacked(userData[key])) != keccak256(abi.encodePacked(content)), "Data already exists!");

        userData[key] = content;
    }

    function updateData(bytes32 key, string memory content) public {
        require(isPharmacist[msg.sender], "Current account is not a pharmacist");
        userData[key] = content;
    }

    function readData(bytes32 key) public view returns (string memory) {
        return userData[key];
    }

    function outdateData(bytes32 key) public {
        isOutdated[key] = true;
    }

    function isKeyOutdated(bytes32 key) public view returns (bool) {
        return isOutdated[key];
    }

    function requestDataFromClient(address _to, string memory _value) public {
        emit RequestDataTransaction(msg.sender, _to, _value);
    }

    function sendResponse(address _to, string memory _value) public {
        emit SendResponse(msg.sender, _to, _value);
    }

    function insertEntity(string memory _entity , address _who) public {
        if (keccak256(abi.encodePacked(_entity)) == keccak256(abi.encodePacked("doctor"))) {
            isDoctor[_who] = true;
        } else if (keccak256(abi.encodePacked(_entity)) == keccak256(abi.encodePacked("client"))) {
            isClient[_who] = true;
        } else if (keccak256(abi.encodePacked(_entity)) == keccak256(abi.encodePacked("pharmacist"))) {
            isPharmacist[_who] = true;
        }
    }

    function isEntity(address _who) public view returns (string memory) {
        if (isDoctor[_who]) {
            return "doctor";
        } else if (isClient[_who]) {
            return "client";
        } else if (isPharmacist[_who]) {
            return "pharmacist";
        } else if (isAdmin[_who]) {
            return "admin";
        }

        return "";
    }
}
