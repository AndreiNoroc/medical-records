import { ethers } from "hardhat";

async function main() {
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
  const unlockTime = currentTimestampInSeconds + ONE_YEAR_IN_SECS;

  const lockedAmount = ethers.utils.parseEther("1");

  const Lock = await ethers.getContractFactory("Lock");
  const lock = await Lock.deploy(unlockTime, { value: lockedAmount });
  await lock.deployed();

  //console.log(`Lock with 1 ETH and unlock timestamp ${unlockTime} deployed to ${lock.address}`);

  const Data = await ethers.getContractFactory("Data");
  const data = await Data.deploy();
  await data.deployed();

  const DoctorDB = await ethers.getContractFactory("DoctorDB");
  const doctorDb = await DoctorDB.deploy();
  await doctorDb.deployed();

  const Doctor = await ethers.getContractFactory("Doctor");
  const doctor = await Doctor.deploy();
  await doctor.deployed();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
