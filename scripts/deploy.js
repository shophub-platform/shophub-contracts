const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log(`\nDeploying MockUSDT to network: ${network.name}`);
  console.log("─".repeat(50));

  // Dobij deploy-era (prvi account iz konfiguracije)
  // Na Sepolia - ovo je tvoj MetaMask wallet
  // Na localhost - Hardhat automatski kreira test wallet-e
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer address: ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Deployer balance: ${ethers.formatEther(balance)} ETH`);

  // Deploy kontrakta
  // getContractFactory je kao učitavanje Spring bean definicije
  // deploy() je kao instanciranje bean-a (šalje transakciju na mrežu)
  console.log("\nDeploying MockUSDT...");
  const MockUSDT = await ethers.getContractFactory("MockUSDT");
  const mockUSDT = await MockUSDT.deploy();

  // Čekaj da transakcija bude potvrđena na mreži
  await mockUSDT.waitForDeployment();

  const contractAddress = await mockUSDT.getAddress();
  console.log(`✓ MockUSDT deployed to: ${contractAddress}`);

  // Proveri početni balans deploy-era
  const deployerBalance = await mockUSDT.balanceOf(deployer.address);
  console.log(`✓ Deployer token balance: ${ethers.formatUnits(deployerBalance, 18)} mUSDT`);

  // ─── Sačuvaj adresu i ABI ────────────────────────────────────────────────
  // Ovo je ključno - backend i frontend trebaju ove podatke da bi
  // komunicirali sa kontraktom. Kao što čuvaš API URL u config fajlu.

  const deploymentInfo = {
    network: network.name,
    contractAddress: contractAddress,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    transactionHash: mockUSDT.deploymentTransaction()?.hash,
  };

  // Kreiraj deployments/ folder ako ne postoji
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Sačuvaj deployment info
  const deploymentPath = path.join(deploymentsDir, `${network.name}.json`);
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n✓ Deployment info saved to: deployments/${network.name}.json`);

  // Sačuvaj ABI (iz kompajliranog artifakta)
  const artifact = await artifacts.readArtifact("MockUSDT");
  const abiPath = path.join(deploymentsDir, "MockUSDT.abi.json");
  fs.writeFileSync(abiPath, JSON.stringify(artifact.abi, null, 2));
  console.log(`✓ ABI saved to: deployments/MockUSDT.abi.json`);

  // Prikaz instrukcija za sledeće korake
  console.log("\n" + "─".repeat(50));
  console.log("Next steps:");
  console.log(`  1. Copy contract address to shop-backend config:`);
  console.log(`     MOCKUSDT_ADDRESS=${contractAddress}`);
  console.log(`  2. Copy ABI to shop-frontend/src/assets/`);
  if (network.name === "sepolia") {
    console.log(`  3. View on Etherscan:`);
    console.log(`     https://sepolia.etherscan.io/address/${contractAddress}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
