import { useState } from "react";
import Web3 from 'web3';
import MedicalRecordsContract from '../../artifacts/contracts/MedicalRecordsContract.sol/MedicalRecordsContract.json';

const AdminInsert = () => {
    const [accountAddress, setAccountAddress] = useState('');
    const [selectedOption, setSelectedOption] = useState('');

    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
    };

    const handleAccountAddress = (event) => {
        setAccountAddress(event.target.value);
    };

    const handleSubmit = async () => {
        if (window.ethereum) {
            try {
                const web3 = new Web3(window.ethereum);
                await window.ethereum.request({method: 'eth_requestAccounts'});
                const accounts = await web3.eth.getAccounts();

                const contract = new web3.eth.Contract(MedicalRecordsContract.abi, web3.utils.toChecksumAddress(process.env.REACT_APP_CONTRACT_ADDRESS));

                console.log(selectedOption);
                await contract.methods.insertEntity(selectedOption, accountAddress).send({ from: accounts[0] });
            } catch (error) {
                console.log(error);
            }
        }
    };

    return (
        <div>
            <div>
                <label htmlFor='accAdd'>Account address</label>
                <input type="text" name="accAdd" value={accountAddress} onChange={handleAccountAddress} />
            </div>
            <div>
            <label htmlFor='entityType'>Type</label>
                <select name="entities" value={selectedOption} onChange={handleOptionChange}>
                    <option value="defaultop">Select an option</option>
                    <option value="doctor">Doctor</option>
                    <option value="client">Client</option>
                    <option value="pharmacist">Pharmacist</option>
                </select>
            </div>
            <button onClick={handleSubmit}> Insert </button>
        </div>
    );
};

export default AdminInsert;
