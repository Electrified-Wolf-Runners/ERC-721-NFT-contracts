import { formatEther } from "ethers/lib/utils";
import { task } from "hardhat/config";

task("verify-sale", "Verify sale contract").setAction(
  async (cliArgs, { ethers, run, network }) => {
    console.log("Network");
    console.log("  ", network.name);

    await run("compile");

    // get signer

    const signer = (await ethers.getSigners())[0];
    console.log("Signer");
    console.log("  at", signer.address);
    console.log("  ETH", formatEther(await signer.getBalance()));

    const saleAddress = "0x8aff5af03edcc2a7736c6ac344039f16faccbb86";
    // TODO cli args
    const _saleToken = "0xf113accC554736e295fAA308dC5c825cD8bea120"; // should be gogoToken address
    const _price = ethers.utils.parseEther("0.2");
    const _maxBuyAmount = ethers.utils.parseEther("50");
    const _cap = ethers.utils.parseEther("20000000");
    const _releaseTime = 1632967698; // 9/30
    const _unlockTime = 1633054098; // 10/1

    const args = {
      _saleToken,
      _price,
      _maxBuyAmount,
      _cap,
      _releaseTime,
      _unlockTime,
    };
    console.log("Task Args");
    console.log(args);

    const tokenSale = await ethers.getContractAt(
      "TokenSale",
      saleAddress,
      signer
    );

    // await hypervisor.deployTransaction.wait(5)
    await run("verify:verify", {
      address: tokenSale.address,
      constructorArguments: Object.values(args),
    });
  }
);
