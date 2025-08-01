import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("MedicalRecords", function () {
    async function deployContractAndSetVariables() {
        const [owner, otherAccount, secondAccount, pharmacistAccount] = await ethers.getSigners();
        const MedicalRecords = await ethers.getContractFactory("MedicalRecordsContract");
        const medicalRecords = await MedicalRecords.deploy();
        return { medicalRecords, owner, otherAccount, secondAccount, pharmacistAccount };
    }

    async function preparePackageForInsertion() {
        const { medicalRecords, owner, otherAccount, secondAccount, pharmacistAccount } = await loadFixture(deployContractAndSetVariables);

        await medicalRecords.insertEntity(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("doctor")), otherAccount.address);                
        expect(await medicalRecords.isEntity(otherAccount.address)).to.equal(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("DoctorInterface")));

        await medicalRecords.insertEntity(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("client")), secondAccount.address);                
        expect(await medicalRecords.isEntity(secondAccount.address)).to.equal(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ClientInterface")));

        await medicalRecords.insertEntity(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("pharmacist")), pharmacistAccount.address);                
        expect(await medicalRecords.isEntity(pharmacistAccount.address)).to.equal(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("PharmacistInterface")));

        const preKey = "123245678910" + "11/05/2023" + "hearth control";
        const key = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(["string"], [preKey]));

        const message = {
            'name': "John Smith",
            'description': "heart attack",
            'drugsList': "paracetamol, nurofen"
        };

        const stringifyMessage = JSON.stringify(message);
        const signature = otherAccount.signMessage(stringifyMessage);

        const newPackage = {
            'message': stringifyMessage,
            'sign': signature,
            'docAddress': otherAccount.address,
            'pharmacistAddress': 'none'
        };

        const {
            generateKeyPairSync
        } = await import('node:crypto');

        const {
            publicKey,
            privateKey,
        } = generateKeyPairSync('rsa', {
            modulusLength: 10240,
        });

        const readyPackage = Buffer.from(JSON.stringify(newPackage), 'base64');
    
        return { publicKey, privateKey, key, readyPackage };
    }

    it("should deploy and set owner value correctly", async function() {
        const { medicalRecords, owner, otherAccount } = await loadFixture(deployContractAndSetVariables);
        expect(medicalRecords.address).to.equal("0x5FbDB2315678afecb367f032d93F642f64180aa3");
        expect(owner.address).to.equal("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
    });

    describe("Admin", function () {
        it("should set admin entity address correctly", async function() {
            const { medicalRecords, owner, otherAccount } = await loadFixture(deployContractAndSetVariables);
            expect(await medicalRecords.isEntity(owner.address)).to.equal(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("AdminInterface")));
        });

        it("should show error message when other entity than an admin try to insert entities", async function() {
            try {
                const { medicalRecords, owner, otherAccount, secondAccount } = await loadFixture(deployContractAndSetVariables);

                await medicalRecords.connect(otherAccount).insertEntity(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("client")), secondAccount.address);
                expect.fail("Expected an error to be thrown!");
            } catch(error: any) {
                expect(error.message).to.equal("VM Exception while processing transaction: reverted with reason string 'This account is not an admin!'");
            }
        });

        it("should show error message when try to insert an entity address twice", async function() {
            try {
                const { medicalRecords, owner, otherAccount } = await loadFixture(deployContractAndSetVariables);

                await medicalRecords.insertEntity(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("doctor")), otherAccount.address);                
                expect(await medicalRecords.isEntity(otherAccount.address)).to.equal(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("DoctorInterface")));

                await medicalRecords.insertEntity(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("client")), otherAccount.address);
                expect.fail("Expected an error to be thrown!");
            } catch(error: any) {
                expect(error.message).to.equal("VM Exception while processing transaction: reverted with reason string 'Account has already been registered!'");
            }
        });

        it("should show error message when admin try to insert himself in a category", async function() {
            try {
                const { medicalRecords, owner } = await loadFixture(deployContractAndSetVariables);
                await medicalRecords.insertEntity(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("pharmacist")), owner.address);
                expect.fail("Expected an error to be thrown!");
            } catch(error: any) {
                expect(error.message).to.equal("VM Exception while processing transaction: reverted with reason string 'Account has already been registered!'");
            }
        });
    });

    describe("Doctor", async function () {
        it("should insert, get and check data", async function() {
            const { medicalRecords, owner, otherAccount, secondAccount } = await loadFixture(deployContractAndSetVariables);
            const { publicKey, privateKey, key, readyPackage } = await loadFixture(preparePackageForInsertion);
            
            const {
                publicEncrypt, privateDecrypt
            } = await import('node:crypto');

            const encryptedPack: any = publicEncrypt(publicKey, readyPackage);
            await medicalRecords.connect(otherAccount).insertData(key, encryptedPack.toString('base64'));

            const data: any = await medicalRecords.connect(secondAccount).readData(key);
            const decryptedPack: any = privateDecrypt(privateKey, Buffer.from(data, 'base64'));

            expect(decryptedPack.toString('base64')).to.equal(readyPackage.toString('base64'));
        });

        it("should show error message when other entity than doctor try to insert data", async function () {
            try {
                const { medicalRecords, owner, otherAccount, secondAccount } = await loadFixture(deployContractAndSetVariables);
                const { publicKey, privateKey, key, readyPackage } = await loadFixture(preparePackageForInsertion);

                const {
                    publicEncrypt
                } = await import('node:crypto');

                const encryptedPack: any = publicEncrypt(publicKey, readyPackage);
                await medicalRecords.connect(secondAccount).insertData(key, encryptedPack.toString('base64'));
                expect.fail("Expected an error to be thrown!");
            } catch(error: any) {
                expect(error.message).to.equal("VM Exception while processing transaction: reverted with reason string 'Current account is not a doctor!'");
            }
        });

        it("should show error if a doctor try to insert same package ", async function() {
            try {
                const { medicalRecords, owner, otherAccount, secondAccount } = await loadFixture(deployContractAndSetVariables);
                const { publicKey, privateKey, key, readyPackage } = await loadFixture(preparePackageForInsertion);

                const {
                    publicEncrypt, privateDecrypt
                } = await import('node:crypto');

                const encryptedPack: any = publicEncrypt(publicKey, readyPackage);
                await medicalRecords.connect(otherAccount).insertData(key, encryptedPack.toString('base64'));

                const data: any = await medicalRecords.connect(secondAccount).readData(key);
                const decryptedPack: any = privateDecrypt(privateKey, Buffer.from(data, 'base64'));
                expect(decryptedPack.toString('base64')).to.equal(readyPackage.toString('base64'));

                await medicalRecords.connect(otherAccount).insertData(key, encryptedPack.toString('base64'));
                expect.fail("Expected an error to be thrown!");
            } catch(error: any) {
                expect(error.message).to.equal("VM Exception while processing transaction: reverted with reason string 'Data already exists!'");
            }
        });
    });

    describe("Client", function () {
        it("should get data and check it", async function() {
            const { medicalRecords, owner, otherAccount, secondAccount } = await loadFixture(deployContractAndSetVariables);
            const { publicKey, privateKey, key, readyPackage } = await loadFixture(preparePackageForInsertion);
            
            const {
                publicEncrypt, privateDecrypt
            } = await import('node:crypto');

            const encryptedPack: any = publicEncrypt(publicKey, readyPackage);
            await medicalRecords.connect(otherAccount).insertData(key, encryptedPack.toString('base64'));

            const data: any = await medicalRecords.connect(secondAccount).readData(key);
            const decryptedPack: any = privateDecrypt(privateKey, Buffer.from(data, 'base64'));

            expect(decryptedPack.toString('base64')).to.equal(readyPackage.toString('base64'));
        });

        it("should show error if other entity than a client try to get data", async function () {
            try {
                const { medicalRecords, owner, otherAccount, secondAccount } = await loadFixture(deployContractAndSetVariables);
                const { publicKey, privateKey, key, readyPackage } = await loadFixture(preparePackageForInsertion);
                
                const {
                    publicEncrypt
                } = await import('node:crypto');

                const encryptedPack: any = publicEncrypt(publicKey, readyPackage);
                await medicalRecords.connect(otherAccount).insertData(key, encryptedPack.toString('base64'));
                await medicalRecords.connect(otherAccount).readData(key);
                expect.fail("Expected an error to be thrown!");
            } catch(error: any) {
                expect(error.reason).to.equal("Current account is not a client!");
            }
        });

        it("should listen to the RequestDataTransaction event", async function () {
            const { medicalRecords, owner, otherAccount, secondAccount } = await loadFixture(deployContractAndSetVariables);
            const { publicKey, privateKey, key, readyPackage } = await loadFixture(preparePackageForInsertion);
            
            const {
                publicEncrypt
            } = await import('node:crypto');

            const encryptedPack: any = publicEncrypt(publicKey, Buffer.from("Data request", 'base64'));
            const tx = await medicalRecords.connect(otherAccount).requestDataFromClient(secondAccount.address, encryptedPack.toString());

            let emittedEvents:any = [];
            const receipt:any = await tx.wait()
            receipt.events.forEach((ev: { event: any; args: any; }) => {
                if (ev.event) {
                    emittedEvents.push({
                        name: ev.event,
                        args: ev.args
                    });
                }
            });

            expect(emittedEvents[0].name).to.equal('RequestDataTransaction');
            expect(emittedEvents[0].args._from).to.equal(otherAccount.address);
            expect(emittedEvents[0].args._to).to.equal(secondAccount.address);
            expect(emittedEvents[0].args._value).to.equal(encryptedPack.toString());
        });

        it("should show error when a client account try to make a request (RequestDataTransaction event) for data", async function () {
            try {
                const { medicalRecords, owner, otherAccount, secondAccount } = await loadFixture(deployContractAndSetVariables);
                const { publicKey, privateKey, key, readyPackage } = await loadFixture(preparePackageForInsertion);
                
                const {
                    publicEncrypt
                } = await import('node:crypto');

                const encryptedPack: any = publicEncrypt(publicKey, Buffer.from("Data request", 'base64'));
                await medicalRecords.connect(secondAccount).requestDataFromClient(secondAccount.address, encryptedPack.toString());
                expect.fail("Expected an error to be thrown!");
            } catch (error: any) {
                expect(error.message).to.equal("VM Exception while processing transaction: reverted with reason string 'Only doctors and pharmacists can request data!'");
            }
        });

        it("should show error when the receiver of the RequestDataTransaction event is an entity different from a client", async function () {
            try {
                const { medicalRecords, owner, otherAccount, secondAccount, pharmacistAccount } = await loadFixture(deployContractAndSetVariables);
                const { publicKey, privateKey, key, readyPackage } = await loadFixture(preparePackageForInsertion);
                
                const {
                    publicEncrypt
                } = await import('node:crypto');

                const encryptedPack: any = publicEncrypt(publicKey, Buffer.from("Data request", 'base64'));
                await medicalRecords.connect(otherAccount).requestDataFromClient(pharmacistAccount.address, encryptedPack.toString());
                expect.fail("Expected an error to be thrown!");
            } catch (error: any) {
                expect(error.message).to.equal("VM Exception while processing transaction: reverted with reason string 'Receiver can only be a client!'");
            }
        });
    });

    describe("Pharmacist", function () {
        it("should update data succesfully", async function () {
            const { medicalRecords, owner, otherAccount, secondAccount, pharmacistAccount } = await loadFixture(deployContractAndSetVariables);
            const { publicKey, privateKey, key, readyPackage } = await loadFixture(preparePackageForInsertion);
            
            const {
                publicEncrypt, privateDecrypt
            } = await import('node:crypto');

            const encryptedPack: any = publicEncrypt(publicKey, readyPackage);
            await medicalRecords.connect(otherAccount).insertData(key, encryptedPack.toString('base64'));

            const data: any = await medicalRecords.connect(secondAccount).readData(key);
            const decryptedPack: any = privateDecrypt(privateKey, Buffer.from(data, 'base64'));
            expect(decryptedPack.toString('base64')).to.equal(readyPackage.toString('base64'));
    
            const message = {
                'name': "John Smith",
                'description': "heart attack",
                'drugsList': "paracetamolyes, nurofenyes"
            };
    
            const stringifyMessage = JSON.stringify(message);
            const signature = pharmacistAccount.signMessage(stringifyMessage);
    
            const newPackage = {
                'message': stringifyMessage,
                'sign': signature,
                'docAddress': otherAccount.address,
                'pharmacistAddress': pharmacistAccount.address
            };

            const newReadyPackage = Buffer.from(JSON.stringify(newPackage), 'base64');
            const newEncryptedPack: any = publicEncrypt(publicKey, newReadyPackage);
            await medicalRecords.connect(pharmacistAccount).updateData(key, newEncryptedPack.toString('base64'));

            const newData: any = await medicalRecords.connect(secondAccount).readData(key);
            const newDecryptedPack: any = privateDecrypt(privateKey, Buffer.from(newData, 'base64'));
            expect(newDecryptedPack.toString('base64')).to.equal(newReadyPackage.toString('base64'));
        });

        it("should show error if other entity than a pharmacist try to update data", async function() {
            try {
                const { medicalRecords, owner, otherAccount, secondAccount, pharmacistAccount } = await loadFixture(deployContractAndSetVariables);
                const { publicKey, privateKey, key, readyPackage } = await loadFixture(preparePackageForInsertion);
                
                const {
                    publicEncrypt, privateDecrypt
                } = await import('node:crypto');

                const encryptedPack: any = publicEncrypt(publicKey, readyPackage);
                await medicalRecords.connect(otherAccount).insertData(key, encryptedPack.toString('base64'));

                const data: any = await medicalRecords.connect(secondAccount).readData(key);
                const decryptedPack: any = privateDecrypt(privateKey, Buffer.from(data, 'base64'));
                expect(decryptedPack.toString('base64')).to.equal(readyPackage.toString('base64'));
        
                const message = {
                    'name': "John Smith",
                    'description': "heart attack",
                    'drugsList': "paracetamolyes, nurofenyes"
                };
        
                const stringifyMessage = JSON.stringify(message);
                const signature = pharmacistAccount.signMessage(stringifyMessage);
        
                const newPackage = {
                    'message': stringifyMessage,
                    'sign': signature,
                    'docAddress': otherAccount.address,
                    'pharmacistAddress': pharmacistAccount.address
                };

                const newReadyPackage = Buffer.from(JSON.stringify(newPackage), 'base64');
                const newEncryptedPack: any = publicEncrypt(publicKey, newReadyPackage);
                await medicalRecords.connect(secondAccount).updateData(key, newEncryptedPack.toString('base64'));
                expect.fail("Expected an error to be thrown!");
            } catch(error: any) {
                expect(error.message).to.equal("VM Exception while processing transaction: reverted with reason string 'Current account is not a pharmacist!'");
            }
        });

        it("should outdate receipt successfully", async function () {
            const { medicalRecords, owner, otherAccount, secondAccount, pharmacistAccount } = await loadFixture(deployContractAndSetVariables);
            const { publicKey, privateKey, key, readyPackage } = await loadFixture(preparePackageForInsertion);

            await medicalRecords.connect(pharmacistAccount).outdateData(key);
            const data = await medicalRecords.connect(pharmacistAccount).isKeyOutdated(key);
            expect(data).to.equal(true);
        });

        it("should show error if anybody else than a pharmacist try to outdate a prescription", async function () {
            try {
            const { medicalRecords, owner, otherAccount, secondAccount, pharmacistAccount } = await loadFixture(deployContractAndSetVariables);
            const { publicKey, privateKey, key, readyPackage } = await loadFixture(preparePackageForInsertion);

            await medicalRecords.connect(otherAccount).outdateData(key);
            expect.fail("Expected an error to be thrown!");
            } catch(error: any) {
                expect(error.message).to.equal("VM Exception while processing transaction: reverted with reason string 'Only pharmacists can outdate a prescription!'");
            }
        });

        it("listen to the SendResponse event", async function () {
            const { medicalRecords, owner, otherAccount, secondAccount, pharmacistAccount } = await loadFixture(deployContractAndSetVariables);
            const { publicKey, privateKey, key, readyPackage } = await loadFixture(preparePackageForInsertion);
            
            const {
                publicEncrypt
            } = await import('node:crypto');

            const encryptedPack: any = publicEncrypt(publicKey, Buffer.from("Data response", 'base64'));
            const tx = await medicalRecords.connect(secondAccount).sendResponse(pharmacistAccount.address, encryptedPack.toString());

            let emittedEvents:any = [];
            const receipt:any = await tx.wait()
            receipt.events.forEach((ev: { event: any; args: any; }) => {
                if (ev.event) {
                    emittedEvents.push({
                        name: ev.event,
                        args: ev.args
                    });
                }
            });

            expect(emittedEvents[0].name).to.equal('SendResponse');
            expect(emittedEvents[0].args._from).to.equal(secondAccount.address);
            expect(emittedEvents[0].args._to).to.equal(pharmacistAccount.address);
            expect(emittedEvents[0].args._value).to.equal(encryptedPack.toString());
        });

        it("should show error when the sender of the response is an entity different from a client", async function() {
            try {
                const { medicalRecords, owner, otherAccount, secondAccount, pharmacistAccount } = await loadFixture(deployContractAndSetVariables);
                const { publicKey, privateKey, key, readyPackage } = await loadFixture(preparePackageForInsertion);
                
                const {
                    publicEncrypt
                } = await import('node:crypto');

                const encryptedPack: any = publicEncrypt(publicKey, Buffer.from("Data response", 'base64'));
                await medicalRecords.connect(pharmacistAccount).sendResponse(otherAccount.address, encryptedPack.toString());
                expect.fail("Expected an error to be thrown!");
            } catch (error:any) {
                expect(error.message).to.equal("VM Exception while processing transaction: reverted with reason string 'Only clients can send response!'");
            }
        });

        it("should show error when the receiver of the response is an entity different from a doctor or pharmacist", async function() {
            try {
                const { medicalRecords, owner, otherAccount, secondAccount, pharmacistAccount } = await loadFixture(deployContractAndSetVariables);
                const { publicKey, privateKey, key, readyPackage } = await loadFixture(preparePackageForInsertion);
                
                const {
                    publicEncrypt
                } = await import('node:crypto');

                const encryptedPack: any = publicEncrypt(publicKey, Buffer.from("Data response", 'base64'));
                await medicalRecords.connect(secondAccount).sendResponse(owner.address, encryptedPack.toString());
                expect.fail("Expected an error to be thrown!");
            } catch (error:any) {
                expect(error.message).to.equal("VM Exception while processing transaction: reverted with reason string 'Receiver can only be a doctor or a pharmacist!'");
            }
        });
    });
});