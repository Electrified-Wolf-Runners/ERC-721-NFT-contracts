import "@nomiclabs/hardhat-ethers";
import { ethers } from "hardhat";
import { Signer, BigNumber, constants } from "ethers";
import { expect } from "chai";
import { GoGoToken } from "../typechain/GoGoToken";
import { TestUSDC } from "../typechain/TestUSDC";
import { TokenSaleMock } from "../typechain/TokenSaleMock";
import { solidity } from "ethereum-waffle";
import { increaseTime, lastBlock } from "./utils";
import chai from "chai";

chai.use(solidity);

const BN = BigNumber.from;

describe("Test Token Sale", function () {
  let owner: Signer, account1: Signer, account2: Signer, account3: Signer;

  const decimals: BigNumber = BN(10).pow(BN(18));

  let GoGoToken: GoGoToken;
  let TestUSDC: TestUSDC;
  let sale: TokenSaleMock;
  const price = 1000;
  const maxLimit = 6000;
  const cap = 100000;
  const amount = 100;
  const multiplier = 30;
  let totalBalance: BigNumber;

  beforeEach(async () => {
    [owner, account1, account2, account3] = await ethers.getSigners();
    const GoGoTokenFactory = await ethers.getContractFactory("GoGoToken");
    GoGoToken = (await GoGoTokenFactory.deploy()) as GoGoToken;

    const TestUSDCFactory = await ethers.getContractFactory("TestUSDC");
    TestUSDC = (await TestUSDCFactory.deploy()) as TestUSDC;

    const block: any = await lastBlock();
    sale = (await (
      await ethers.getContractFactory("TokenSaleMock")
    ).deploy(
      GoGoToken.address,
      price,
      maxLimit,
      cap,
      parseInt(block.timestamp) + 100,
      parseInt(block.timestamp) + 200
    )) as TokenSaleMock;

    await sale.setUSDCAddress(TestUSDC.address);
    await TestUSDC.transfer(
      await account1.getAddress(),
      BN(1000).mul(decimals)
    );
    totalBalance = await GoGoToken.balanceOf(await owner.getAddress());
  });

  describe("Token Sale buy()", function () {
    it("Test Token Sale buy revert which exceeds maxbuyamount", async () => {
      await GoGoToken.transfer(sale.address, cap);
      expect(await GoGoToken.balanceOf(sale.address)).equal(cap);
      expect(await sale.priceinWeis()).eq(price);

      await sale.connect(account1).buy(amount, { value: amount * price });
      await expect(
        sale.connect(account1).buy(maxLimit, { value: maxLimit * price })
      ).to.be.reverted;
    });

    it("Test Token Sale buy success and claim", async () => {
      await GoGoToken.transfer(sale.address, cap);
      const vestAdd = await account1.getAddress();
      expect(await GoGoToken.balanceOf(sale.address)).equal(cap);
      expect(await sale.priceinWeis()).eq(price);

      await sale.connect(account1).buy(amount, { value: amount * price });
      await increaseTime(100);
      await sale.connect(account1).claim();
      expect(await GoGoToken.balanceOf(vestAdd)).eq(
        (amount * multiplier) / 100
      );
      await increaseTime(100);
      await sale.connect(account1).unLock();
      expect(await GoGoToken.balanceOf(vestAdd)).eq(amount);
    });
  });

  describe("Token Sale buyByUSDC()", function () {
    it("Test Token Sale buyByUSDC revert without allowance", async () => {
      await GoGoToken.transfer(sale.address, cap);

      await expect(sale.connect(account1).buyByUSDC(amount)).to.be.revertedWith(
        "ERC20: transfer amount exceeds allowance"
      );
    });

    it("Test Token Sale buyByUSDC revert which exceeds maxbuyamount", async () => {
      await GoGoToken.transfer(sale.address, cap);

      await TestUSDC.connect(account1).approve(
        sale.address,
        constants.MaxUint256
      );
      await sale.connect(account1).buyByUSDC(amount);
      await expect(sale.connect(account1).buyByUSDC(maxLimit)).to.be.reverted;
    });

    it("Test Token Sale buyByUSDC success", async () => {
      await GoGoToken.transfer(sale.address, cap);
      const vestAdd = await account1.getAddress();

      await TestUSDC.connect(account1).approve(sale.address, amount * price);
      await sale.connect(account1).buyByUSDC(amount);

      await increaseTime(1000);
      await sale.connect(account1).claim();
      expect(await GoGoToken.balanceOf(vestAdd)).eq(
        (amount * multiplier) / 100
      );
    });
  });

  describe("Token Sale getRefund()", function () {
    it("getRefund revert whitout refundable flag", async () => {
      await GoGoToken.transfer(sale.address, cap);

      await TestUSDC.connect(account1).approve(
        sale.address,
        constants.MaxUint256
      );
      await sale.connect(account1).buyByUSDC(amount);
      await expect(sale.connect(account1).getRefund()).to.be.revertedWith(
        "Cannot get refunded before the sale ends"
      );
      await increaseTime(1000);
      await expect(sale.connect(account1).getRefund()).to.be.revertedWith(
        "Not possible to refund now"
      );
    });

    it("getRefund success", async () => {
      await GoGoToken.transfer(sale.address, cap);

      await TestUSDC.connect(account1).approve(
        sale.address,
        constants.MaxUint256
      );
      await sale.connect(account1).buyByUSDC(amount);
      await increaseTime(1000);
      await sale.setRefundable(true);
      const balanceBefore = await TestUSDC.balanceOf(
        await account1.getAddress()
      );
      await sale.connect(account1).getRefund();
      const balanceAfter = await TestUSDC.balanceOf(
        await account1.getAddress()
      );
      expect(balanceAfter).eq(balanceBefore.add(amount * price));
    });
  });

  describe("Token Sale endSale()", function () {
    it("endSale revert without ownership", async () => {
      await GoGoToken.transfer(sale.address, cap);
      await expect(sale.connect(account1).endSale()).to.be.reverted;
    });

    it("endSale success", async () => {
      await GoGoToken.transfer(sale.address, cap);

      await sale.endSale();
      expect(await GoGoToken.balanceOf(await owner.getAddress())).eq(
        totalBalance
      );
    });
  });
});
