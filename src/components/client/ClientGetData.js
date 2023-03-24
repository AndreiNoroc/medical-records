import JSEncrypt from 'jsencrypt';
import React from 'react';
import Web3 from 'web3';
import MedicalRecordsContract from '../../artifacts/contracts/MedicalRecordsContract.sol/MedicalRecordsContract.json';


function ClientGetData() {
    const [identityNumber, setIdentityNumber] = React.useState('');
    const [consultType, setConsultType] = React.useState('');
    const [consultDate, setConsultDate] = React.useState('');
    const [privateKey, setPrivateKey] = React.useState("");
    const [getMessage, setMessage] = React.useState("");
    
    const handleIdentityNumber = (event) => {
        setIdentityNumber(event.target.value);
    };

    const handleConsultType = (event) => {
        setConsultType(event.target.value);
    };

    const handleConsultDate = (event) => {
        setConsultDate(event.target.value);
    };

    const handlePrivateKey = (event) => {
        setPrivateKey(event.target.value);
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
    
                const transaction = await contract.methods.readData(key).call({ from: accounts[0] });
    
                const decryptorInstance = new JSEncrypt();
                decryptorInstance.setPrivateKey(privateKey);
                const decryptedPack = decryptorInstance.decrypt(transaction);
    
                console.log(decryptedPack);
                console.log(decryptedPack["message"]);
                setMessage(decryptedPack["message"]);
            } catch(error) {
                console.log(error);
            }
        }
    };

    return (
        <div style={{display: "flex", justifyContent: "space-between"}}>
            <div>
                <form>
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
                    <div>
                        <label htmlFor='key'>Private key</label>
                        <textarea name="pk" value={privateKey} onChange={handlePrivateKey} />
                    </div>
                    {/* <input type="submit" value="Get" /> */}
                </form>
                <button onClick={handleSubmit}> Get </button>
            </div>
            <div>
                <textarea readOnly>{getMessage}</textarea>
            </div>
        </div>
    );
}

export default ClientGetData;
