const InstitutionContract = artifacts.require("InstitutionContract");

contract("InstitutionContract", (accounts) => {
  let institutionInstance;
  const admin = accounts[0];
  const newAdmin = accounts[1];
  const institution1 = accounts[2];
  const institution2 = accounts[3];
  const nonAdmin = accounts[4];

  before(async () => {
    institutionInstance = await InstitutionContract.deployed();
  });

  describe("Deployment", () => {
    it("should set the deployer as the admin", async () => {
      const currentAdmin = await institutionInstance.admin();
      assert.equal(currentAdmin, admin, "The deployer should be the admin");
    });
  });

  describe("Institution Registration", () => {
    it("should register a new institution", async () => {
      await institutionInstance.registerInstitution("University A", institution1, { from: admin });
      const institution = await institutionInstance.institutions(institution1);
      assert.equal(institution.name, "University A", "Institution name should be 'University A'");
      assert.equal(institution.isAuthorized, true, "Institution should be authorized");
    });

    it("should not allow non-admin to register an institution", async () => {
      try {
        await institutionInstance.registerInstitution("University B", institution2, { from: nonAdmin });
        assert.fail("Only admin should be able to register institutions");
      } catch (error) {
        assert(error.message.includes("Only admin can perform this action"), "Expected only admin error");
      }
    });

    it("should not allow duplicate institution registration", async () => {
      try {
        await institutionInstance.registerInstitution("University A", institution1, { from: admin });
        assert.fail("Should not be able to register the same institution twice");
      } catch (error) {
        assert(error.message.includes("Institution already registered"), "Expected institution already registered error");
      }
    });
  });

  describe("Institution Verification", () => {
    it("should verify the institution", async () => {
      const isAuthorized = await institutionInstance.verifyInstitution(institution1);
      assert.equal(isAuthorized, true, "Institution should be authorized");
    });

    it("should return false for an unregistered institution", async () => {
      const isAuthorized = await institutionInstance.verifyInstitution(institution2);
      assert.equal(isAuthorized, false, "Unregistered institution should not be authorized");
    });
  });

  describe("Admin Transfer", () => {
    it("should transfer admin rights", async () => {
      await institutionInstance.transferAdmin(newAdmin, { from: admin });
      const currentAdmin = await institutionInstance.admin();
      assert.equal(currentAdmin, newAdmin, "The new admin should be the newAdmin account");

      // Revert back to original admin for further testing
      await institutionInstance.transferAdmin(admin, { from: newAdmin });
    });

    it("should not allow non-admin to transfer admin rights", async () => {
      try {
        await institutionInstance.transferAdmin(nonAdmin, { from: nonAdmin });
        assert.fail("Only admin should be able to transfer admin rights");
      } catch (error) {
        assert(error.message.includes("Only admin can perform this action"), "Expected only admin error");
      }
    });

    it("should not transfer admin rights to zero address", async () => {
      try {
        await institutionInstance.transferAdmin("address", { from: admin });
        assert.fail("Cannot transfer admin rights to zero address");
      } catch (error) {
        assert(error.message.includes("New admin address cannot be zero address"), "Expected zero address error");
      }
    });
  });
});
