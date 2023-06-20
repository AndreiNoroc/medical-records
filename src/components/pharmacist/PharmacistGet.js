import React from 'react';
import MedicalRecordsContract from '../../artifacts/contracts/MedicalRecordsContract.sol/MedicalRecordsContract.json';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import JSEncrypt from 'jsencrypt';
const Web3 = require("web3");

function PharmacistGetData() {
    const [identityNumber, setIdentityNumber] = React.useState('');
    const [errorID, setErrorID] = React.useState('');
    const [outlineID, setOutlineID] = React.useState({outline: 'none'});

    const [consultType, setConsultType] = React.useState('');
    const [errorCT, setErrorCT] = React.useState('');
    const [outlineCT, setOutlineCT] = React.useState({outline: 'none'});

    const [consultDate, setConsultDate] = React.useState('');
    const [errorDate, setErrorDate] = React.useState('');
    const [outlineDate, setOutlineDate] = React.useState({outline: 'none'});

    const [accountAddress, setAccountAddress] = React.useState('');
    const [errorAccountAddress, setErrorAccountAddress] = React.useState('');
    const [outlineAccountAddress, setOutlineAccountAddress] = React.useState({outline: 'none'});

    const [privateKey, setPrivateKey] = React.useState('');
    const [errorPrivateKey, setErrorPrivateKey] = React.useState('');
    const [outlinePrivateKey, setOutlinePrivateKey] = React.useState({outline: 'none'});

    const [drugsList, setDrugsList] = React.useState('');
    const [dataKey, setDataKey] = React.useState('');
    const [auxDecryptPack, setAuxDecryptPack] = React.useState('');

    const [clientPublicKey, setClientPublicKey] = React.useState('');
    const [errorClientPublicKey, setErrorPublicKey] = React.useState('');
    const [outlineClientPublicKey, setOutlineClientPublicKey] = React.useState({outline: 'none'});

    const [receivedData, setReceivedData] = React.useState('');
    const [auxReceivedData, setAuxReceivedData] = React.useState('');
    const [receivedLogId, setReceivedLogId] = React.useState('');

    const lettersAndSpacesOnly = /^[A-Za-z ]+$/;
    const digitsOnly = /^\d*$/;
    const keyCharacters = /^[a-zA-Z0-9\s\-+=/]+$/;
    const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/g;

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

    const checkFields = () => {
        let ok = true;
        
        if (accountAddress) {
            if (accountAddress.length !== 42) {
                if (!ethereumAddressRegex.test(accountAddress)) {
                    setErrorAccountAddress('This field may contain only 0x and alphanumerics!');
                    setOutlineAccountAddress({
                        outline: 'red solid 1px',
                    });
                    ok = false;
                } else {
                    setErrorAccountAddress('');
                    setOutlineAccountAddress({
                        outline: 'none',
                    });
                    ok = ok && true;
                }
            } else {
                setErrorAccountAddress('');
                setOutlineAccountAddress({
                    outline: 'none',
                });
                ok = ok && true;
            }
        } else {
            setErrorAccountAddress('This field may not be blank!');
            setOutlineAccountAddress({
                outline: 'red solid 1px',
            });
            ok = false;
        }

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
    }

    const handleSubmit = async () => {
        if (checkFields() && window.ethereum) {
            try {
                const web3 = new Web3(window.ethereum);
                
                await window.ethereum.request({method: 'eth_requestAccounts'});
                const accounts = await web3.eth.getAccounts();

                const contract = new web3.eth.Contract(MedicalRecordsContract.abi, web3.utils.toChecksumAddress(process.env.REACT_APP_CONTRACT_ADDRESS));

                console.log(accountAddress);

                const preKey = identityNumber + consultDate + consultType;
                const key = web3.utils.keccak256(web3.eth.abi.encodeParameters(["string"], [preKey]));

                const isOutdate = await contract.methods.isKeyOutdated(key).call({ from: accounts[0] });

                if (isOutdate) {
                    toast.info("Prescription is outdated!");

                    setAccountAddress('');
                    setIdentityNumber('');
                    setConsultType('');
                    setConsultDate('');
                    setPrivateKey('');
                } else {
                    await contract.methods.requestDataFromClient(accountAddress, key).send({ from: accounts[0] });
                    toast.success("The request has been successfully sent!");
                    setDataKey(key);
                }
            } catch(error) {
                toast.error(error);
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

                let idx = 0;
                for (idx = 0 ; idx < drugsList.length; idx++) {
                    if (drugsList[idx].pickedUp === false) {
                        idx = -1;
                        break;
                    }
                }

                if (idx === drugsList.length) {
                    await contract.methods.outdateData(dataKey).send({ from: accounts[0] });
                }

                await contract.methods.updateData(dataKey, encryptedData).send({ from: accounts[0] });
                toast.success("Receipt successfully updated!");

                setReceivedData('');
                setDrugsList('');
                setClientPublicKey('');
            }
        } catch (error) {
            toast.error(error);
        }
    };

    const handleDrugPickedChange = (event, index) => {
        drugsList[index].pickedUp = event.target.checked;
    };

    const renderDrugsList = () => {
        try {
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
        } catch (error) {
            toast.error(error);
        }
    };

    React.useEffect(() => {
        try {
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
                    setReceivedLogId(event.id);
                    setAuxReceivedData(event.returnValues._value);
                });
            };

            getPastEventsFromDoc();
        } catch (error) {
            toast.error(error);
        }
    });

    React.useEffect(() => {
        try {
            if (auxReceivedData && auxReceivedData !== receivedData) {
                setReceivedData(auxReceivedData);

                const decryptorInstance = new JSEncrypt();
                decryptorInstance.setPrivateKey(privateKey);
                const decryptedPack = JSON.parse(decryptorInstance.decrypt(auxReceivedData));

                if (decryptedPack) {
                    const web3Browser = new Web3(window.ethereum);
                    if (web3Browser.eth.accounts.recover(decryptedPack.message, decryptedPack.sign) === decryptedPack.clientAddress) {
                        if (decryptedPack.message === "Request declined!") { 
                            toast.info("Request declined!");
                            setReceivedData('');
                            setDrugsList('');
                        } else {
                            if(web3Browser.eth.accounts.recover(decryptedPack.drugListState, decryptedPack.dLSign) === decryptedPack.dLLastModifiedBy) {
                                toast.success("Data successfully received!");
                                setAuxDecryptPack(decryptedPack);

                                const jsonMessage = JSON.parse(decryptedPack.message);
                                setReceivedData("Pacient Name: " + jsonMessage.name + "\n\n" + "Description: " + jsonMessage.description + "\n");
                                setDrugsList(JSON.parse(decryptedPack.drugListState));
                            } else {
                                toast.error("Message is corrupt!");
                                setReceivedData('');
                            }
                        }
                    } else {
                        toast.error("Message is corrupt!");
                        setReceivedData('');
                    }
                } else {
                    toast.error("Data does not exist!");
                    setReceivedData('');
                }

                setAccountAddress('');
                setIdentityNumber('');
                setConsultType('');
                setConsultDate('');
                setPrivateKey('');
            }
        } catch(error) {
            toast.error(error);
        }
    }, [receivedLogId]);

    try {
    return (
        <div className='row'>
            <div className='column'>
                <div className='formInfo'>
                    <label htmlFor='accountAddress'>Account Address</label>
                    <input type="text"
                        name="acadd"
                        maxLength={42}
                        placeholder="e.g. 0x31234321..."
                        value={accountAddress}
                        onChange={handleAccountAddress}
                        style={outlineAccountAddress} />
                    {errorAccountAddress && <p className='pColor'>{errorAccountAddress}</p>}
                    
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
                    
                    <label htmlFor='key'>Private pharmacist key</label>
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
                <h2>Extracted data</h2>
                <div className='formInfo'>
                    <textarea id='resultText' readOnly rows={10} cols={30} defaultValue={receivedData}/>
                    {drugsList ? (<label>Medicines list</label>):(<p> No medicines list was provided! </p>)}
                    {renderDrugsList()}
                    { receivedData ? (
                        <div>
                            <label>Public client key</label>
                            <textarea name="cpk"
                                rows={10}
                                placeholder='e.g -----BEGIN PUBLIC KEY-----
                                            MIIWqAIBAAKC...
                                            -----END PUBLIC KEY-----'
                                value={clientPublicKey}
                                onChange={handleClientPublicKey}
                                style={outlineClientPublicKey} />
                            {errorClientPublicKey && <p className='pColor'>{errorClientPublicKey}</p>}
                            <button onClick={handleOutdate}> Outdate </button>
                        </div>                    
                    ) : (<p></p>)}
                </div>
            </div>
            <ToastContainer />
        </div>
    );
    } catch(error) {
        toast.error(error);
        return null;
    }
}

export default PharmacistGetData;