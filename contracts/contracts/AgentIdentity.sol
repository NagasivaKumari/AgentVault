// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AgentIdentity (ERC-8004 inspired)
 * @notice Identity NFT for AI agents on Mantle. Each agent mints a unique NFT
 *         that records its on-chain decision history.
 *
 *         The "ERC-8004" standard is the proposed on-chain agent identity spec
 *         referenced by the Turing Test Hackathon. This contract implements
 *         a minimal, working version using ERC-721:
 *         - One NFT per registered AI agent
 *         - Records a decision count and last decision timestamp
 *         - Emits a DecisionRecorded event with a decision hash (verifiable
 *           off-chain by hashing the AI's full signal breakdown)
 *
 *         For production: extend with reputation scores, validation registry,
 *         and cross-chain identity anchoring.
 */
contract AgentIdentity is ERC721, Ownable {

    struct AgentProfile {
        string name;
        string description;
        string model;          // e.g. "deterministic-v1" or "gpt-4-turbo"
        address controller;    // backend / wallet that operates the agent
        uint256 decisionCount;
        uint256 createdAt;
        uint256 lastDecisionAt;
        bool active;
    }

    uint256 private _nextTokenId;
    mapping(uint256 => AgentProfile) public profiles;
    mapping(address => uint256) public tokenIdByController;
    mapping(bytes32 => bool) private _decisionHashes; // dedupe

    event AgentRegistered(
        uint256 indexed tokenId,
        address indexed controller,
        string name,
        string model,
        uint256 timestamp
    );

    event DecisionRecorded(
        uint256 indexed tokenId,
        bytes32 indexed decisionHash,
        uint256 indexed decisionCount,
        uint256 timestamp
    );

    event AgentDeactivated(uint256 indexed tokenId, uint256 timestamp);

    constructor() ERC721("AgentVault Agent Identity", "AVAI") Ownable(msg.sender) {}

    /**
     * Register a new agent. Only the contract owner (deployer / multisig) can
     * register agents. The NFT is minted to the controller address.
     */
    function registerAgent(
        address controller,
        string calldata name,
        string calldata description,
        string calldata model
    ) external onlyOwner returns (uint256 tokenId) {
        require(controller != address(0), "Invalid controller");
        require(tokenIdByController[controller] == 0, "Controller already has an agent");
        require(bytes(name).length > 0, "Name required");
        require(bytes(name).length <= 100, "Name too long");
        require(bytes(model).length > 0, "Model required");

        unchecked { _nextTokenId += 1; }
        tokenId = _nextTokenId;

        _safeMint(controller, tokenId);

        profiles[tokenId] = AgentProfile({
            name: name,
            description: description,
            model: model,
            controller: controller,
            decisionCount: 0,
            createdAt: block.timestamp,
            lastDecisionAt: 0,
            active: true
        });

        tokenIdByController[controller] = tokenId;

        emit AgentRegistered(tokenId, controller, name, model, block.timestamp);
    }

    /**
     * Record a decision for an agent. The decisionHash should be a 32-byte
     * hash of the full signal breakdown + recommendation (verifiable off-chain).
     *
     * Only the agent's controller (backend wallet) OR the contract owner can call.
     * Dedupes identical hashes to prevent replay.
     */
    function recordDecision(uint256 tokenId, bytes32 decisionHash) external {
        require(_ownerOf(tokenId) != address(0), "Agent does not exist");
        AgentProfile storage profile = profiles[tokenId];
        require(profile.active, "Agent not active");
        require(
            msg.sender == profile.controller || msg.sender == owner(),
            "Not authorized for this agent"
        );
        require(!_decisionHashes[decisionHash], "Decision already recorded");

        _decisionHashes[decisionHash] = true;
        profile.decisionCount += 1;
        profile.lastDecisionAt = block.timestamp;

        emit DecisionRecorded(tokenId, decisionHash, profile.decisionCount, block.timestamp);
    }

    function deactivateAgent(uint256 tokenId) external {
        require(_ownerOf(tokenId) != address(0), "Agent does not exist");
        AgentProfile storage profile = profiles[tokenId];
        require(
            msg.sender == profile.controller || msg.sender == owner(),
            "Not authorized"
        );
        profile.active = false;
        emit AgentDeactivated(tokenId, block.timestamp);
    }

    function getProfile(uint256 tokenId) external view returns (AgentProfile memory) {
        return profiles[tokenId];
    }

    function totalAgents() external view returns (uint256) {
        return _nextTokenId;
    }

    /**
     * Minimal on-chain metadata. For a production deployment, point to a
     * decentralized storage (IPFS/Arweave) URI.
     */
    mapping(uint256 => string) private _tokenURIs;

    /**
     * Set a custom tokenURI for an agent (ERC-8004 compliance).
     */
     function setAgentURI(uint256 tokenId, string calldata uri) external {
         require(_ownerOf(tokenId) != address(0), "Agent does not exist");
         AgentProfile storage profile = profiles[tokenId];
         require(
             msg.sender == profile.controller || msg.sender == owner(),
             "Not authorized"
         );
         _tokenURIs[tokenId] = uri;
     }

     /**
      * Returns the ERC-8004 compliant "Agent Card" metadata.
      */
     function tokenURI(uint256 tokenId) public view override returns (string memory) {
         require(_ownerOf(tokenId) != address(0), "Agent does not exist");

         if (bytes(_tokenURIs[tokenId]).length > 0) {
             return _tokenURIs[tokenId];
         }

         AgentProfile memory p = profiles[tokenId];

         // Official ERC-8004 Agent Card Structure
         string memory json = string(abi.encodePacked(
             '{"type":"https://eips.ethereum.org/EIPS/eip-8004#registration-v1",',
             '"name":"', p.name, '",',
             '"description":"', p.description, '",',
             '"attributes":[',
             '{"trait_type":"model","value":"', p.model, '"},',
             '{"trait_type":"decisions","value":', _toString(p.decisionCount), '}',
             '],',
             '"services":[{"name":"web","endpoint":"https://agentvault.ai"}],',
             '"agentWallet":"', _toAsciiString(p.controller), '"}'
         ));

         return string(abi.encodePacked(
             "data:application/json;base64,",
             _base64Encode(bytes(json))
         ));
     }

     function _toAsciiString(address x) private pure returns (string memory) {
         bytes memory s = new bytes(42);
         s[0] = "0";
         s[1] = "x";
         for (uint i = 0; i < 20; i++) {
             bytes1 b = bytes1(uint8(uint160(x) / (2**(8*(19 - i)))));
             bytes1 hi = bytes1(uint8(b) / 16);
             bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
             s[2*i + 2] = _char(hi);
             s[2*i + 3] = _char(lo);
         }
         return string(s);
     }

     function _char(bytes1 b) private pure returns (bytes1) {
         if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
         else return bytes1(uint8(b) + 0x57);
     }

     function _base64Encode(bytes memory data) private pure returns (string memory) {
         string memory table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
         uint256 len = data.length;
         if (len == 0) return "";
         uint256 encodedLen = 4 * ((len + 2) / 3);
         bytes memory result = new bytes(encodedLen);
         for (uint256 i = 0; i < len; i += 3) {
             uint256 a = uint8(data[i]);
             uint256 b = i + 1 < len ? uint8(data[i + 1]) : 0;
             uint256 c = i + 2 < len ? uint8(data[i + 2]) : 0;
             result[4 * (i / 3)] = bytes1(uint8(bytes(table)[a >> 2]));
             result[4 * (i / 3) + 1] = bytes1(uint8(bytes(table)[((a & 3) << 4) | (b >> 4)]));
             result[4 * (i / 3) + 2] = i + 1 < len ? bytes1(uint8(bytes(table)[((b & 15) << 2) | (c >> 6)])) : bytes1(uint8(bytes("=")[0]));
             result[4 * (i / 3) + 3] = i + 2 < len ? bytes1(uint8(bytes(table)[c & 63])) : bytes1(uint8(bytes("=")[0]));
         }
         return string(result);
     }

    function _toString(uint256 v) private pure returns (string memory) {
        if (v == 0) return "0";
        uint256 j = v;
        uint256 length;
        while (j != 0) { length++; j /= 10; }
        bytes memory b = new bytes(length);
        uint256 k = length;
        while (v != 0) { k--; b[k] = bytes1(uint8(48 + v % 10)); v /= 10; }
        return string(b);
    }
}
