import React from 'react';
import { ethers } from 'ethers';
import Client from '../../artifacts/contracts/Client.sol/Client.json';

const clientAdress = 0xdc64a140aa3e981100a9beca4e685f962f0cf6c9;

function ClientGetData() {
    const [identityNumber, setIdentityNumber] = React.useState('');
    const [consultType, setConsultType] = React.useState('');
    const [consultDate, setConsultDate] = React.useState('');
    
    const handleIdentityNumber = (event) => {
        setIdentityNumber(event.target.value);
    };

    const handleConsultType = (event) => {
        setConsultType(event.target.value);
    };

    const handleConsultDate = (event) => {
        setConsultDate(event.target.value);
    };

    async function requestAccount() {
        await window.ethereum.request( {method: 'eth_requestAccounts'} );
    }

    const handleSubmit = async () => {
        if (typeof window.ethereum !== 'undefined') {
            await requestAccount(1);

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner(1);

            const contract = new ethers.Contract(clientAdress, Client.abi, signer);

            const preKey = identityNumber + consultDate + consultType;
            const key = ethers.utils.solidityKeccak256(["string"], [preKey]);

            const info = contract._readData(key);
            alert(info);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor='identityNumber'>Identity Number</label>
                <input type="text" name="idno" value={identityNumber} onChange={handleIdentityNumber} />
            </div>
            <div>
                <label htmlFor='consultType'>Consult Type</label>
                <input type="text" name="ct" value={consultType} onChange={handleConsultType} />
            </div>
            <div>
                <label htmlFor='date'>Date</label>
                <input type="date" id="cdate" name="cdate"  value={consultDate} onChange={handleConsultDate} />
            </div>
            <input type="submit" value="Get" />
        </form>
    );
}

export default ClientGetData;