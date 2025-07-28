# Medical Records Management System

This project is a decentralized application (DApp) for managing medical records securely and efficiently. It leverages blockchain technology to ensure data integrity, transparency, and privacy. The system is built using React for the frontend and Solidity for the smart contract backend, with Hardhat as the development environment.

## Features

- **Role-Based Access Control**: Different roles such as Admin, Doctor, Client, and Pharmacist with specific permissions.
- **Data Management**:
  - Doctors can insert new medical records.
  - Pharmacists can update or mark prescriptions as outdated.
  - Clients can view their medical records.
- **Blockchain-Powered**: Ensures data immutability and secure transactions.
- **React Frontend**: A user-friendly interface for interacting with the system.

## Technologies Used

- **Frontend**: React, React Router
- **Backend**: Solidity smart contracts
- **Development Tools**: Hardhat, TypeScript
- **Blockchain Interaction**: Ethers.js, Web3.js
- **Testing**: Chai, Mocha
- **Environment Management**: dotenv

## Project Structure

- `contracts/`: Contains the Solidity smart contract `MedicalRecordsContract.sol`.
- `scripts/`: Deployment scripts for the smart contract.
- `src/`: React frontend code, organized into components for different user roles (Admin, Doctor, Client, Pharmacist).
- `public/`: Static assets for the React app.
- `test/`: Test files for the smart contract.

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Hardhat
- A blockchain wallet (e.g., MetaMask)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/AndreiNoroc/medical-records.git
   cd medical-records
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:
   ```
   COINMARKET_API_KEY=your_coinmarketcap_api_key
   ```

### Running the Application

1. Start the local blockchain:
   ```bash
   npx hardhat node
   ```

2. Deploy the smart contract:
   ```bash
   npx hardhat run scripts/deploy.ts --network localhost
   ```

3. Start the React development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Testing

Run the test suite to ensure everything is working correctly:
```bash
npx hardhat test
```

## Smart Contract Overview

The `MedicalRecordsContract` includes the following functionalities:

- **Insert Data**: Allows doctors to add new medical records.
- **Update Data**: Enables pharmacists to update existing records.
- **Read Data**: Allows clients to view their records.
- **Outdate Data**: Lets pharmacists mark prescriptions as outdated.

## Deployment

To deploy the application to a live network:

1. Update the `hardhat.config.ts` file with the desired network configuration.
2. Run the deployment script:
   ```bash
   npx hardhat run scripts/deploy.ts --network <network-name>
   ```

## Learn More

- [React Documentation](https://reactjs.org/)
- [Hardhat Documentation](https://hardhat.org/)
- [Solidity Documentation](https://docs.soliditylang.org/)

