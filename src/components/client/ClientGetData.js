import "./Client.css";
import React from 'react';
import JSEncrypt from 'jsencrypt';
import Web3 from 'web3';
import MedicalRecordsContract from '../../artifacts/contracts/MedicalRecordsContract.sol/MedicalRecordsContract.json';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ClientGetData() {
    const [identityNumber, setIdentityNumber] = React.useState('');
    const [errorID, setErrorID] = React.useState('');
    const [outlineID, setOutlineID] = React.useState({outline: 'none'});

    const [consultType, setConsultType] = React.useState('');
    const [errorCT, setErrorCT] = React.useState('');
    const [outlineCT, setOutlineCT] = React.useState({outline: 'none'});

    const [consultDate, setConsultDate] = React.useState('');
    const [errorDate, setErrorDate] = React.useState('');
    const [outlineDate, setOutlineDate] = React.useState({outline: 'none'});

    const [privateKey, setPrivateKey] = React.useState('');
    const [errorPrivateKey, setErrorPrivateKey] = React.useState('');
    const [outlinePrivateKey, setOutlinePrivateKey] = React.useState({outline: 'none'});

    const [clientGetResult, setClientGetResult] = React.useState('');
    const [drugsList, setDrugsList] = React.useState('');

    const [receivedKey, setReceivedKey] = React.useState('');
    const [auxReceivedKey, setAuxReceivedKey] = React.useState('');
    const [receivedLogId, setReceivedLogId] = React.useState('');
    const [receivedTo, setReceivedTo] = React.useState('');

    const [acceptPrivateKey, setAcceptPrivateKey] = React.useState('');
    const [errorAcceptPrivateKey, setErrorAcceptPrivateKey] = React.useState('');
    const [outlineAcceptPrivateKey, setOutlineAcceptPrivateKey] = React.useState({outline: 'none'});

    const [entityPublicKey, setEntityPublicKey] = React.useState('');
    const [errorEntityPublic, setErrorEntityPublic] = React.useState('');
    const [outlineEntityPublicKey, setOutlineEntityPublicKey] = React.useState({outline: 'none'});

    const lettersAndSpacesOnly = /^[A-Za-z ]+$/;
    const digitsOnly = /^\d*$/;
    const keyCharacters = /^[a-zA-Z0-9\s\-+=/]+$/;

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

    const checkFields = () => {
        let ok = true;

        if (identityNumber) {
            if (!digitsOnly.test(identityNumber)) {
                setErrorID('This field may contain only digits!');
                setOutlineID({
                    outline: 'red solid 1px',
                });
                ok = false;
            } else {
                if (identityNumber.length !== 13) {
                    setErrorID('The identity length may be 13!');
                    setOutlineID({
                        outline: 'red solid 1px',
                    });
                    ok = false;
                } else {
                    setErrorID('');
                    setOutlineID({
                        outline: 'none',
                    });
                    ok = ok && true;
                }
            }
        } else {
            setErrorID('This field may not be blank!');
            setOutlineID({
                outline: 'red solid 1px',
            });
            ok = false;
        }

        if (consultType) {
            if (!lettersAndSpacesOnly.test(consultType)) {
                setErrorCT('This field may contain only letters and spaces!');
                setOutlineCT({
                    outline: 'red solid 1px',
                });
                ok = false;
            } else {
                setErrorCT('');
                setOutlineCT({
                    outline: 'none',
                });
                ok = ok && true;
            }
        } else {
            setErrorCT('This field may not be blank!');
            setOutlineCT({
                outline: 'red solid 1px',
            });
            ok = false;
        }

        if (consultDate) {
            setErrorDate('');
            setOutlineDate({
                outline: 'none',
            });
            ok = ok && true;
        } else {
            setErrorDate('Data may be selected!');
            setOutlineDate({
                outline: 'red solid 1px',
            });
            ok = false;
        }

        if (privateKey) {
            if (!keyCharacters.test(privateKey)) {
                setErrorPrivateKey('This field may contain only letters, digits, spaces, -, +, / and = !');
                setOutlinePrivateKey({
                    outline: 'red solid 1px',
                });
                ok = false;
            } else {
                setErrorPrivateKey('');
                setOutlinePrivateKey({
                    outline: 'none',
                });
                ok = ok && true;
            }
        } else {
            setErrorPrivateKey('This field may not be blank!');
            setOutlinePrivateKey({
                outline: 'red solid 1px',
            });
            ok = false;
        }

        return ok;
    };

    const handleSubmit = async () => {
            try {
                if (checkFields() && window.ethereum) {
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
                        console.log(decryptedPack);
                        console.log(await web3.eth.personal.ecRecover(decryptedPack.message, decryptedPack.sign));
                        if (web3.eth.accounts.recover(decryptedPack.message, decryptedPack.sign) === decryptedPack.docAddress &&
                            web3.eth.accounts.recover(decryptedPack.drugListState, decryptedPack.dLSign) === decryptedPack.dLLastModifiedBy) {
                            console.log(decryptedPack.message);
                            const jsonMessage = JSON.parse(decryptedPack.message);
                            setClientGetResult("Pacient Name: " + jsonMessage.name + "\n\n" + "Description: " + jsonMessage.description + "\n");
                            setDrugsList(JSON.parse(decryptedPack.drugListState));

                            setIdentityNumber('');
                            setConsultType('');
                            setConsultDate('');
                            setPrivateKey('');
                        } else {
                            toast.error("Message is corrupt!");
                            setClientGetResult('');
                            setDrugsList('');
                        }
                    } else {
                        toast.error("Data does not exist!");
                        setClientGetResult('');
                        setDrugsList('');
                    }
                }
            } catch(error) {
                console.log(error);
            }
    };

    const checkAcceptanceField = () => {
        let ok = true;

        if (acceptPrivateKey) {
            if (!keyCharacters.test(acceptPrivateKey)) {
                setErrorAcceptPrivateKey('This field may contain only letters, digits, spaces, -, +, / and = !');
                setOutlineAcceptPrivateKey({
                    outline: 'red solid 1px',
                });
                ok = false;
            } else {
                setErrorAcceptPrivateKey('');
                setOutlineAcceptPrivateKey({
                    outline: 'none',
                });
                ok = ok && true;
            }
        } else {
            setErrorAcceptPrivateKey('This field may not be blank!');
            setOutlineAcceptPrivateKey({
                outline: 'red solid 1px',
            });
            ok = false;
        }

        if (entityPublicKey) {
            if (!keyCharacters.test(entityPublicKey)) {
                setErrorEntityPublic('This field may contain only letters, digits, spaces, -, +, / and = !');
                setOutlineEntityPublicKey({
                    outline: 'red solid 1px',
                });
                ok = false;
            } else {
                setErrorEntityPublic('');
                setOutlineEntityPublicKey({
                    outline: 'none',
                });
                ok = ok && true;
            }
        } else {
            setErrorEntityPublic('This field may not be blank!');
            setOutlineEntityPublicKey({
                outline: 'red solid 1px',
            });
            ok = false;
        }

        return ok;
    };

    const handleAcceptance = async () => {
        try {
            if (checkAcceptanceField() && window.ethereum) {
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
                console.log(decryptedPack);

                if (decryptedPack) {
                    if (web3.eth.accounts.recover(decryptedPack.message, decryptedPack.sign) === decryptedPack.docAddress &&
                        web3.eth.accounts.recover(decryptedPack.drugListState, decryptedPack.dLSign) === decryptedPack.dLLastModifiedBy) {
                        console.log(decryptedPack);

                        const signature = await web3.eth.personal.sign(decryptedPack.message, accounts[0]);

                        const newPackage = {
                            'message': decryptedPack.message,
                            'drugListState': decryptedPack.drugListState,
                            'docSign': decryptedPack.sign,
                            'docAddress': decryptedPack.docAddress,
                            'dLLastModifiedBy': decryptedPack.dLLastModifiedBy,
                            'dLSign': decryptedPack.dLSign,
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

                        setReceivedKey('');
                    } else {
                        toast.error("Message for sending is corrupt!");
                    } 
                } else {
                    toast.error("Data for sending does not exist!");
                }

                setAcceptPrivateKey('');
                setEntityPublicKey('');
            }
        } catch(err) {
            console.log(err);
        }
    };

    const handleDecline = async () => {
        if (checkAcceptanceField() && window.ethereum) {
            try {
            const web3 = new Web3(window.ethereum);
                
            await window.ethereum.request({method: 'eth_requestAccounts'});
            const accounts = await web3.eth.getAccounts();

            const contract = new web3.eth.Contract(MedicalRecordsContract.abi, web3.utils.toChecksumAddress(process.env.REACT_APP_CONTRACT_ADDRESS));

            const declineMessage = "Request declined!";

            const signature = await web3.eth.personal.sign(declineMessage, accounts[0]);

            const newPackage = {
                'message': declineMessage,
                'sign': signature,
                'clientAddress': accounts[0]
            };

            const encryptorInstance = new JSEncrypt();
            encryptorInstance.setPublicKey(entityPublicKey);
            const encryptData = encryptorInstance.encrypt(JSON.stringify(newPackage));

            const transaction = await contract.methods.sendResponse(receivedTo, encryptData).send({ from: accounts[0] });

            setAcceptPrivateKey('');
            setEntityPublicKey('');
            setReceivedKey('');
            } catch(err) {
                console.log(err);
            } 
        }
    };

    const renderDrugsList = () => {
        if (drugsList !== '') {
            return drugsList.map((input, index) => (
                <div key={index}>
                    <input type="text" value={input.name} readOnly />
                    <input type="checkbox" checked={input.pickedUp} readOnly />
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
    
            contractAccept.once('RequestDataTransaction', options, function(error, event) {
                console.log(event);
                setReceivedLogId(event.id);
                setAuxReceivedKey(event.returnValues._value);
                setReceivedTo(event.returnValues._from);
            });
        };

        getPastEventsFromDoc();
    });

    React.useEffect(() => {
        if (auxReceivedKey) {
            setReceivedKey(auxReceivedKey);

            toast.info("Accept to send data in next 60 seconds!");

            const rcvKey = setTimeout(() => {
                setReceivedKey(null);
            }, 60000);

            setClientGetResult('');
            setDrugsList('');
        
            return () => {
                clearTimeout(rcvKey);
            };
        }
    }, [receivedLogId]);
    
    try {
        return (
            <div>
                { receivedKey ?
                (
                    <div className='column'>
                        <div className='formInfo'>
                            <label htmlFor='key'>Client private key</label>
                            <textarea name="pk"
                                value={acceptPrivateKey}
                                onChange={handleAcceptPrivateKey}
                                rows={10}
                                placeholder='e.g -----BEGIN RSA PRIVATE KEY-----
                                        MIIWqAIBAAKCBQE...
                                        -----END RSA PRIVATE KEY-----'
                                style={outlineAcceptPrivateKey} />
                            {errorAcceptPrivateKey && <p className='pColor'>{errorAcceptPrivateKey}</p>}

                            <label htmlFor='key'>Entity public key</label>
                            <textarea
                                value={entityPublicKey}
                                onChange={handleEntityPublicKey}
                                rows={10}
                                placeholder='e.g -----BEGIN PUBLIC KEY-----
                                MIIWqAIBAAKC...
                                -----END PUBLIC KEY-----'
                                style={outlineEntityPublicKey} />
                            {errorEntityPublic && <p className='pColor'>{errorEntityPublic}</p>}

                            <div id='actionButtons'>
                                <button onClick={handleAcceptance}> Accept </button>
                                <button onClick={handleDecline}> Decline </button>
                            </div>
                        </div>
                    </div>
                )
                :
                (
                    <div className='row'>
                        <div className='column'>
                            <div className='formInfo'>
                                <label htmlFor='identityNumber'>Identity Number</label>
                                <input type="text"
                                    name="idno"
                                    maxLength={13}
                                    placeholder="e.g. 1234567891012"
                                    value={identityNumber}
                                    onChange={handleIdentityNumber}
                                    style={outlineID} />
                                {errorID && <p className='pColor'>{errorID}</p>}

                                <label htmlFor='consultType'>Consult Type</label>
                                <input type="text"
                                    name="ct"
                                    maxLength="20"
                                    placeholder="e.g. cardiac control"
                                    value={consultType}
                                    onChange={handleConsultType}
                                    style={outlineCT} />
                                {errorCT && <p className='pColor'>{errorCT}</p>}

                                <label htmlFor='date'>Date</label>
                                <input type="date"
                                    id="cdate"
                                    name="cdate"
                                    value={consultDate}
                                    onChange={handleConsultDate}
                                    style={outlineDate} />
                                {errorDate && <p className='pColor'>{errorDate}</p>}

                                <label htmlFor='key'>Private client key</label>
                                <textarea name="pk"
                                    value={privateKey}
                                    onChange={handlePrivateKey}
                                    rows={10}
                                    placeholder='e.g -----BEGIN RSA PRIVATE KEY-----
                                            MIIWqAIBAAKCBQE...
                                            -----END RSA PRIVATE KEY-----'
                                    style={outlinePrivateKey} />
                                {errorPrivateKey && <p className='pColor'>{errorPrivateKey}</p>}
                                
                                <button onClick={handleSubmit}> Get </button>
                            </div>
                        </div>

                        <div className='column'>
                            <div className='formInfo'>
                                <textarea id='resultText' readOnly rows={10} cols={30} defaultValue={clientGetResult} />
                                {drugsList ? (<label>Drugs list</label>):(<p>No drugs list was provided! </p>)}
                                {renderDrugsList()}
                            </div>
                        </div>
                    </div>
                )}
                <ToastContainer />
            </div>
        );
    } catch(error) {
        console.log(error);
        return null;
    }
}

export default ClientGetData;
