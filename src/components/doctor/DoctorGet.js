import React from 'react';
import MedicalRecordsContract from '../../artifacts/contracts/MedicalRecordsContract.sol/MedicalRecordsContract.json';
const Web3 = require("web3");

function DoctorGetData() {
    const [identityNumber, setIdentityNumber] = React.useState('');
    const [consultType, setConsultType] = React.useState('');
    const [consultDate, setConsultDate] = React.useState('');
    const [accountAddress, setAccountAddress] = React.useState('');
    
    const handleIdentityNumber = (event) => {
        setIdentityNumber(event.target.value);
    };

    const handleConsultType = (event) => {
        setConsultType(event.target.value);
    };

    const handleConsultDate = (event) => {
        setConsultDate(event.target.value);
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

                console.log(accountAddress);

                // const sentTransaction = web3.eth.sendTransaction({
                //     from: accounts[0],
                //     to: accountAddress,
                //     data: web3.utils.asciiToHex("Send accept to doctor")
                // })

                const preKey = identityNumber + consultDate + consultType;
                const key = web3.utils.keccak256(web3.eth.abi.encodeParameters(["string"], [preKey]));

                const transaction = await contract.methods.requestDataFromClient(accountAddress, key).send({ from: accounts[0] });

                console.log(await transaction);
            } catch(error) {
                console.log(error);
            }
        }
    };

    return (
        <div>
            <form>
                <div>
                    <label htmlFor='accountAddress'>Account Address</label>
                    <input type="text" name="acadd" value={accountAddress} onChange={handleAccountAddress} />
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
                    <label htmlFor='date'>Date</label>
                    <input type="date" id="cdate" name="cdate"  value={consultDate} onChange={handleConsultDate} />
                </div>
                {/* <input type="submit" value="Get" /> */}
            </form>
            <button onClick={handleSubmit}> Get </button>
        </div>
    );
}

export default DoctorGetData;