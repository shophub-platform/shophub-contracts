# shophub-contracts

This repository holds the Solidity smart contracts for the ShopHub platform, forming the Web3 and blockchain layer that lets customers pay for items with cryptocurrency in the `shop` application. It contains `MockUSDT`, an ERC20 token that simulates real USDT for testing purposes on the Ethereum Sepolia testnet, since the project specification does not require mainnet support.

## Role in the architecture

When a customer pays for items in the `shop` application, the transaction is sent through a MetaMask wallet as a transfer of `MockUSDT` tokens to the shop's wallet address, which was defined when the shop was created in ShopHub and is managed through the `Wallet` custom resource in `shop-operator`. The `listener` service inside `shop-backend` watches Transfer events emitted by this contract on the blockchain and automatically confirms orders based on them. After deployment, the contract's address and ABI are passed into the `shop-backend` configuration through the `MOCKUSDT_ADDRESS` environment variable and into `shop-frontend` through an ABI file.

## Structure

`contracts/MockUSDT.sol` is an ERC20 token built on OpenZeppelin's `ERC20` and `Ownable` contracts, with 18 decimals and an initial supply of 1,000,000 mUSDT minted to the deployer. It exposes a `mint()` function restricted to the owner and a public `faucet()` function that lets anyone claim 1000 mUSDT for testing. `scripts/deploy.js` is the Hardhat deploy script, which after deployment records the contract address and ABI into `deployments/<network>.json` and `deployments/MockUSDT.abi.json`. `test/MockUSDT.test.js` contains the contract's tests. `hardhat.config.js` configures the networks: a local Hardhat network (chain ID 31337), a `localhost` node, and the `sepolia` testnet (chain ID 11155111, with RPC URL and private key read from `.env`). `.env.example` is a template for `SEPOLIA_RPC_URL`, `PRIVATE_KEY`, and `ETHERSCAN_API_KEY`.

## Main features

The project can deploy the ERC20 test token (mock USDT) to a local Hardhat network or to the Sepolia testnet. Its faucet function lets anyone obtain test tokens without needing real funds. It optionally supports contract verification on Etherscan through `ETHERSCAN_API_KEY`. It saves deployment metadata, including address, network, deployer, and transaction hash, along with the ABI, so `shop-backend` and `shop-frontend` can integrate with the deployed contract.

## Technical stack

Contracts are written in Solidity 0.8.24 using OpenZeppelin Contracts 5.x (ERC20, Ownable) for a well tested, standard token implementation. Hardhat, through `@nomicfoundation/hardhat-toolbox`, serves as the development environment for compiling, testing, and deploying to a local test network. Supported networks are the Hardhat in memory network for tests and the Ethereum Sepolia testnet for a more realistic test deployment. It is a Node.js and npm project, with a `package.json` exposing the scripts `compile`, `test`, `deploy:sepolia`, `deploy:local`, `node`, and `clean`. Continuous integration runs through `.github/workflows/ci.yml` and follows Conventional Commits, in line with the rest of the platform.
