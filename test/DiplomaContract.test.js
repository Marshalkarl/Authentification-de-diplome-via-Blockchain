const DiplomaContract = artifacts.require("DiplomaContract");

contract("²", (accounts) => {
  let diplomaInstance;
  const admin = accounts[0];
  const institution = accounts[1];
  const student = accounts[2];
  const employer = accounts[3];

  before(async () => {
    diplomaInstance = await DiplomaContract.deployed();
  });

  describe("Deployment", () => {
    it("should set the deployer as admin", async () => {
      const currentAdmin = await diplomaInstance.admin();
      assert.equal(currentAdmin, admin, "The deployer should be the admin");
    });

    it("should assign admin role to deployer", async () => {
      const adminRole = await diplomaInstance.userRoles(admin);
      assert.equal(adminRole.toString(), "0", "The deployer should have the admin role (0)");
    });
  });

  describe("Permission Management", () => {
    it("should grant institution role", async () => {
      await diplomaInstance.grantPermission(institution, "INSTITUTION", { from: admin });
      const role = await diplomaInstance.userRoles(institution);
      assert.equal(role.toString(), "1", "The institution role should be 1");
    });

    it("should not grant permission from a non-admin", async () => {
      try {
        await diplomaInstance.grantPermission(employer, "EMPLOYER", { from: student });
        assert.fail("Only admin should be able to grant permission");
      } catch (error) {
        assert(error.message.includes("Only admin can perform this action"), "Expected only admin error");
      }
    });

    it("should revoke permission", async () => {
      await diplomaInstance.revokePermission(institution, { from: admin });
      const role = await diplomaInstance.userRoles(institution);
      assert.equal(role.toString(), "0", "The institution role should be revoked to default (0)");
    });
  });

  describe("Diploma Creation", () => {
    it("should create a diploma", async () => {
      // Re-grant the institution role
      await diplomaInstance.grantPermission(institution, "INSTITUTION", { from: admin });

      const institutionName = "Blockchain University";
      const program = "Blockchain Development";
      const date = Date.now();

      // Create a diploma
      await diplomaInstance.createDiploma(student, institutionName, program, date, { from: institution });

      const diploma = await diplomaInstance.diplomas(1);

      assert.equal(diploma.student, student, "The student address should match");
      assert.equal(diploma.institution, institutionName, "The institution name should match");
      assert.equal(diploma.program, program, "The program name should match");
      assert.equal(diploma.date.toNumber(), date, "The issue date should match");
    });

    it("should only allow institutions to create diplomas", async () => {
      try {
        const institutionName = "Fake University";
        const program = "Fake Studies";
        const date = Date.now();

        await diplomaInstance.createDiploma(student, institutionName, program, date, { from: student });
        assert.fail("Only institutions should be able to create diplomas");
      } catch (error) {
        assert(error.message.includes("Only institutions can perform this action"), "Expected only institution error");
      }
    });
  });

  describe("Admin Transfer", () => {
    it("should transfer admin rights", async () => {
      await diplomaInstance.transferAdmin(employer, { from: admin });
      const newAdmin = await diplomaInstance.admin();
      assert.equal(newAdmin, employer, "The new admin should be the employer");

      // Revert back to original admin for consistency
      await diplomaInstance.transferAdmin(admin, { from: employer });
    });

    it("should not transfer admin rights from a non-admin", async () => {
      try {
        await diplomaInstance.transferAdmin(student, { from: institution });
        assert.fail("Only admin should be able to transfer admin rights");
      } catch (error) {
        assert(error.message.includes("Only admin can perform this action"), "Expected only admin error");
      }
    });
  });
});
