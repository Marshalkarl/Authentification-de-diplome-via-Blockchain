// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DiplomaContract {
    enum Role { ADMIN, INSTITUTION, STUDENT, EMPLOYER }

    struct Diploma {
        address student;
        string institution;
        string program;
        uint256 date;
    }

    mapping(uint256 => Diploma) public diplomas;
    uint256 public diplomaCount;

    address public admin;
    mapping(address => Role) public userRoles;

    event DiplomaCreated(
        uint256 indexed diplomaId,
        address indexed student,
        string institution,
        string program,
        uint256 date
    );

    event AdminChanged(address indexed newAdmin);
    event PermissionGranted(address indexed user, string role);
    event PermissionRevoked(address indexed user, string role);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyInstitution() {
        require(userRoles[msg.sender] == Role.INSTITUTION, "Only institutions can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
        userRoles[admin] = Role.ADMIN;
    }

    function createDiploma(
        address student,
        string memory institution,
        string memory program,
        uint256 date
    ) public onlyInstitution {
        require(student != address(0), "Student address cannot be zero address");
        
        diplomaCount++;
        diplomas[diplomaCount] = Diploma(student, institution, program, date);

        emit DiplomaCreated(diplomaCount, student, institution, program, date);
    }

    function getDiploma(uint256 diplomaId) public view returns (Diploma memory) {
        return diplomas[diplomaId];
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

        Role currentRole = userRoles[user];
        delete userRoles[user];  // Reset the user's role to default (0)

        emit PermissionRevoked(user, getRoleString(currentRole));
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
        
        admin = newAdmin;
        userRoles[admin] = Role.ADMIN;

        emit AdminChanged(newAdmin);
    }
}
