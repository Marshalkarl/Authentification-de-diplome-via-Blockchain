// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract InstitutionContract {
    struct Institution {
        string name;
        address institutionAddress;
        bool isAuthorized;
    }

    mapping(address => Institution) public institutions;
    address public admin;

    // Events
    event InstitutionRegistered(
        string institutionName,
        address indexed institutionAddress,
        bool isAuthorized
    );
    
    event InstitutionVerified(
        address indexed institutionAddress,
        bool isAuthorized
    );

    event AdminChanged(address indexed newAdmin);

    // Modifier to restrict function access to the admin
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    // Constructor to set the deployer as the admin
    constructor() {
        admin = msg.sender;
    }

    // Function to register an institution (only callable by admin)
    function registerInstitution(string memory institutionName, address institutionAddress) public onlyAdmin {
        require(institutionAddress != address(0), "Institution address cannot be zero address");
        require(bytes(institutionName).length > 0, "Institution name cannot be empty");
        require(institutions[institutionAddress].institutionAddress == address(0), "Institution already registered");

        institutions[institutionAddress] = Institution(institutionName, institutionAddress, true);

        emit InstitutionRegistered(institutionName, institutionAddress, true);
    }

    // Function to verify if an institution is authorized
    function verifyInstitution(address institutionAddress) public view returns (bool) {
    require(institutionAddress != address(0), "Address cannot be zero address");
    Institution memory institution = institutions[institutionAddress];
    require(institution.institutionAddress != address(0), "Institution not registered");
    
    return institution.isAuthorized;
    }


    // Function to transfer admin rights to a new address (only callable by admin)
    function transferAdmin(address newAdmin) public onlyAdmin {
        require(newAdmin != address(0), "New admin address cannot be zero address");

        admin = newAdmin;
        emit AdminChanged(newAdmin);
    }
}
