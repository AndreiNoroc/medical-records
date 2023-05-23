import { useState } from "react";
import Web3 from 'web3';
import MedicalRecordsContract from '../../artifacts/contracts/MedicalRecordsContract.sol/MedicalRecordsContract.json';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminInsert = () => {
    const [accountAddress, setAccountAddress] = useState('');
    const [errorAccountAddress, setErrorAccountAddress] = useState('');
    const [outlineAccountAddress, setOutlineAccountAddress] = useState({outline: 'none'});

    const [selectedOption, setSelectedOption] = useState('');
    const [errorSelectedOption, setErrorSelectedOption] = useState('');
    const [outlineSelectedOption, setOutlineSelectedOption] = useState({outline: 'none'});

    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
    };

    const handleAccountAddress = (event) => {
        setAccountAddress(event.target.value);
    };

    const checkFields = () => {
        let ok = true;

        if (accountAddress) {
            if (accountAddress.length !== 42) {
                setErrorAccountAddress('The account address length may be 42!');
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
            setErrorAccountAddress('This field may not be blank!');
            setOutlineAccountAddress({
                outline: 'red solid 1px',
            });
            ok = false;
        }

        if (selectedOption && selectedOption !== "defaultop") {
            setErrorSelectedOption('');
            setOutlineSelectedOption({
                outline: 'none',
            });
            ok = ok && true;
        } else {
            setErrorSelectedOption('An option may be selected!');
            setOutlineSelectedOption({
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

                    console.log(selectedOption);
                    const hashSelectedOption = web3.utils.soliditySha3(selectedOption).toString();
                    await contract.methods.insertEntity(hashSelectedOption, accountAddress).send({ from: accounts[0] });

                    toast.success("Member successfully inserted!");

                    setSelectedOption("defaultop");
                    setAccountAddress("");
                }
            } catch (error) {
                toast.error(error.message);
                console.log(error.message);
            }
    };

    try {
        return (
            <div className="column">
                <div className="formInfo">
                    <label htmlFor='accAdd'>Account address</label>
                    <input type="text"
                        name="accAdd"
                        maxLength={42}
                        placeholder="e.g. 0x31234321..."
                        value={accountAddress}
                        onChange={handleAccountAddress}
                        style={outlineAccountAddress} />
                    {errorAccountAddress && <p className='pColor'>{errorAccountAddress}</p>}

                    <label htmlFor='entityType'>Type</label>
                    <select name="entities"
                        value={selectedOption}
                        onChange={handleOptionChange}
                        style={outlineSelectedOption} >
                        <option value="defaultop">Select an option</option>
                        <option value="doctor">Doctor</option>
                        <option value="client">Client</option>
                        <option value="pharmacist">Pharmacist</option>
                    </select>
                    {errorSelectedOption && <p className='pColor'>{errorSelectedOption}</p>}

                    <button onClick={handleSubmit}> Insert </button>
                    <ToastContainer />
                </div>
            </div>
        );
    } catch (error) {
        console.log(error);
        return null;
    }
};

export default AdminInsert;
