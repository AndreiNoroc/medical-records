import React from 'react';
import { ethers } from 'ethers';
import Doctor from '../../artifacts/contracts/Doctor.sol/Doctor.json';

const doctorAdress = 0xcf7ed3acca5a467e9e704c703e8d87f634f;

function DoctorGetData() {
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

    const handleSubmit = async (event) => {
        if (typeof window.ethereum !== 'undefined') {
            await requestAccount();

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner(0);

            const contract = new ethers.Contract(doctorAdress, Doctor.abi, signer);

            const preKey = identityNumber + consultDate + consultType;
            const key = ethers.utils.solidityKeccak256(["string"], [preKey]);

            
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

export default DoctorGetData;