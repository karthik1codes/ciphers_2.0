// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract RevocationRegistry is Ownable {
    mapping(bytes32 credentialId => bool revoked) private _revoked;

    event CredentialRevoked(bytes32 indexed credentialId, address indexed issuer);

    constructor(address issuerOwner) Ownable(issuerOwner) {}

    function revokeCredential(bytes32 credentialId) external onlyOwner {
        _revoked[credentialId] = true;
        emit CredentialRevoked(credentialId, _msgSender());
    }

    function isRevoked(bytes32 credentialId) external view returns (bool) {
        return _revoked[credentialId];
    }
}

