// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MantlicAgentNFT
 * @dev Minimal ERC-8004 inspired agent identity NFT for Mantle
 *      Token ID = Agent ID, metadata stored on IPFS
 */
contract MantlicAgentNFT {
    uint256 private _tokenCounter;
    string public constant name = "Mantlic Agent";
    string public constant symbol = "MAN";
    
    struct Agent {
        address owner;
        string metadataURI;
        uint256 createdAt;
        string agentName;
    }
    
    mapping(uint256 => Agent) public agents;
    mapping(address => uint256) public ownerToAgent;
    
    event AgentMinted(address indexed owner, uint256 indexed tokenId, string agentName);
    
    function mintAgent(string memory agentName, string memory metadataURI) external returns (uint256) {
        require(ownerToAgent[msg.sender] == 0, "Already minted");
        
        _tokenCounter++;
        uint256 tokenId = _tokenCounter;
        
        agents[tokenId] = Agent({
            owner: msg.sender,
            metadataURI: metadataURI,
            createdAt: block.timestamp,
            agentName: agentName
        });
        
        ownerToAgent[msg.sender] = tokenId;
        
        emit AgentMinted(msg.sender, tokenId, agentName);
        return tokenId;
    }
    
    function getAgentByOwner(address owner) external view returns (Agent memory) {
        uint256 tokenId = ownerToAgent[owner];
        require(tokenId > 0, "No agent found");
        return agents[tokenId];
    }
    
    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(tokenId > 0 && tokenId <= _tokenCounter, "Invalid token");
        return agents[tokenId].metadataURI;
    }
    
    function totalAgents() external view returns (uint256) {
        return _tokenCounter;
    }
}
