import React, { useState } from "react";
import ClientInterface from "../client/ClientInterface";
import DoctorInterface from "../doctor/DoctorInterface";
import AdminInterface from "../admin/AdminInterface";
import PharmacistInterface from "../pharmacist/PharmacistInterface";
import Web3 from 'web3';
import MedicalRecordsContract from '../../artifacts/contracts/MedicalRecordsContract.sol/MedicalRecordsContract.json';

const Home = () => {
    const [isInterface , setIsInterface] = useState('');
    const [account, setAccount] = useState('');

    React.useEffect(() => {
        const handleAccountsChanged = (accounts) => {
            if (accounts.length > 0) {
                setAccount(accounts[0]);
            } else {
                setAccount('');
            }
        };
    
        // Subscribe to MetaMask account changes
        window.ethereum.on('accountsChanged', handleAccountsChanged);
    
        // Unsubscribe from MetaMask account changes on component unmount
        return () => {
            window.ethereum.off('accountsChanged', handleAccountsChanged);
        };
    }, []);

    React.useEffect(() => {
        const getInterface = async () => {
            const web3 = new Web3(window.ethereum);                
            await window.ethereum.request({method: 'eth_requestAccounts'});
            const accounts = await web3.eth.getAccounts();

            const contract = new web3.eth.Contract(MedicalRecordsContract.abi, web3.utils.toChecksumAddress(process.env.REACT_APP_CONTRACT_ADDRESS));

            const transaction = await contract.methods.isEntity(accounts[0]).call({ from: accounts[0] });

            console.log(transaction);

            if (transaction === "doctor") {
                setIsInterface(<DoctorInterface/>);
            } else if (transaction === "client") {
                setIsInterface(<ClientInterface/>);
            } else if (transaction === "pharmacist") {
                setIsInterface(<PharmacistInterface/>);
            } else if (transaction === "admin") {
                setIsInterface(<AdminInterface/>);
            } else {
                setIsInterface(<p> Please use a registered account </p>);
            }
        };

        getInterface();
    }, [account]);

    return (
        <div>
            <h1>Home</h1>
            <div>
                { isInterface }
            </div>
        </div>
    );
};

export default Home;
