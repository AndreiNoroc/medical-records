import React from 'react';
import MedicalRecordsContract from '../../artifacts/contracts/MedicalRecordsContract.sol/MedicalRecordsContract.json';
import JSEncrypt from 'jsencrypt';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const Web3 = require("web3");

function DoctorInsert() {
    const [fullName, setFullName] = React.useState('');
    const [identityNumber, setIdentityNumber] = React.useState('');
    const [consultType, setConsultType] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [consultDate, setConsultDate] = React.useState('');
    const [clientPublicKey, setClientPublicKey] = React.useState('');
    const [drugsList, setDrugsList] = React.useState([{'name': '', 'pickedUp': false}]);

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

    const handleAddDrug = () => {
        const newDrugsList = [...drugsList, {'name': '', 'pickedUp': false}];
        setDrugsList(newDrugsList);
    };

    const handleRemoveDrug = (index) => {
        const newDrugsList = [...drugsList];
        newDrugsList.splice(index, 1);
        setDrugsList(newDrugsList);
    };

    const handleDrugChange = (event, index) => {
        const newDrugsList = [...drugsList];
        newDrugsList[index].name = event.target.value;
        setDrugsList(newDrugsList);
    };

    const renderDrugsList = () => {
        return drugsList.map((input, index) => (
          <div key={index}>
            <input type="text" value={input.name} onChange={(event) => handleDrugChange(event, index)} />
            {index > 0 && (
              <button type="button" onClick={() => handleRemoveDrug(index)}>X</button>
            )}
          </div>
        ));
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
    
                const dlStringify = JSON.stringify(drugsList);

                const message = {
                    'name': fullName,
                    'description': description,
                    'drugsList': dlStringify
                };

                const stringifyMessage = JSON.stringify(message);
                const signature = await web3.eth.personal.sign(stringifyMessage, accounts[0]);

                
                const dlSignature = await web3.eth.personal.sign(dlStringify, accounts[0]);
                console.log(drugsList);

                const newPackage = {
                    'message': stringifyMessage,
                    'sign': signature,
                    'docAddress': accounts[0],
                    'drugListState': dlStringify,
                    'dLLastModifiedBy': accounts[0],
                    'dLSign': dlSignature
                }

                console.log(newPackage);
    
                const encryptorInstance = new JSEncrypt();
                encryptorInstance.setPublicKey(clientPublicKey);
                console.log(JSON.stringify(newPackage));
                const encryptedPack = encryptorInstance.encrypt(JSON.stringify(newPackage));

                console.log(encryptedPack);

                await contract.methods.insertData(key, encryptedPack).send({ from: accounts[0] });

                toast.success("Entry successfully added!");
            } catch (err) {
                console.log(err);
                toast.error(err);
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
                    {renderDrugsList()}
                    <button type="button" onClick={handleAddDrug}>Add Drug</button>
                </div>

                <div>
                    <label htmlFor='clientPublicKey'>Client Public Key</label>
                    <textarea name="clientPublicKey" value={clientPublicKey} onChange={handleclientPublicKey} />
                </div>
            </form>

            <button onClick={handleSubmit}> Insert </button>

            <ToastContainer />
        </div>
    );
}

export default DoctorInsert;