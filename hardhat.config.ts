import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
// import "hardhat-gas-reporter";
import "./tasks/gogo";
import "solidity-coverage";
import { HardhatUserConfig } from "hardhat/config";
import * as dotenv from "dotenv";
dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config: HardhatUserConfig = {
  // Your type-safe config goes here
  solidity: {
    compilers: [
      {
        version: "0.6.12",
        settings: {},
      },
            {
        version: "0.8.6",
        settings: {},
      }
    ],
  },
  networks: {
    matic: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [process.env.PRIVATE_KEY as string]
    },
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/e0f9e0acea7f4e2a90edba953bbf1277",
      accounts: [process.env.PRIVATE_KEY as string]
    }
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
export default config;
