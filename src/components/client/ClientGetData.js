import React from 'react';
import JSEncrypt from 'jsencrypt';
import Web3 from 'web3';
import MedicalRecordsContract from '../../artifacts/contracts/MedicalRecordsContract.sol/MedicalRecordsContract.json';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ClientGetData() {
    const [identityNumber, setIdentityNumber] = React.useState('');
    const [consultType, setConsultType] = React.useState('');
    const [consultDate, setConsultDate] = React.useState('');
    const [privateKey, setPrivateKey] = React.useState('');
    const [clientGetResult, setClientGetResult] = React.useState('');

    const [receivedKey, setReceivedKey] = React.useState('');
    const [auxReceivedKey, setAuxReceivedKey] = React.useState('');
    const [receivedLogId, setReceivedLogId] = React.useState('');
    const [auxReceivedLogId, setAuxReceivedLogId] = React.useState('');
    const [receivedTo, setReceivedTo] = React.useState('');

    const [acceptPrivateKey, setAcceptPrivateKey] = React.useState('');
    const [entityPublicKey, setEntityPublicKey] = React.useState('');

    const web3Accept = new Web3(window.ethereum);
    const contractAccept = new web3Accept.eth.Contract(MedicalRecordsContract.abi, web3Accept.utils.toChecksumAddress(process.env.REACT_APP_CONTRACT_ADDRESS));

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

    const handleAcceptPrivateKey = (event) => {
        setAcceptPrivateKey(event.target.value);
    };

    const handleEntityPublicKey = (event) => {
        setEntityPublicKey(event.target.value);
    }

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
                const decryptedPack = JSON.parse(decryptorInstance.decrypt(transaction));
    
                if (decryptedPack) {
                    console.log(decryptedPack.docAddress);
                    console.log(await web3.eth.personal.ecRecover(decryptedPack.message, decryptedPack.sign));
                    if (web3.eth.accounts.recover(decryptedPack.message, decryptedPack.sign) === decryptedPack.docAddress) {
                        console.log(decryptedPack.message);
                        const jsonMessage = JSON.parse(decryptedPack.message);
                        setClientGetResult("Pacient Name: " + jsonMessage.name + "\n\n" + "Description: " + jsonMessage.description + "\n");
                    } else {
                        toast.error("Message is corrupt!");
                        setClientGetResult('');
                    }
                } else {
                    toast.error("Data does not exist!");
                    setClientGetResult('');
                }
            } catch(error) {
                console.log(error);
            }
        }
    };

    const handleAcceptance = async () => {
        try {
            if (window.ethereum) {
                const web3 = new Web3(window.ethereum);
                
                await window.ethereum.request({method: 'eth_requestAccounts'});
                const accounts = await web3.eth.getAccounts();

                const contract = new web3.eth.Contract(MedicalRecordsContract.abi, web3.utils.toChecksumAddress(process.env.REACT_APP_CONTRACT_ADDRESS));

                console.log(receivedKey);

                const transaction = await contract.methods.readData(receivedKey).call({ from: accounts[0] });

                console.log(transaction);

                const decryptorInstance = new JSEncrypt();
                decryptorInstance.setPrivateKey(acceptPrivateKey);
                const decryptedPack = JSON.parse(decryptorInstance.decrypt(transaction));

                if (decryptedPack) {
                    if (web3.eth.accounts.recover(decryptedPack.message, decryptedPack.sign) === decryptedPack.docAddress) {
                        console.log(decryptedPack);

                        const signature = await web3.eth.personal.sign(decryptedPack.message, accounts[0]);
        
                        const newPackage = {
                            'message': decryptedPack.message,
                            'sign': signature,
                            'clientAddress': accounts[0]                
                        };
        
                        const encryptorInstance = new JSEncrypt();
                        encryptorInstance.setPublicKey(entityPublicKey);
                        const encryptData = encryptorInstance.encrypt(JSON.stringify(newPackage));
        
                        console.log(encryptData);

                        console.log(receivedTo);

                        const transaction = await contract.methods.sendResponse(receivedTo, encryptData).send({ from: accounts[0] });
                        console.log(transaction);
                    } else {
                        toast.error("Message for sending is corrupt!");
                    } 
                } else {
                    toast.error("Data for sending does not exist!");
                }
            }
        } catch(err) {
            console.log(err);
        }
    };

    React.useEffect(() => {
        const getPastEventsFromDoc = async () => {
            await window.ethereum.request({method: 'eth_requestAccounts'});
            const accounts =  await web3Accept.eth.getAccounts();
    
            const blockNo = await web3Accept.eth.getBlockNumber();
    
            const options = {
                filter: {_to: accounts[0]},
                fromBlock: blockNo
            };
    
            return options;
        };

        const intervalGetEvent = setInterval(() => {
            getPastEventsFromDoc()
            .then((op) => {
                console.log(op);
                contractAccept.events.RequestDataTransaction(op, function(error, event){
                    console.log(event);
                    setAuxReceivedLogId(event.id);
                    setAuxReceivedKey(event.returnValues._value);
                    
                    if (auxReceivedLogId !== receivedLogId) {
                        setReceivedLogId(auxReceivedLogId);
                        setReceivedKey(auxReceivedKey);
                        setReceivedTo(event.returnValues._from);
    
                        toast.info("Accept to send data in next 15 seconds!");
    
                        const rcvKey = setTimeout(() => {
                            setReceivedKey(null);
                        }, 15000);

                        setClientGetResult('');
                    
                        return () => {
                            clearTimeout(rcvKey);
                        };
                    }
                });
            });
        }, 20000);

        return () => {
            clearInterval(intervalGetEvent);
        };
    });
    
    return (
        <div style={{display: "flex", justifyContent: "space-around"}}>
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

            { receivedKey ?
            (<div>
                 <div>
                    <label htmlFor='key'>Private key</label>
                    <textarea name="pk" value={acceptPrivateKey} onChange={handleAcceptPrivateKey} />
                </div>
                <div>
                    <label htmlFor='key'>Entity public key</label>
                    <textarea value={entityPublicKey} onChange={handleEntityPublicKey} />
                </div>
                <button onClick={handleAcceptance}> Accept </button>
            </div>)
            :
            (<textarea readOnly style={{ resize: "none", }} rows={20} cols={30} defaultValue={clientGetResult}/>)}
            <ToastContainer />
        </div>
    );
}

export default ClientGetData;
