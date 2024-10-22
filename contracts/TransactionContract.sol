// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TransactionContract {
    struct Transaction {
        address sender;
        address receiver;
        string transactionType;
        uint256 timestamp;
    }

    uint256 public transactionCount;
    mapping(uint256 => Transaction) public transactions;
    address public admin;

    event TransactionRecorded(
        uint256 indexed transactionId,
        address indexed sender,
        address indexed receiver,
        string transactionType,
        uint256 timestamp
    );

    event AdminChanged(address indexed newAdmin);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function recordTransaction(
        address sender,
        address receiver,
        string memory transactionType,
        uint256 timestamp
    ) public onlyAdmin {
        require(sender != address(0), "Sender address cannot be zero address");
        require(receiver != address(0), "Receiver address cannot be zero address");
        require(bytes(transactionType).length > 0, "Transaction type cannot be empty");

        transactionCount++;
        transactions[transactionCount] = Transaction(sender, receiver, transactionType, timestamp);

        emit TransactionRecorded(transactionCount, sender, receiver, transactionType, timestamp);
    }

    function getTransaction(uint256 transactionId) public view returns (Transaction memory) {
        require(transactionId > 0 && transactionId <= transactionCount, "Invalid transaction ID");
        return transactions[transactionId];
    }

    function transferAdmin(address newAdmin) public onlyAdmin {
        require(newAdmin != address(0), "New admin address cannot be zero address");
        admin = newAdmin;
        emit AdminChanged(newAdmin);
    }
}
