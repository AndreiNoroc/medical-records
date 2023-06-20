import React from 'react';
import MedicalRecordsContract from '../../artifacts/contracts/MedicalRecordsContract.sol/MedicalRecordsContract.json';
import JSEncrypt from 'jsencrypt';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const Web3 = require("web3");

function DoctorInsert() {
    const [fullName, setFullName] = React.useState('');
    const [errorName, setErrorName] = React.useState('');
    const [outlineCName, setOutlineCName] = React.useState({outline: 'none'});

    const [identityNumber, setIdentityNumber] = React.useState('');
    const [errorID, setErrorID] = React.useState('');
    const [outlineID, setOutlineID] = React.useState({outline: 'none'});

    const [consultType, setConsultType] = React.useState('');
    const [errorCT, setErrorCT] = React.useState('');
    const [outlineCT, setOutlineCT] = React.useState({outline: 'none'});

    const [description, setDescription] = React.useState('');
    const [errorDescription, setErrorDescription] = React.useState('');
    const [outlineDescription, setOutlineDescription] = React.useState({outline: 'none'});

    const [consultDate, setConsultDate] = React.useState('');
    const [errorDate, setErrorDate] = React.useState('');
    const [outlineDate, setOutlineDate] = React.useState({outline: 'none'});

    const [clientPublicKey, setClientPublicKey] = React.useState('');
    const [errorPubKey, setErrorPubKey] = React.useState('');
    const [outlinePubKey, setOutlinePubKey] = React.useState({outline: 'none'});

    const [drugsList, setDrugsList] = React.useState([{'name': '', 'pickedUp': false}]);

    const lettersAndSpacesOnly = /^[A-Za-z ]+$/;
    const digitsOnly = /^\d*$/;
    const allowedCharacters = /^[a-zA-Z0-9\s.,?\/!#%&*()[\]{}"'\\;:|]+/;
    const keyCharacters = /^[a-zA-Z0-9\s\-+=/]+$/;

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

    const handleclientPublicKey = (event) => {
        setClientPublicKey(event.target.value);
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
        try {
            return drugsList.map((input, index) => (
            <div className='columnDrugList' key={index}>
                <input type="text"
                    placeholder='e.g. medicineX'
                    value={input.name}
                    onChange={(event) => handleDrugChange(event, index)} />
                {index > 0 && (
                <button type="button" onClick={() => handleRemoveDrug(index)}>X</button>
                )}
            </div>
            ));
        } catch (error) {
            toast.error(error);
        }
    };

    const checkFields = () => {
        let ok = true;

        if (fullName) {
            if (!lettersAndSpacesOnly.test(fullName)) {
                setErrorName('This field may contain only letters and spaces!');
                setOutlineCName({
                    outline: 'red solid 1px',
                });
                ok = false;
            } else {
                setErrorName('');
                setOutlineCName({
                    outline: 'none',
                });
                ok = ok && true;
            }
        } else {
            setErrorName('This field may not be blank!');
            setOutlineCName({
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

        if (description) {
            if (!allowedCharacters.test(description)) {
                setErrorDescription('This field may contain only letters and spaces!');
                setOutlineDescription({
                    outline: 'red solid 1px',
                });
                ok = false;
            } else {
                setErrorDescription('');
                setOutlineDescription({
                    outline: 'none',
                });
                ok = ok && true;
            }
        } else {
            setErrorDescription('This field may not be blank!');
            setOutlineDescription({
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

        if (clientPublicKey) {
            if (!keyCharacters.test(clientPublicKey)) {
                setErrorPubKey('This field may contain only letters, digits, spaces, -, +, / and = !');
                setOutlinePubKey({
                    outline: 'red solid 1px',
                });
                ok = false;
            } else {
                setErrorPubKey('');
                setOutlinePubKey({
                    outline: 'none',
                });
                ok = ok && true;
            }
        } else {
            setErrorPubKey('This field may not be blank!');
            setOutlinePubKey({
                outline: 'red solid 1px',
            });
            ok = false;
        }

        return ok;
    }

    const handleSubmit = async () => {
            try {
                if (checkFields() && window.ethereum) {
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

                    const newPackage = {
                        'message': stringifyMessage,
                        'sign': signature,
                        'docAddress': accounts[0],
                        'drugListState': dlStringify,
                        'dLLastModifiedBy': accounts[0],
                        'dLSign': dlSignature
                    };

                    const encryptorInstance = new JSEncrypt();
                    encryptorInstance.setPublicKey(clientPublicKey);
                    const encryptedPack = encryptorInstance.encrypt(JSON.stringify(newPackage));

                    await contract.methods.insertData(key, encryptedPack).send({ from: accounts[0] });

                    toast.success("Entry successfully added!");
                    setFullName('');
                    setIdentityNumber('');
                    setConsultType('');
                    setDescription('');
                    setClientPublicKey('');
                    setConsultDate('');
                    setDrugsList([{'name': '', 'pickedUp': false}]);
                }
            } catch (err) {
                toast.error(err);
            }
    };

    try {
        return (
            <div className='column'>
                <h2>Insert patient data</h2>
                    <div className='formInfo'>
                        <label htmlFor='name'>Name</label>
                        <input type="text"
                            name="name"
                            placeholder="e.g. John Smith"
                            maxLength="20"
                            value={fullName}
                            onChange={handleFullName}
                            style={outlineCName} />
                        {errorName && <p className='pColor'>{errorName}</p>}

                        <label htmlFor='identityNumber'>Identity Number</label>
                        <input type="text"
                            name="idno"
                            placeholder="e.g. 1234567891012"
                            maxLength="13"
                            value={identityNumber}
                            onChange={handleIdentityNumber}
                            style={outlineID} />
                        {errorID && <p className='pColor'>{errorID}</p>}

                        <label htmlFor='consultType'>Consult Type</label>
                        <input type="text"
                            name="ct"
                            placeholder="e.g. cardiac control"
                            maxLength="20"
                            value={consultType}
                            onChange={handleConsultType}
                            style={outlineCT} />
                        {errorCT && <p className='pColor'>{errorCT}</p>}

                        <label htmlFor='description'>Description</label>
                        <textarea name="description"
                            placeholder='e.g The patient stated chest pains...'
                            maxLength="500"
                            value={description}
                            onChange={handleDescription}
                            style={outlineDescription} />
                        {errorDescription && <p className='pColor'>{errorDescription}</p>}

                        <label htmlFor='date'>Date</label>
                        <input type="date"
                            id="cdate"
                            name="cdate"
                            value={consultDate}
                            onChange={handleConsultDate}
                            style={outlineDate} />
                        {errorDate && <p className='pColor'>{errorDate}</p>}

                        <label>Medicines list</label>
                        {renderDrugsList()}
                        <button type="button" onClick={handleAddDrug}>Add Drug</button>

                        <label htmlFor='clientPublicKey'>Client public key</label>
                        <textarea name="clientPublicKey"
                            placeholder='e.g -----BEGIN PUBLIC KEY-----
                                            MIIWqAIBAAKC...
                                            -----END PUBLIC KEY-----'
                            rows={10}
                            value={clientPublicKey}
                            onChange={handleclientPublicKey}
                            style={outlinePubKey} />
                        {errorPubKey && <p className='pColor'>{errorPubKey}</p>}

                        <button onClick={handleSubmit}> Insert </button>
                    </div>
                <ToastContainer />
            </div>
        );
    } catch(error) {
        toast.error(error);
        return null;
    }
}

export default DoctorInsert;