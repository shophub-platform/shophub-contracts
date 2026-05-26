const { expect } = require("chai");
const { ethers } = require("hardhat");

// Hardhat testovi su kao JUnit testovi u Javi
// describe() = @Nested klasa ili test klasa
// it() = @Test metod
// expect() = kao Assertions.assertEquals() iz JUnit / AssertJ

describe("MockUSDT", function () {
  // Test fixtures - kao @BeforeEach u JUnit
  let mockUSDT;
  let owner;
  let user1;
  let user2;

  // Pokreće se pre svakog testa - deploy svežeg kontrakta
  beforeEach(async function () {
    // Dobij test account-e koje Hardhat automatski kreira
    [owner, user1, user2] = await ethers.getSigners();

    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    mockUSDT = await MockUSDT.deploy();
  });

  describe("Deployment", function () {
    it("Should set correct token name and symbol", async function () {
      expect(await mockUSDT.name()).to.equal("Mock USDT");
      expect(await mockUSDT.symbol()).to.equal("mUSDT");
    });

    it("Should have 18 decimals", async function () {
      expect(await mockUSDT.decimals()).to.equal(18);
    });

    it("Should mint initial supply to deployer", async function () {
      const initialSupply = ethers.parseUnits("1000000", 18); // 1,000,000 mUSDT
      const ownerBalance = await mockUSDT.balanceOf(owner.address);
      expect(ownerBalance).to.equal(initialSupply);
    });

    it("Should set deployer as owner", async function () {
      expect(await mockUSDT.owner()).to.equal(owner.address);
    });
  });

  describe("Mint", function () {
    it("Owner can mint tokens to any address", async function () {
      const amount = ethers.parseUnits("500", 18);
      await mockUSDT.mint(user1.address, amount);

      expect(await mockUSDT.balanceOf(user1.address)).to.equal(amount);
    });

    it("Non-owner cannot mint tokens", async function () {
      const amount = ethers.parseUnits("500", 18);
      // expect(...).to.be.revertedWithCustomError je kao assertThrows u JUnit
      await expect(
        mockUSDT.connect(user1).mint(user1.address, amount)
      ).to.be.revertedWithCustomError(mockUSDT, "OwnableUnauthorizedAccount");
    });
  });

  describe("Transfer", function () {
    it("Should transfer tokens between accounts", async function () {
      const amount = ethers.parseUnits("100", 18);

      // Owner šalje 100 mUSDT user1-u
      await mockUSDT.transfer(user1.address, amount);

      expect(await mockUSDT.balanceOf(user1.address)).to.equal(amount);
    });

    it("Should fail if sender has insufficient balance", async function () {
      const amount = ethers.parseUnits("100", 18);

      // user1 nema tokene, ne može da šalje
      await expect(
        mockUSDT.connect(user1).transfer(user2.address, amount)
      ).to.be.revertedWithCustomError(mockUSDT, "ERC20InsufficientBalance");
    });
  });

  describe("Faucet", function () {
    it("Anyone can call faucet to get 1000 mUSDT", async function () {
      await mockUSDT.connect(user1).faucet();

      const expected = ethers.parseUnits("1000", 18);
      expect(await mockUSDT.balanceOf(user1.address)).to.equal(expected);
    });

    it("Multiple users can use faucet independently", async function () {
      await mockUSDT.connect(user1).faucet();
      await mockUSDT.connect(user2).faucet();

      const expected = ethers.parseUnits("1000", 18);
      expect(await mockUSDT.balanceOf(user1.address)).to.equal(expected);
      expect(await mockUSDT.balanceOf(user2.address)).to.equal(expected);
    });
  });

  describe("Approve & TransferFrom", function () {
    it("Should allow approved spender to transfer tokens", async function () {
      const amount = ethers.parseUnits("100", 18);

      // Owner odobrava user1-u da troši do 100 mUSDT u njegovo ime
      // Ovo je ključno za plaćanje - shop kontrakt mora biti "approved"
      // pre nego što može da povuče tokene od kupca
      await mockUSDT.approve(user1.address, amount);

      // user1 transferuje 100 mUSDT od owner-a ka user2-u
      await mockUSDT.connect(user1).transferFrom(owner.address, user2.address, amount);

      expect(await mockUSDT.balanceOf(user2.address)).to.equal(amount);
    });
  });
});
