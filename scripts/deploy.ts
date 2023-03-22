import { ethers } from "hardhat";

async function main() {
  const MedicalRecordsContract = await ethers.getContractFactory("MedicalRecordsContract");
  const medicalRecordsContract = await MedicalRecordsContract.deploy();
  await medicalRecordsContract.deployed();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
