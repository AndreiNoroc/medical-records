// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

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
        require(isDoctor[msg.sender], "Current account is not a doctor!");
        require(keccak256(abi.encodePacked(userData[key])) == keccak256(abi.encodePacked("")), "Data already exists!");

        userData[key] = content;
    }

    function updateData(bytes32 key, string memory content) public {
        require(isPharmacist[msg.sender], "Current account is not a pharmacist!");
        userData[key] = content;
    }

    function readData(bytes32 key) public view returns (string memory) {
        require(isClient[msg.sender], "Current account is not a client!");
        return userData[key];
    }

    function outdateData(bytes32 key) public {
        require(isPharmacist[msg.sender], "Only pharmacists can outdate a prescription!");
        isOutdated[key] = true;
    }

    function isKeyOutdated(bytes32 key) public view returns (bool) {
        return isOutdated[key];
    }

    function requestDataFromClient(address _to, string memory _value) public {
        require(isDoctor[msg.sender] || isPharmacist[msg.sender], "Only doctors and pharmacists can request data!");
        require(isClient[_to], "Receiver can only be a client!");
        emit RequestDataTransaction(msg.sender, _to, _value);
    }

    function sendResponse(address _to, string memory _value) public {
        require(isClient[msg.sender], "Only clients can send response!");
        require(isDoctor[_to] || isPharmacist[_to], "Receiver can only be a doctor or a pharmacist!");
        emit SendResponse(msg.sender, _to, _value);
    }

    function insertEntity(bytes32 _entity , address _who) public {
        require(isAdmin[msg.sender], "This account is not an admin!");
        require(!isDoctor[_who] && !isClient[_who] && !isPharmacist[_who] && !isAdmin[_who], "Account has already been registered!");

        if (_entity == keccak256(abi.encodePacked("doctor"))) {
            isDoctor[_who] = true;
        } else if (_entity == keccak256(abi.encodePacked("client"))) {
            isClient[_who] = true;
        } else if (_entity == keccak256(abi.encodePacked("pharmacist"))) {
            isPharmacist[_who] = true;
        }
    }

    function isEntity(address _who) public view returns (bytes32) {
        if (isDoctor[_who]) {
            return keccak256(abi.encodePacked("DoctorInterface"));
        } else if (isClient[_who]) {
            return keccak256(abi.encodePacked("ClientInterface"));
        } else if (isPharmacist[_who]) {
            return keccak256(abi.encodePacked("PharmacistInterface"));
        } else if (isAdmin[_who]) {
            return keccak256(abi.encodePacked("AdminInterface"));
        }

        return keccak256(abi.encodePacked(""));
    }
}
