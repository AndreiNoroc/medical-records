import React, { useState } from "react";
import ClientInterface from "../client/ClientInterface";
import DoctorInterface from "../doctor/DoctorInterface";
import AdminInterface from "../admin/AdminInterface";
import PharmacistInterface from "../pharmacist/PharmacistInterface";
import Web3 from 'web3';
import MedicalRecordsContract from '../../artifacts/contracts/MedicalRecordsContract.sol/MedicalRecordsContract.json';
import "./Home.css";

const Home = () => {
    const [isInterface , setIsInterface] = useState('');
    const [account, setAccount] = useState('');

    React.useEffect(() => {
        try {
            const handleAccountsChanged = (accounts) => {
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                } else {
                    setAccount('');
                }
            };
        
            window.ethereum.on('accountsChanged', handleAccountsChanged);
        
            return () => {
                window.ethereum.off('accountsChanged', handleAccountsChanged);
            };
        } catch (error) {
            console.log(error);
        } 
    }, []);

    React.useEffect(() => {
        const getInterface = async () => {
            if (window.ethereum) {
                const web3 = new Web3(window.ethereum);                
                await window.ethereum.request({method: 'eth_requestAccounts'});
                const accounts = await web3.eth.getAccounts();

                const contract = new web3.eth.Contract(MedicalRecordsContract.abi, web3.utils.toChecksumAddress(process.env.REACT_APP_CONTRACT_ADDRESS));

                const entity = await contract.methods.isEntity(accounts[0]).call({ from: accounts[0] });

                if (entity === web3.utils.soliditySha3(DoctorInterface.name).toString()) {
                    setIsInterface(<DoctorInterface/>);
                } else if (entity === web3.utils.soliditySha3(ClientInterface.name).toString()) {
                    setIsInterface(<ClientInterface/>);
                } else if (entity === web3.utils.soliditySha3(PharmacistInterface.name).toString()) {
                    setIsInterface(<PharmacistInterface/>);
                } else if (entity === web3.utils.soliditySha3(AdminInterface.name).toString()) {
                    setIsInterface(<AdminInterface/>);
                } else {
                    setIsInterface(<p style={{marginLeft: '30px'}}> Please use a registered account </p>);
                }
            }
        };

        getInterface();
    }, [account]);

    try {
        return (
            <div>
                <div id="appheader">
                    <h1>FutureMed</h1>
                </div>
                <div>
                    { isInterface }
                </div>
            </div>
        );
    } catch(error) {
        console.log(error);
        return null
    }
};

export default Home;
