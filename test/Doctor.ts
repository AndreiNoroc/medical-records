import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Doctor", function () {
  async function deployDoctor() {
    const [owner, otherAccount] = await ethers.getSigners();

    const Doctor = await ethers.getContractFactory("Doctor");
    const doctor = await Doctor.deploy();

    const data = {
        'name': 'Andrew Bla',
        'idNo': '5123456789012',
        'day': '10',
        'month': 'January',
        'year': '2012',
        'consultType': 'cardio',
        'description': 'jksbfvsdjbrfvsdjbrvjdabvskdbrvasubvruasbvkrabsrhvbkasbvrkasbrvkabskrvjbsakrvb'
    };

    // Create key
    const preKey = data['idNo'] + data['day'] + data['month'] + data['year'] + data['consultType'];
    const key = ethers.utils.solidityKeccak256(["string"], [preKey]);

    // Create package
    const message = {
        'name': data['name'],
        'description': data['description']
    };

    const sign = await owner.signMessage(JSON.stringify(message));
    const docAdress = owner.address;

    const newPackage = {
        'msg': JSON.stringify(message),
        'sgn': sign,
        'docAdr': docAdress
    }

    // Generate key
    const NodeRSA = require('node-rsa');
    const newKey = new NodeRSA({b: 512});

    // Encrypt data
    const encryptedPack = newKey.encrypt(JSON.stringify(newPackage), 'base64');

    doctor._createData(key, encryptedPack);
    const getPack = await doctor._readData(key);

    // Decrypt data
    const decryptedPack = newKey.decrypt(getPack, 'utf8');

    return { encryptedPack, getPack, newPackage, decryptedPack };
  }

  describe("CheckDataBeforeAndAfter", function () {
    it("Should fail if encrypted data is not stored correctly", async function() {
        const { encryptedPack, getPack, newPackage, decryptedPack} = await loadFixture(deployDoctor);
        expect(getPack).to.equal(
          encryptedPack
        );
    });

    it("Should fail if decrypted data differs from created package", async function() {
        const { encryptedPack, getPack, newPackage, decryptedPack} = await loadFixture(deployDoctor);
        expect(decryptedPack).to.equal(
          JSON.stringify(newPackage)
        );
    });
  });
});
