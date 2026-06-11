const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("MantlicAgentRegistry", function () {
  async function deployRegistry() {
    const [owner, agent1, agent2, other] = await ethers.getSigners()

    const AgentRegistry = await ethers.getContractFactory("MantlicAgentRegistry")
    const registry = await AgentRegistry.deploy()
    await registry.waitForDeployment()

    return { registry, owner, agent1, agent2, other }
  }

  describe("Identity Registry", function () {
    it("should register a new agent", async function () {
      const { registry, owner } = await deployRegistry()

      const tx = await registry.registerAgent(
        "Mantlic Alpha",
        "ipfs://QmAgent001",
        "0x" + "00".repeat(32)
      )
      await tx.wait()

      const agentId = await registry.getAgentByAddress(owner.address)
      expect(agentId).to.equal(1n)

      const agent = await registry.getAgent(1)
      expect(agent.name).to.equal("Mantlic Alpha")
      expect(agent.owner).to.equal(owner.address)
      expect(agent.isActive).to.equal(true)
    })

    it("should not allow duplicate registration", async function () {
      const { registry, owner } = await deployRegistry()

      await registry.registerAgent("Agent 1", "ipfs://Qm1", "0x")
      await expect(
        registry.registerAgent("Agent 2", "ipfs://Qm2", "0x")
      ).to.be.revertedWith("Already registered")
    })

    it("should mint NFT to agent owner", async function () {
      const { registry, owner } = await deployRegistry()

      await registry.registerAgent("Agent NFT Test", "ipfs://QmNFT", "0x")

      expect(await registry.ownerOf(1)).to.equal(owner.address)
      expect(await registry.balanceOf(owner.address)).to.equal(1)
    })

    it("should store token URI", async function () {
      const { registry, owner } = await deployRegistry()
      const metadataURI = "ipfs://QmTestMetadata123"

      await registry.registerAgent("URI Test", metadataURI, "0x")

      expect(await registry.tokenURI(1)).to.equal(metadataURI)
    })

    it("should count total agents", async function () {
      const { registry } = await deployRegistry()
      expect(await registry.totalSupply()).to.equal(0)
      await registry.registerAgent("Agent 1", "ipfs://Qm1", "0x")
      expect(await registry.totalSupply()).to.equal(1)
    })
  })

  describe("Reputation Registry", function () {
    it("should initialize with zero reputation", async function () {
      const { registry } = await deployRegistry()

      await registry.registerAgent("Rep Test", "ipfs://Qm", "0x")

      const score = await registry.getReputationScore(1)
      expect(score).to.equal(0)
    })

    it("should update reputation", async function () {
      const { registry } = await deployRegistry()

      await registry.registerAgent("Rep Update", "ipfs://Qm", "0x")

      await registry.updateReputation(1, 1000)
      const score = await registry.getReputationScore(1)
      expect(score).to.equal(1000)
    })

    it("should get normalized reputation", async function () {
      const { registry } = await deployRegistry()

      await registry.registerAgent("Normalized", "ipfs://Qm", "0x")
      await registry.updateReputation(1, 5000)

      const normalized = await registry.getNormalizedReputation(1)
      expect(normalized).to.equal(5000) // score 5000 + 5000 offset
    })

    it("should record transaction outcomes", async function () {
      const { registry } = await deployRegistry()

      await registry.registerAgent("Tx Test", "ipfs://Qm", "0x")

      await registry.recordTransactionOutcome(1, true, 100)
      const stats = await registry.getAgentStats(1)

      expect(stats[0]).to.equal(1) // totalTx
      expect(stats[1]).to.equal(1) // successfulTx
    })
  })

  describe("Validation Registry", function () {
    it("should create attestation", async function () {
      const { registry, agent1 } = await deployRegistry()

      await registry.registerAgent("Agent 1", "ipfs://Qm1", "0x")
      await registry.connect(agent1).registerAgent("Agent 2", "ipfs://Qm2", "0x")

      await registry.connect(agent1).attestAgent(2, 1, 85, "Good trading performance")

      const attestations = await registry.getAttestations(1)
      expect(attestations.length).to.equal(1)
      expect(attestations[0].score).to.equal(85)
    })

    it("should calculate average attestation score", async function () {
      const { registry, agent1 } = await deployRegistry()

      await registry.registerAgent("Agent 1", "ipfs://Qm1", "0x")
      await registry.connect(agent1).registerAgent("Agent 2", "ipfs://Qm2", "0x")

      await registry.connect(agent1).attestAgent(2, 1, 80, "Note 1")

      const avgScore = await registry.getAverageAttestationScore(1)
      expect(avgScore).to.equal(80)
    })
  })

  describe("Benchmarking", function () {
    it("should record benchmark result", async function () {
      const { registry } = await deployRegistry()

      await registry.registerAgent("Benchmark Test", "ipfs://Qm", "0x")

      await registry.recordBenchmark(
        1,
        "dex_arbitrage",
        8500, // 85%
        150,  // 150ms latency
        ethers.parseEther("0.05"),
        "ipfs://benchmark1"
      )

      const results = await registry.getBenchmarkResults(1)
      expect(results.length).to.equal(1)
      expect(results[0].score).to.equal(8500)
      expect(results[0].benchmarkType).to.equal("dex_arbitrage")
    })

    it("should get latest benchmark by type", async function () {
      const { registry } = await deployRegistry()

      await registry.registerAgent("Latest Benchmark", "ipfs://Qm", "0x")

      await registry.recordBenchmark(1, "sentiment_analysis", 7000, 100, ethers.parseEther("0.02"), "ipfs://sa1")
      await registry.recordBenchmark(1, "sentiment_analysis", 8000, 80, ethers.parseEther("0.01"), "ipfs://sa2")

      const latest = await registry.getLatestBenchmark(1, "sentiment_analysis")
      expect(latest.score).to.equal(8000)
    })

    it("should get top agents by benchmark", async function () {
      const { registry, agent1 } = await deployRegistry()

      await registry.registerAgent("Top Agent 1", "ipfs://Qm1", "0x")
      await registry.connect(agent1).registerAgent("Top Agent 2", "ipfs://Qm2", "0x")

      await registry.recordBenchmark(1, "dex_arbitrage", 9000, 100, ethers.parseEther("0.05"), "ipfs://b1")
      await registry.recordBenchmark(2, "dex_arbitrage", 7000, 200, ethers.parseEther("0.08"), "ipfs://b2")

      const topAgents = await registry.getTopAgentsByBenchmark("dex_arbitrage", 2)
      expect(topAgents[0]).to.equal(1) // Agent 1 has higher score
      expect(topAgents[1]).to.equal(2)
    })
  })
})

describe("MantlicSwap", function () {
  async function deploySwap() {
    const [deployer, user, feeRecipient] = await ethers.getSigners()

    const MantlicSwap = await ethers.getContractFactory("MantlicSwap")
    const swap = await MantlicSwap.deploy(feeRecipient.address, 30) // 0.3% fee
    await swap.waitForDeployment()

    return { swap, deployer, user, feeRecipient }
  }

  describe("Swap Execution", function () {
    it("should get amount out", async function () {
      const { swap } = await deploySwap()

      await swap.updatePrice("0x0000000000000000000000000000000000000001", ethers.parseEther("1"))
      await swap.updatePrice("0x0000000000000000000000000000000000000002", ethers.parseEther("2"))

      const amountOut = await swap.getAmountOut(
        "0x0000000000000000000000000000000000000001",
        "0x0000000000000000000000000000000000000002",
        ethers.parseEther("1")
      )

      expect(amountOut).to.be.gt(0)
    })

    it("should get quote with slippage", async function () {
      const { swap } = await deploySwap()

      await swap.updatePrice("0x0000000000000000000000000000000000000001", ethers.parseEther("1"))
      await swap.updatePrice("0x0000000000000000000000000000000000000002", ethers.parseEther("2"))

      const [expected, minOut] = await swap.getQuote(
        "0x0000000000000000000000000000000000000001",
        "0x0000000000000000000000000000000000000002",
        ethers.parseEther("1"),
        50 // 0.5% slippage
      )

      expect(expected).to.be.gt(0)
      expect(minOut).to.be.lt(expected)
    })

    it("should calculate fee correctly", async function () {
      const { swap } = await deploySwap()

      const fee = await swap.getFee(ethers.parseEther("100"))
      expect(fee).to.equal(ethers.parseEther("0.3")) // 0.3% of 100
    })

    it("should revert on same token swap", async function () {
      const { swap } = await deploySwap()
      const token = "0x0000000000000000000000000000000000000001"

      await expect(
        swap.executeSwap(token, token, ethers.parseEther("1"), 0, "0x", { value: ethers.parseEther("1") })
      ).to.be.revertedWith("Same token")
    })

    it("should revert on zero amount", async function () {
      const { swap } = await deploySwap()

      await expect(
        swap.executeSwap(
          ethers.ZeroAddress,
          "0x0000000000000000000000000000000000000001",
          0,
          0,
          "0x",
          { value: 0 }
        )
      ).to.be.revertedWith("Amount must be positive")
    })
  })

  describe("Admin Functions", function () {
    it("should update fee", async function () {
      const { swap } = await deploySwap()

      await swap.setFee(50) // 0.5%

      const fee = await swap.getFee(ethers.parseEther("100"))
      expect(fee).to.equal(ethers.parseEther("0.5"))
    })

    it("should update price feed", async function () {
      const { swap } = await deploySwap()
      const token = "0x0000000000000000000000000000000000000001"
      const newPrice = ethers.parseEther("1.5")

      await swap.updatePrice(token, newPrice)

      const amountOut = await swap.getAmountOut(
        token,
        "0x0000000000000000000000000000000000000002",
        ethers.parseEther("1")
      )

      expect(amountOut).to.be.gt(0)
    })

    it("should set supported token", async function () {
      const { swap } = await deploySwap()
      const token = "0x0000000000000000000000000000000000000001"

      await swap.setSupportedToken(token, true)

      expect(await swap.isTokenSupported(token)).to.equal(true)
    })

    it("should only allow owner to update fee", async function () {
      const { swap, user } = await deploySwap()

      await expect(
        swap.connect(user).setFee(100)
      ).to.be.revertedWith("Ownable: caller is not the owner")
    })
  })

  describe("Get Balance", function () {
    it("should return ETH balance", async function () {
      const { swap } = await deploySwap()

      const balance = await swap.getBalance(ethers.ZeroAddress)
      expect(balance).to.equal(0)
    })
  })
})