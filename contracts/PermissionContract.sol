// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PermissionContract {
    enum Role { ADMIN, INSTITUTION, STUDENT, EMPLOYER }

    mapping(address => Role) public userRoles;
    address public admin;

    event PermissionGranted(address indexed user, string role);
    event PermissionRevoked(address indexed user, string role);
    event AdminChanged(address indexed newAdmin);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
        userRoles[admin] = Role.ADMIN;
    }

    function grantPermission(address user, string memory role) public onlyAdmin {
        require(user != address(0), "User address cannot be zero address");
        require(bytes(role).length > 0, "Role cannot be empty");

        if (keccak256(bytes(role)) == keccak256(bytes("ADMIN"))) {
            userRoles[user] = Role.ADMIN;
        } else if (keccak256(bytes(role)) == keccak256(bytes("INSTITUTION"))) {
            userRoles[user] = Role.INSTITUTION;
        } else if (keccak256(bytes(role)) == keccak256(bytes("STUDENT"))) {
            userRoles[user] = Role.STUDENT;
        } else if (keccak256(bytes(role)) == keccak256(bytes("EMPLOYER"))) {
            userRoles[user] = Role.EMPLOYER;
        } else {
            revert("Invalid role");
        }

        emit PermissionGranted(user, role);
    }

    function revokePermission(address user) public onlyAdmin {
        require(user != address(0), "User address cannot be zero address");
        Role currentRole = userRoles[user]; // Récupérer le rôle avant suppression
        require(currentRole != Role.ADMIN, "Cannot revoke admin role");

        delete userRoles[user];
        emit PermissionRevoked(user, getRoleString(currentRole)); // Utiliser le rôle récupéré avant suppression
    }

    function getRoleString(Role role) public pure returns (string memory) {
        if (role == Role.ADMIN) {
            return "ADMIN";
        } else if (role == Role.INSTITUTION) {
            return "INSTITUTION";
        } else if (role == Role.STUDENT) {
            return "STUDENT";
        } else if (role == Role.EMPLOYER) {
            return "EMPLOYER";
        } else {
            return "";
        }
    }

    function transferAdmin(address newAdmin) public onlyAdmin {
        require(newAdmin != address(0), "New admin address cannot be zero address");
        
        // Révoquer le rôle d'admin de l'ancien administrateur avant le transfert
        userRoles[admin] = Role.STUDENT; // ou un autre rôle par défaut
        userRoles[newAdmin] = Role.ADMIN;
        
        admin = newAdmin;

        emit AdminChanged(newAdmin);
    }
}
