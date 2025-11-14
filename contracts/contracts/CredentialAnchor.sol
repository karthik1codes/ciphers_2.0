// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/**
 * @title CredentialAnchor
 * @dev Simple contract to anchor credential hashes on-chain for verification
 */
contract CredentialAnchor {
    // Mapping to track anchored credential hashes
    mapping(bytes32 => bool) private _anchored;
    
    // Mapping to store anchor metadata (block number, timestamp)
    mapping(bytes32 => AnchorInfo) private _anchorInfo;
    
    struct AnchorInfo {
        uint256 blockNumber;
        uint256 timestamp;
        address issuer;
    }
    
    event CredentialAnchored(
        bytes32 indexed credentialHash,
        address indexed issuer,
        uint256 blockNumber,
        uint256 timestamp
    );
    
    /**
     * @dev Anchor a credential hash on-chain
     * @param credentialHash The keccak256 hash of the credential ID
     * @return success Whether the anchoring was successful
     */
    function anchor(bytes32 credentialHash) external returns (bool) {
        require(!_anchored[credentialHash], "Credential hash already anchored");
        
        _anchored[credentialHash] = true;
        _anchorInfo[credentialHash] = AnchorInfo({
            blockNumber: block.number,
            timestamp: block.timestamp,
            issuer: msg.sender
        });
        
        emit CredentialAnchored(
            credentialHash,
            msg.sender,
            block.number,
            block.timestamp
        );
        
        return true;
    }
    
    /**
     * @dev Check if a credential hash is anchored
     * @param credentialHash The keccak256 hash of the credential ID
     * @return isAnchored Whether the credential hash is anchored
     */
    function isAnchored(bytes32 credentialHash) external view returns (bool) {
        return _anchored[credentialHash];
    }
    
    /**
     * @dev Get anchor information for a credential hash
     * @param credentialHash The keccak256 hash of the credential ID
     * @return blockNumber The block number where it was anchored
     * @return timestamp The timestamp when it was anchored
     * @return issuer The address that anchored it
     */
    function getAnchorInfo(bytes32 credentialHash) external view returns (
        uint256 blockNumber,
        uint256 timestamp,
        address issuer
    ) {
        require(_anchored[credentialHash], "Credential hash not anchored");
        AnchorInfo memory info = _anchorInfo[credentialHash];
        return (info.blockNumber, info.timestamp, info.issuer);
    }
}

