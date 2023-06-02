import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import "hardhat-gas-reporter";

describe("ReportMedicalRecords", function () {
    async function deployContractAndSetVariables() {
        const [owner, doctorAccount, clientAccount, pharmacistAccount, doctorSecondAccount, clientSecondAccount, pharmacistSecondAccount] = await ethers.getSigners();
        const MedicalRecords = await ethers.getContractFactory("MedicalRecordsContract");
        const medicalRecords = await MedicalRecords.deploy();
        return { medicalRecords, owner, doctorAccount, clientAccount, pharmacistAccount, doctorSecondAccount, clientSecondAccount, pharmacistSecondAccount };
    }

    async function preparePackageForInsertion() {
        const { medicalRecords, owner, doctorAccount, clientAccount, pharmacistAccount, doctorSecondAccount, clientSecondAccount, pharmacistSecondAccount } = await loadFixture(deployContractAndSetVariables);

        await medicalRecords.connect(owner).insertEntity(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("doctor")), doctorAccount.address);                
        expect(await medicalRecords.isEntity(doctorAccount.address)).to.equal(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("DoctorInterface")));

        await medicalRecords.connect(owner).insertEntity(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("client")), clientAccount.address);                
        expect(await medicalRecords.isEntity(clientAccount.address)).to.equal(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ClientInterface")));

        await medicalRecords.connect(owner).insertEntity(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("pharmacist")), pharmacistAccount.address);                
        expect(await medicalRecords.isEntity(pharmacistAccount.address)).to.equal(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("PharmacistInterface")));

        await medicalRecords.connect(owner).insertEntity(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("doctor")), doctorSecondAccount.address);                
        expect(await medicalRecords.isEntity(doctorSecondAccount.address)).to.equal(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("DoctorInterface")));

        await medicalRecords.connect(owner).insertEntity(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("client")), clientSecondAccount.address);                
        expect(await medicalRecords.isEntity(clientSecondAccount.address)).to.equal(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ClientInterface")));

        await medicalRecords.connect(owner).insertEntity(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("pharmacist")), pharmacistSecondAccount.address);                
        expect(await medicalRecords.isEntity(pharmacistSecondAccount.address)).to.equal(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("PharmacistInterface")));

        const preKey = "123245678910" + "11/05/2023" + "hearth control";
        const key = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(["string"], [preKey]));

        const message = {
            'name': "John Smith",
            'description': "heart attack",
            'drugsList': "paracetamol, nurofen"
        };

        const stringifyMessage = JSON.stringify(message);
        const signature = doctorAccount.signMessage(stringifyMessage);

        const newPackage = {
            'message': stringifyMessage,
            'sign': signature,
            'docAddress': doctorAccount.address,
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
    

        const preKeySecond = "908989876546" + "20/06/2023" + "legs control";
        const keySecond = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(["string"], [preKeySecond]));

        const messageSecond = {
            'name': "John Smith",
            'description': "heart attackroeivesoinvoinedrnseirnesoinroiesniboresoibrmoiesbjoiesrjboierjboiesjmbr\
                            oiesjrbjiesoirbjiesojbrioesjbroiesjrboisejrboiesjrboiesjbroiesjrboiesjbroiesjbroisejbrioesjbroisejbroisejr\
                            boesjbroesibrjoesibjoiesjbroiesjbriosejbroiesjbroiesjbroisejbriosejroiesroibsejr               erngoiesrjgio\
                            esjgroiesgjseiojrgoiesgjroiesjgroiesrjgoisejgroisejgroiesjrgoisejrgoijesgjiseoirgjseoirgoisegr",
            'drugsList': "paracetamol, nurofen, reges, wergewg, araesgr"
        };

        const stringifyMessageSecond = JSON.stringify(messageSecond);
        const signatureSecond = doctorAccount.signMessage(stringifyMessageSecond);

        const newPackageSecond = {
            'message': stringifyMessageSecond,
            'sign': signatureSecond,
            'docAddress': doctorSecondAccount.address,
            'pharmacistAddress': 'none'
        };

        const readyPackageBig = Buffer.from(JSON.stringify(newPackageSecond), 'base64');

        return { publicKey, privateKey, key, keySecond, readyPackage, readyPackageBig };
    }

    it("simple scenario client-doctor-pharmacist", async function () {
        const { medicalRecords, owner, doctorAccount, clientAccount, pharmacistAccount } = await loadFixture(deployContractAndSetVariables);
        const { publicKey, privateKey, key, keySecond, readyPackage, readyPackageBig } = await loadFixture(preparePackageForInsertion);

        const {
            publicEncrypt, privateDecrypt, generateKeyPairSync
        } = await import('node:crypto');

        const encryptedPack: any = publicEncrypt(publicKey, readyPackage);
        await medicalRecords.connect(doctorAccount).insertData(key, encryptedPack.toString('base64'));

        const data: any = await medicalRecords.connect(clientAccount).readData(key);
        const decryptedPack: any = privateDecrypt(privateKey, Buffer.from(data, 'base64'));
        expect(readyPackage.toString('base64')).to.equal(decryptedPack.toString('base64'));

        const encryptedRequest: any = publicEncrypt(publicKey, Buffer.from(key, 'base64'));
        let tx = await medicalRecords.connect(pharmacistAccount).requestDataFromClient(clientAccount.address,  encryptedRequest.toString('base64'));

        let emittedEvents: any = [];
        let receipt: any = await tx.wait()
        receipt.events.forEach((ev: { event: any; args: any; }) => {
            if (ev.event) {
                emittedEvents.push({
                    name: ev.event,
                    args: ev.args
                });
            }
        });

        expect(emittedEvents[0].name).to.equal('RequestDataTransaction');
        expect(emittedEvents[0].args._from).to.equal(pharmacistAccount.address);
        expect(emittedEvents[0].args._to).to.equal(clientAccount.address);
 
        const decryptedMessage: any = privateDecrypt(privateKey, Buffer.from(emittedEvents[0].args._value, 'base64'));
        expect(emittedEvents[0].args._value).to.equal(encryptedRequest.toString('base64'));
        
        const getData = await medicalRecords.connect(clientAccount).readData(key);
        const decryptedGetData: any = privateDecrypt(privateKey, Buffer.from(getData, 'base64'));

        const encryptedDataPack: any = publicEncrypt(publicKey, Buffer.from(decryptedGetData, 'base64'));
        tx = await medicalRecords.connect(clientAccount).sendResponse(pharmacistAccount.address, encryptedDataPack.toString('base64'));

        emittedEvents = [];
        receipt = await tx.wait()
        receipt.events.forEach((ev: { event: any; args: any; }) => {
            if (ev.event) {
                emittedEvents.push({
                    name: ev.event,
                    args: ev.args
                });
            }
        });

        expect(emittedEvents[0].name).to.equal('SendResponse');
        expect(emittedEvents[0].args._from).to.equal(clientAccount.address);
        expect(emittedEvents[0].args._to).to.equal(pharmacistAccount.address);
        const decryptedDataPack = privateDecrypt(privateKey, Buffer.from(emittedEvents[0].args._value, 'base64'));
        expect(emittedEvents[0].args._value).to.equal(encryptedDataPack.toString('base64'));
    });

    it.only("complex scenario", async function () {
        const { medicalRecords, owner, doctorAccount, clientAccount, pharmacistAccount, doctorSecondAccount, clientSecondAccount, pharmacistSecondAccount } = await loadFixture(deployContractAndSetVariables);
        const { publicKey, privateKey, key, keySecond, readyPackage,  readyPackageBig} = await loadFixture(preparePackageForInsertion);

        const {
            publicEncrypt, privateDecrypt
        } = await import('node:crypto');
        
        const encryptedPack: any = publicEncrypt(publicKey, readyPackage);
        await medicalRecords.connect(doctorAccount).insertData(key, encryptedPack.toString('base64'));

        const encryptedPackSecond: any = publicEncrypt(publicKey, readyPackageBig);
        await medicalRecords.connect(doctorSecondAccount).insertData(keySecond, encryptedPackSecond.toString('base64'));

        for (let i = 0 ; i < 1000 ; i++) {
            let preKeyAux = Math.floor(Math.random() * Date.now()).toString(36);
            let keyAux = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(["string"], [preKeyAux]));

            let newEncryptedPack: any = publicEncrypt(publicKey, readyPackageBig);
            await medicalRecords.connect(doctorAccount).insertData(keyAux, newEncryptedPack.toString('base64'));

            let data: any = await medicalRecords.connect(clientAccount).readData(key);
            let decryptedPack: any = privateDecrypt(privateKey, Buffer.from(data, 'base64'));
            expect(readyPackage.toString('base64')).to.equal(decryptedPack.toString('base64'));
    
            let encryptedRequest: any = publicEncrypt(publicKey, Buffer.from(key, 'base64'));
            let tx = await medicalRecords.connect(pharmacistAccount).requestDataFromClient(clientAccount.address,  encryptedRequest.toString('base64'));
            let emittedEvents: any = [];
            let receipt: any = await tx.wait()
            receipt.events.forEach((ev: { event: any; args: any; }) => {
                if (ev.event) {
                    emittedEvents.push({
                        name: ev.event,
                        args: ev.args
                    });
                }
            });
            expect(emittedEvents[0].name).to.equal('RequestDataTransaction');
            expect(emittedEvents[0].args._from).to.equal(pharmacistAccount.address);
            expect(emittedEvents[0].args._to).to.equal(clientAccount.address);
            let decryptedMessage: any = privateDecrypt(privateKey, Buffer.from(emittedEvents[0].args._value, 'base64'));
            expect(emittedEvents[0].args._value).to.equal(encryptedRequest.toString('base64'));
    
            data = await medicalRecords.connect(clientSecondAccount).readData(keySecond);
            decryptedPack = privateDecrypt(privateKey, Buffer.from(data, 'base64'));
            expect(readyPackageBig.toString('base64')).to.equal(decryptedPack.toString('base64'));
    
            data= await medicalRecords.connect(clientAccount).readData(key);
            decryptedPack = privateDecrypt(privateKey, Buffer.from(data, 'base64'));
            expect(readyPackage.toString('base64')).to.equal(decryptedPack.toString('base64'));
    
            const getData = await medicalRecords.connect(clientAccount).readData(key);
            const decryptedGetData: any = privateDecrypt(privateKey, Buffer.from(getData, 'base64'));
    
            let encryptedDataPack: any = publicEncrypt(publicKey, Buffer.from(decryptedGetData, 'base64'));
            tx = await medicalRecords.connect(clientAccount).sendResponse(pharmacistAccount.address, encryptedDataPack.toString('base64'));
            emittedEvents = [];
            receipt = await tx.wait()
            receipt.events.forEach((ev: { event: any; args: any; }) => {
                if (ev.event) {
                    emittedEvents.push({
                        name: ev.event,
                        args: ev.args
                    });
                }
            });
            expect(emittedEvents[0].name).to.equal('SendResponse');
            expect(emittedEvents[0].args._from).to.equal(clientAccount.address);
            expect(emittedEvents[0].args._to).to.equal(pharmacistAccount.address);
            let decryptedDataPack: any = privateDecrypt(privateKey, Buffer.from(emittedEvents[0].args._value, 'base64'));
            expect(emittedEvents[0].args._value).to.equal(encryptedDataPack.toString('base64'));
    
            encryptedRequest = publicEncrypt(publicKey, Buffer.from(keySecond, 'base64'));
            tx = await medicalRecords.connect(doctorSecondAccount).requestDataFromClient(clientSecondAccount.address,  encryptedRequest.toString('base64'));
            emittedEvents = [];
            receipt = await tx.wait()
            receipt.events.forEach((ev: { event: any; args: any; }) => {
                if (ev.event) {
                    emittedEvents.push({
                        name: ev.event,
                        args: ev.args
                    });
                }
            });
            expect(emittedEvents[0].name).to.equal('RequestDataTransaction');
            expect(emittedEvents[0].args._from).to.equal(doctorSecondAccount.address);
            expect(emittedEvents[0].args._to).to.equal(clientSecondAccount.address);
            decryptedMessage = privateDecrypt(privateKey, Buffer.from(emittedEvents[0].args._value, 'base64'));
            expect(emittedEvents[0].args._value).to.equal(encryptedRequest.toString('base64'));
    
            encryptedDataPack = publicEncrypt(publicKey, Buffer.from(decryptedGetData, 'base64'));
            tx = await medicalRecords.connect(clientSecondAccount).sendResponse(doctorSecondAccount.address, encryptedDataPack.toString('base64'));
            emittedEvents = [];
            receipt = await tx.wait()
            receipt.events.forEach((ev: { event: any; args: any; }) => {
                if (ev.event) {
                    emittedEvents.push({
                        name: ev.event,
                        args: ev.args
                    });
                }
            });
            expect(emittedEvents[0].name).to.equal('SendResponse');
            expect(emittedEvents[0].args._from).to.equal(clientSecondAccount.address);
            expect(emittedEvents[0].args._to).to.equal(doctorSecondAccount.address);
            decryptedDataPack = privateDecrypt(privateKey, Buffer.from(emittedEvents[0].args._value, 'base64'));
            expect(emittedEvents[0].args._value).to.equal(encryptedDataPack.toString('base64'));
            
            encryptedRequest = publicEncrypt(publicKey, Buffer.from(keySecond, 'base64'));
            tx = await medicalRecords.connect(doctorSecondAccount).requestDataFromClient(clientSecondAccount.address,  encryptedRequest.toString('base64'));
            emittedEvents = [];
            receipt = await tx.wait()
            receipt.events.forEach((ev: { event: any; args: any; }) => {
                if (ev.event) {
                    emittedEvents.push({
                        name: ev.event,
                        args: ev.args
                    });
                }
            });
            expect(emittedEvents[0].name).to.equal('RequestDataTransaction');
            expect(emittedEvents[0].args._from).to.equal(doctorSecondAccount.address);
            expect(emittedEvents[0].args._to).to.equal(clientSecondAccount.address);
            decryptedMessage = privateDecrypt(privateKey, Buffer.from(emittedEvents[0].args._value, 'base64'));
            expect(emittedEvents[0].args._value).to.equal(encryptedRequest.toString('base64'));
    
            tx = await medicalRecords.connect(pharmacistSecondAccount).updateData(keySecond, encryptedPackSecond.toString('base64'));
            data = await medicalRecords.connect(clientSecondAccount).readData(keySecond);
            decryptedPack = privateDecrypt(privateKey, Buffer.from(data, 'base64'));
            expect(readyPackageBig.toString('base64')).to.equal(decryptedPack.toString('base64'));
    
            tx = await medicalRecords.connect(pharmacistAccount).updateData(key, encryptedPack.toString('base64'));
            data= await medicalRecords.connect(clientAccount).readData(key);
            decryptedPack = privateDecrypt(privateKey, Buffer.from(data, 'base64'));
            expect(readyPackage.toString('base64')).to.equal(decryptedPack.toString('base64'));
        }

        await medicalRecords.connect(pharmacistAccount).outdateData(key);
        await medicalRecords.connect(pharmacistSecondAccount).outdateData(keySecond);
    }).timeout(1800000);
});