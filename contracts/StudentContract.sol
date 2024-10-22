// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract StudentContract {
    struct Student {
        string name;
        uint256[] diplomaIds;
    }

    mapping(address => Student) public students;
    address public admin;

    event StudentRegistered(address indexed studentAddress, string studentName);
    event DiplomaAddedToStudent(address indexed studentAddress, uint256 diplomaId);
    event AdminChanged(address indexed newAdmin);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function registerStudent(address studentAddress, string memory studentName) public onlyAdmin {
        require(studentAddress != address(0), "Student address cannot be zero address");
        require(bytes(students[studentAddress].name).length == 0, "Student already registered");

        students;
        emit StudentRegistered(studentAddress, studentName);
    }

    function addDiplomaToStudent(address studentAddress, uint256 diplomaId) public onlyAdmin {
        require(bytes(students[studentAddress].name).length > 0, "Student not registered");
        students[studentAddress].diplomaIds.push(diplomaId);
        emit DiplomaAddedToStudent(studentAddress, diplomaId);
    }

    function getStudentDiplomas(address studentAddress) public view returns (uint256[] memory) {
        require(bytes(students[studentAddress].name).length > 0, "Student not registered");
        return students[studentAddress].diplomaIds;
    }

    function transferAdmin(address newAdmin) public onlyAdmin {
        require(newAdmin != address(0), "New admin address cannot be zero address");
        admin = newAdmin;
        emit AdminChanged(newAdmin);
    }
}
