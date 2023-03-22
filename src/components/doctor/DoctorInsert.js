import React from 'react';
import MedicalRecordsContract from '../../artifacts/contracts/MedicalRecordsContract.sol/MedicalRecordsContract.json';
import { JSEncrypt } from "jsencrypt";
const Web3 = require("web3");

function DoctorInterface() {
    const [fullName, setFullName] = React.useState('');
    const [identityNumber, setIdentityNumber] = React.useState('');
    const [consultType, setConsultType] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [consultDate, setConsultDate] = React.useState('');
    const [clientPublicKey, setClientPublicKey] = React.useState('');

    const handleFullName = (event) => {
        setFullName(event.target.value);
    };
    
    const handleIdentityNumber = (event) => {
        setIdentityNumber(event.target.value);
    };

    const handleConsultType = (event) => {
        setConsultType(event.target.value);
    };

    const handleDescription = (event) => {
        setDescription(event.target.value);
    };

    const handleConsultDate = (event) => {
        setConsultDate(event.target.value);
    };

    const handleclientPublicKey = (event) => {
        setClientPublicKey(event.target.value);
    };

    const handleSubmit = async () => {
        if (window.ethereum) {
            try {
                const web3 = new Web3(window.ethereum);
                await window.ethereum.request({method: 'eth_requestAccounts'});
                const accounts = await web3.eth.getAccounts();

                const contract = new web3.eth.Contract(MedicalRecordsContract.abi, web3.utils.toChecksumAddress(process.env.REACT_APP_CONTRACT_ADDRESS));
    
                const preKey = identityNumber + consultDate + consultType;
                const key = web3.utils.keccak256(web3.eth.abi.encodeParameters(["string"], [preKey]));
    
                const message = {
                    'name': fullName,
                    'description': description
                };

                const hashMessage = web3.utils.keccak256(JSON.stringify(message));
                // console.log(web3.eth.abi.decodeParameter('uint256', hashMessage));
                const signature = await web3.eth.sign(hashMessage, accounts[0]);
                
                const newPackage = {
                    'message': hashMessage,
                    'sign': signature,
                    'docAdress': accounts[0]
                }
    
                const crypt = new JSEncrypt({default_key_size: 2048});
                crypt.setPublicKey(clientPublicKey);
                const encryptedPack = crypt.encrypt(newPackage);    
    
                const transaction = await contract.methods.insertData(key, encryptedPack).send({ from: accounts[0] });
                console.log(transaction);    
            } catch (error) {
                console.log(error);
            }
        }
    };

    return (
        <div>
            <form>
                <div>
                    <label htmlFor='name'>Name</label>
                    <input type="text" name="name" value={fullName} onChange={handleFullName} />
                </div>
                <div>
                    <label htmlFor='identityNumber'>Identity Number</label>
                    <input type="text" name="idno" value={identityNumber} onChange={handleIdentityNumber} />
                </div>
                <div>
                    <label htmlFor='consultType'>Consult Type</label>
                    <input type="text" name="ct" value={consultType} onChange={handleConsultType} />
                </div>
                <div>
                    <label htmlFor='description'>Description</label>
                    <input type="text" name="description" value={description} onChange={handleDescription} />
                </div>
                <div>
                    <label htmlFor='date'>Date</label>
                    <input type="date" id="cdate" name="cdate"  value={consultDate} onChange={handleConsultDate} />
                </div>
                <div>
                    <label htmlFor='clientPublicKey'>Client Public Key</label>
                    <input type="text" name="clientPublicKey" value={clientPublicKey} onChange={handleclientPublicKey} />
                </div>
                {/* <input type="submit" value="Insert" /> */}
            </form>
            <button onClick={handleSubmit}> Insert </button>
        </div>
    );
}

export default DoctorInterface;