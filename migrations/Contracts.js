const DiplomaContract = artifacts.require("DiplomaContract");
const StudentContract = artifacts.require("StudentContract");
const InstitutionContract = artifacts.require("InstitutionContract");
const PermissionContract = artifacts.require("PermissionContract");
const TransactionContract = artifacts.require("TransactionContract");
const DiplomaVerificationContract = artifacts.require("DiplomaVerificationContract");

module.exports = function(deployer) {
  deployer.deploy(DiplomaContract);
  deployer.deploy(StudentContract);
  deployer.deploy(InstitutionContract);
  deployer.deploy(PermissionContract);
  deployer.deploy(TransactionContract);
  deployer.deploy(DiplomaVerificationContract);
};
