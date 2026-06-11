const { ethers } = require("hardhat")

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log("Deploying with:", deployer.address)

  const MantlicSwap = await ethers.getContractFactory("MantlicSwap")
  const swap = await MantlicSwap.deploy(deployer.address, 30) // 0.3% fee
  await swap.waitForDeployment()
  
  const address = await swap.getAddress()
  console.log("MantlicSwap deployed to:", address)
  
  // Verify by reading a view function
  const fee = await swap.feeBps()
  console.log("Fee BPS:", fee)
}

main().catch(console.error)