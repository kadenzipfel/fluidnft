// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  // const Greeter = await hre.ethers.getContractFactory("Greeter");
  // const greeter = await Greeter.deploy("Hello, Hardhat!");

  // await greeter.deployed();

  // console.log("Greeter deployed to:", greeter.address);

  // Get and deploy LendingPool contract
  const LendingPool = await hre.ethers.getContractFactory('LendingPool');
  const lendingPool = await LendingPool.deploy();
  await lendingPool.deployed();
  console.log("LendingPool deployed to:", lendingPool.address);

  // Get and deploy CollateralManager contract
  const CollateralManager = await hre.ethers.getContractFactory('CollateralManager');
  const collateralManager = await CollateralManager.deploy();
  await collateralManager.deployed();
  console.log("CollateralManager deployed to:", collateralManager.address);

  // Link CollateralManager to LendingPool
  await lendingPool.setCollateralManagerAddress(collateralManager.address);
  let res = await lendingPool.getCollateralManagerAddress();
  console.log("Linked LendingPool to CollateralManager address:", res);

  // Get and deploy AssetToken contracts
  const assetTokenSupply = hre.ethers.utils.parseEther("3000.0");
  const assetTokenInitialBalance = hre.ethers.utils.parseEther("100.0");
  const AssetToken = await hre.ethers.getContractFactory('AssetToken');
  // DAI:
  assetTokenDAI = await AssetToken.deploy('DAI Token', 'DAI', assetTokenSupply);
  await assetTokenDAI.deployed();
  console.log("assetTokenDAI deployed to:", assetTokenDAI.address);
  // ETH:
  assetTokenETH = await AssetToken.deploy('ETH Token', 'ETH', assetTokenSupply);
  await assetTokenETH.deployed();
  console.log("assetTokenETH deployed to:", assetTokenETH.address);
  // USDC:
  assetTokenUSDC = await AssetToken.deploy('USDC Token', 'USDC', assetTokenSupply);
  await assetTokenUSDC.deployed();
  console.log("assetTokenUSDC deployed to:", assetTokenUSDC.address);

  // Get and deploy nToken contracts
  NToken = await hre.ethers.getContractFactory('NToken');
  // DAI:
  nTokenDAI = await NToken.deploy('DAI nToken', 'nDAI');
  await nTokenDAI.deployed();
  console.log("nTokenDAI deployed to:", nTokenDAI.address);
  // ETH:
  nTokenETH = await NToken.deploy('ETH nToken', 'nETH');
  await nTokenETH.deployed();
  console.log("nTokenETH deployed to:", nTokenETH.address);
  // USDC:
  nTokenUSDC = await NToken.deploy('USDC nToken', 'nUSDC');
  await nTokenUSDC.deployed();
  console.log("nTokenUSDC deployed to:", nTokenUSDC.address);

  // Asign nToken minter/burner roles to LendingPool
  // DAI:
  await nTokenDAI.setMinter(lendingPool.address);
  await nTokenDAI.setBurner(lendingPool.address);
  // ETH:
  await nTokenETH.setMinter(lendingPool.address);
  await nTokenETH.setBurner(lendingPool.address);
  // USDC:
  await nTokenUSDC.setMinter(lendingPool.address);
  await nTokenUSDC.setBurner(lendingPool.address);

  // Get and deploy debtToken contracts
  DebtToken = await hre.ethers.getContractFactory('DebtToken');
  // DAI:
  debtTokenDAI = await DebtToken.deploy('DAI debtToken', 'debtDAI');
  await debtTokenDAI.deployed();  
  console.log("debtTokenDAI deployed to:", debtTokenDAI.address);
  // ETH:
  debtTokenETH = await DebtToken.deploy('ETH debtToken', 'debtETH');
  await debtTokenETH.deployed();  
  console.log("debtTokenETH deployed to:", debtTokenETH.address);
  // USDC:
  debtTokenUSDC = await DebtToken.deploy('USDC debtToken', 'debtUSDC');
  await debtTokenUSDC.deployed();  
  console.log("debtTokenUSDC deployed to:", debtTokenUSDC.address);

  // Asign debtToken minter/burning roles to LendingPool
  // DAI:
  await debtTokenDAI.setMinter(lendingPool.address);
  await debtTokenDAI.setBurner(lendingPool.address);
  // ETH:
  await debtTokenETH.setMinter(lendingPool.address);
  await debtTokenETH.setBurner(lendingPool.address);
  // USDC:
  await debtTokenUSDC.setMinter(lendingPool.address);
  await debtTokenUSDC.setBurner(lendingPool.address);

  // Initialize Reserves
  // DAI:
  lendingPool.initReserve(assetTokenDAI.address, nTokenDAI.address, debtTokenDAI.address);
  // ETH:
  lendingPool.initReserve(assetTokenETH.address, nTokenETH.address, debtTokenETH.address);
  // USDC:
  lendingPool.initReserve(assetTokenUSDC.address, nTokenUSDC.address, debtTokenUSDC.address);
  console.log('Initialized Reserves');

  // Get and deploy NFT contracts
  NFT = await hre.ethers.getContractFactory('NFT');
  // PUNK:
  nftPUNK = await NFT.deploy('Cryptopunks', 'PUNK');
  await nftPUNK.deployed();
  console.log("NFT PUNK deployed to:", nftPUNK.address);
  // BAYC:
  nftBAYC = await NFT.deploy('Bored Ape Yacht Club', 'BAYC');
  await nftBAYC.deployed();
  console.log("NFT BAYC deployed to:", nftBAYC.address);

  // Set NFT liquidation thresholds
  collateralManager.setLiquidationThreshold(nftPUNK.address, 150); // in percent
  collateralManager.setLiquidationThreshold(nftBAYC.address, 150); // in percent

  // Whitelist NFT
  collateralManager.updateWhitelist(nftPUNK.address, true);
  collateralManager.updateWhitelist(nftBAYC.address, true);

  // Set NFT-specific APRs
  collateralManager.setInterestRate(nftPUNK.address, 18);
  collateralManager.setInterestRate(nftBAYC.address, 20);

  // Get Signers
  [acc0, acc1, acc2] = await hre.ethers.getSigners();

  // Transfer funds to acc1 and acc2
  await assetTokenDAI.transfer(acc1.address, assetTokenInitialBalance);
  await assetTokenDAI.transfer(acc2.address, assetTokenInitialBalance);
  await assetTokenETH.transfer(acc1.address, assetTokenInitialBalance);
  await assetTokenETH.transfer(acc2.address, assetTokenInitialBalance);
  await assetTokenUSDC.transfer(acc1.address, assetTokenInitialBalance);
  await assetTokenUSDC.transfer(acc2.address, assetTokenInitialBalance);

  // Mint NFTs to acc1 and acc2
  const accDict = {0: acc0, 1: acc1, 2: acc2}
  const nftDict = {"PUNK": nftPUNK, "BAYC": nftBAYC}
  async function mint(nftName, accNum, tokenId) {
    const nft = nftDict[nftName];
    const acc = accDict[accNum];
    await nft.mint(acc.address, tokenId);
    console.log(`${nftName} #${tokenId} minted to acc${accNum} (address: ${acc.address})`)
  }
  // PUNK:
  await mint("PUNK", 0, 0);
  await mint("PUNK", 0, 1);
  await mint("PUNK", 1, 2);
  await mint("PUNK", 1, 3);
  await mint("PUNK", 2, 4);
  await mint("PUNK", 2, 5);
  // BAYC: 
  await mint("BAYC", 0, 0);
  await mint("BAYC", 0, 1);
  await mint("BAYC", 1, 2);
  await mint("BAYC", 1, 3);
  await mint("BAYC", 2, 4);
  await mint("BAYC", 2, 5); 
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
