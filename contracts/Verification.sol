// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DiplomaVerificationContract {
    struct Diploma {
        address student;
        string institution;
        string program;
        uint256 date;
    }

    mapping(uint256 => Diploma) public diplomas;
    uint256 public diplomaCount;

    address public admin;

    event DiplomaCreated(
        uint256 indexed diplomaId,
        address indexed student,
        string institution,
        string program,
        uint256 date
    );

    event AdminChanged(address indexed newAdmin);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function createDiploma(
        address student,
        string memory institution,
        string memory program,
        uint256 date
    ) public onlyAdmin {
        require(student != address(0), "Student address cannot be zero address");
        require(bytes(institution).length > 0, "Institution name cannot be empty");
        require(bytes(program).length > 0, "Program name cannot be empty");
        
        diplomaCount++;
        diplomas[diplomaCount] = Diploma(student, institution, program, date);

        emit DiplomaCreated(diplomaCount, student, institution, program, date);
    }

    function getDiploma(uint256 diplomaId) public view returns (Diploma memory) {
        require(diplomaId > 0 && diplomaId <= diplomaCount, "Invalid diploma ID");
        return diplomas[diplomaId];
    }

    function verifyDiploma(uint256 diplomaId) public view returns (bool) {
        require(diplomaId > 0 && diplomaId <= diplomaCount, "Invalid diploma ID");
        return diplomas[diplomaId].student != address(0);
    }

    function transferAdmin(address newAdmin) public onlyAdmin {
        require(newAdmin != address(0), "New admin address cannot be zero address");
        admin = newAdmin;
        emit AdminChanged(newAdmin);
    }
}
