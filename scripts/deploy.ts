import { ethers } from "hardhat";

async function main() {
  const MedicalRecordsContract = await ethers.getContractFactory("MedicalRecordsContract");
  const medicalRecordsContract = await MedicalRecordsContract.deploy();
  await medicalRecordsContract.deployed();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
