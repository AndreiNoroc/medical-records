import React from 'react';
import MedicalRecordsContract from '../../artifacts/contracts/MedicalRecordsContract.sol/MedicalRecordsContract.json';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import JSEncrypt from 'jsencrypt';
const Web3 = require("web3");

function PharmacistGetData() {
    const [identityNumber, setIdentityNumber] = React.useState('');
    const [consultType, setConsultType] = React.useState('');
    const [consultDate, setConsultDate] = React.useState('');
    const [accountAddress, setAccountAddress] = React.useState('');
    const [privateKey, setPrivateKey] = React.useState('');
    const [drugsList, setDrugsList] = React.useState('');
    const [dataKey, setDataKey] = React.useState('');
    const [auxDecryptPack, setAuxDecryptPack] = React.useState('');
    const [clientPublicKey, setClientPublicKey] = React.useState('');

    const [receivedData, setReceivedData] = React.useState('');
    const [auxReceivedData, setAuxReceivedData] = React.useState('');
    const [receivedLogId, setReceivedLogId] = React.useState('');

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

    const handlePrivateKey = (event) => {
        setPrivateKey(event.target.value);
    };

    const handleClientPublicKey = (event) => {
        setClientPublicKey(event.target.value);
    };

    const handleSubmit = async () => {
        if (window.ethereum) {
            try {
                const web3 = new Web3(window.ethereum);
                
                await window.ethereum.request({method: 'eth_requestAccounts'});
                const accounts = await web3.eth.getAccounts();

                const contract = new web3.eth.Contract(MedicalRecordsContract.abi, web3.utils.toChecksumAddress(process.env.REACT_APP_CONTRACT_ADDRESS));

                console.log(accountAddress);

                const preKey = identityNumber + consultDate + consultType;
                const key = web3.utils.keccak256(web3.eth.abi.encodeParameters(["string"], [preKey]));

                const transaction = await contract.methods.requestDataFromClient(accountAddress, key).send({ from: accounts[0] });

                // trebuie facute verificari
                setDataKey(key);

                console.log(await transaction);
            } catch(error) {
                console.log(error);
            }
        }
    };

    const handleOutdate = async () => {
        try {
            const web3 = new Web3(window.ethereum);
                    
            await window.ethereum.request({method: 'eth_requestAccounts'});
            const accounts = await web3.eth.getAccounts();

            const contract = new web3.eth.Contract(MedicalRecordsContract.abi, web3.utils.toChecksumAddress(process.env.REACT_APP_CONTRACT_ADDRESS));

            console.log(accountAddress);

            const dlStringify = JSON.stringify(drugsList);
            const dlSignature = await web3.eth.personal.sign(dlStringify, accounts[0]);

            if (auxDecryptPack.drugListState !== dlStringify) {
                const updatedPackage = {
                    'message': auxDecryptPack.message,
                    'sign': auxDecryptPack.docSign,
                    'docAddress': auxDecryptPack.docAddress,
                    'drugListState': dlStringify,
                    'dLLastModifiedBy': accounts[0],
                    'dLSign': dlSignature
                }

                console.log(updatedPackage);

                const encryptInstance = new JSEncrypt();
                encryptInstance.setPublicKey(clientPublicKey);
                const encryptedData = encryptInstance.encrypt(JSON.stringify(updatedPackage));

                console.log(encryptedData);

                await contract.methods.updateData(dataKey, encryptedData).send({ from: accounts[0] });

                toast.success("Receipt successfully updated!");
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleDrugPickedChange = (event, index) => {
        drugsList[index].pickedUp = event.target.checked;
    };

    const renderDrugsList = () => {
        if (drugsList !== '') {
            return drugsList.map((input, index) => (
                <div key={index}>
                    <input type="text" value={input.name} readOnly />
                    {
                        input.pickedUp === true ?
                        (<input type="checkbox" checked={input.pickedUp} readOnly />) 
                        :
                        (<input type="checkbox" onChange={(event) => handleDrugPickedChange(event, index)} />)
                    }
                </div>
            ));
        }
    };

    React.useEffect(() => {
        const getPastEventsFromDoc = async () => {
            const web3Accept = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
            const web3Browser = new Web3(window.ethereum);
            const contractAccept = new web3Accept.eth.Contract(MedicalRecordsContract.abi, web3Accept.utils.toChecksumAddress(process.env.REACT_APP_CONTRACT_ADDRESS));

            await window.ethereum.request({method: 'eth_requestAccounts'});
            const accounts =  await web3Browser.eth.getAccounts();
    
            const options = {
                filter: {_to: accounts[0]},
                fromBlock: 'latest'
            };
    
            contractAccept.once('SendResponse', options, function(error, event) {
                console.log(event);
                setReceivedLogId(event.id);
                setAuxReceivedData(event.returnValues._value);
            });
        };

        getPastEventsFromDoc();
    });

    React.useEffect(() => {
        if (auxReceivedData && auxReceivedData !== receivedData) {
            setReceivedData(auxReceivedData);

            const decryptorInstance = new JSEncrypt();
            decryptorInstance.setPrivateKey(privateKey);
            const decryptedPack = JSON.parse(decryptorInstance.decrypt(auxReceivedData));

            console.log(decryptedPack);

            if (decryptedPack) {
                const web3Browser = new Web3(window.ethereum);
                if (web3Browser.eth.accounts.recover(decryptedPack.message, decryptedPack.sign) === decryptedPack.clientAddress &&
                    web3Browser.eth.accounts.recover(decryptedPack.drugListState, decryptedPack.dLSign) === decryptedPack.dLLastModifiedBy) {
                    toast.success("Data successfully received!");
                    setAuxDecryptPack(decryptedPack);

                    const jsonMessage = JSON.parse(decryptedPack.message);
                    setReceivedData("Pacient Name: " + jsonMessage.name + "\n\n" + "Description: " + jsonMessage.description + "\n");
                    setDrugsList(JSON.parse(decryptedPack.drugListState));
                } else {
                    toast.error("Message is corrupt!");
                    setReceivedData('');
                }
            } else {
                toast.error("Data does not exist!");
                setReceivedData('');
            }
        }
    }, [receivedLogId]);

    return (
        <div style={{display: "flex", justifyContent: "space-around"}}>
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
                    <div>
                        <label htmlFor='key'>Private key</label>
                        <textarea name="pk" value={privateKey} onChange={handlePrivateKey} />
                    </div>
                </form>
                <button onClick={handleSubmit}> Get </button>
            </div>
            <div>
                <textarea readOnly style={{ resize: "none", }} rows={20} cols={30} defaultValue={receivedData}/>
                <label>Drugs list</label>
                {renderDrugsList()}

                { receivedData ? (
                    <div>
                        <div>
                            <label>Public key</label>
                            <textarea name="cpk" value={clientPublicKey} onChange={handleClientPublicKey} />
                        </div>
                        <button onClick={handleOutdate}> Outdate </button>
                    </div>                    
                ) : (<p></p>)}
            </div>
            <ToastContainer />
        </div>
    );
}

export default PharmacistGetData;