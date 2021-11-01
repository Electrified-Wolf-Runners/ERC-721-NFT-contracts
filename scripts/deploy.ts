import { ethers } from "hardhat";

async function main() {
  const vrf = "0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B";
  const link = "0x01BE23585060835E02B77ef475b0Cc51aA1e0709";
  const key_hash = "0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311";

  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  console.log("Deploying cryptoGogo with address:", deployerAddress);

  const myHeroFactory = await ethers.getContractFactory("MyHero");
  const myHero = await myHeroFactory.deploy(
  vrf,
  link,
  key_hash
  );

  await myHero.deployed();

  console.log("myHero deployed at", myHero.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
