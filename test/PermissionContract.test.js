const PermissionContract = artifacts.require("PermissionContract");

contract("PermissionContract", (accounts) => {
  let permissionInstance;
  const admin = accounts[0];
  const newAdmin = accounts[1];
  const user1 = accounts[2];
  const user2 = accounts[3];
  const nonAdmin = accounts[4];

  before(async () => {
    permissionInstance = await PermissionContract.deployed();
  });

  describe("Deployment", () => {
    it("should set the deployer as the admin", async () => {
      const currentAdmin = await permissionInstance.admin();
      assert.equal(currentAdmin, admin, "The deployer should be the admin");
    });
  });

  describe("Granting Permissions", () => {
    it("should grant permission to a user", async () => {
      await permissionInstance.grantPermission(user1, "STUDENT", { from: admin });
      const role = await permissionInstance.userRoles(user1);
      assert.equal(role.toNumber(), 2, "User1 should be granted the STUDENT role");
    });

    it("should not allow non-admin to grant permission", async () => {
      try {
        await permissionInstance.grantPermission(user2, "EMPLOYER", { from: nonAdmin });
        assert.fail("Only admin should be able to grant permissions");
      } catch (error) {
        assert(error.message.includes("Only admin can perform this action"), "Expected only admin error");
      }
    });

    it("should not allow granting permission to zero address", async () => {
      try {
        await permissionInstance.grantPermission("address", "STUDENT", { from: admin });
        assert.fail("Cannot grant permission to zero address");
      } catch (error) {
        assert(error.message.includes("User address cannot be zero address"), "Expected zero address error");
      }
    });
  });

  describe("Revoking Permissions", () => {
    it("should revoke permission from a user", async () => {
      await permissionInstance.revokePermission(user1, { from: admin });
      const role = await permissionInstance.userRoles(user1);
      assert.equal(role.toNumber(), 0, "User1 should no longer have any role");
    });

    it("should not allow non-admin to revoke permission", async () => {
      try {
        await permissionInstance.revokePermission(user2, { from: nonAdmin });
        assert.fail("Only admin should be able to revoke permissions");
      } catch (error) {
        assert(error.message.includes("Only admin can perform this action"), "Expected only admin error");
      }
    });

    it("should not allow revoking permission for zero address", async () => {
      try {
        await permissionInstance.revokePermission("address", { from: admin });
        assert.fail("Cannot revoke permission for zero address");
      } catch (error) {
        assert(error.message.includes("User address cannot be zero address"), "Expected zero address error");
      }
    });
  });

  describe("Admin Transfer", () => {
    it("should transfer admin rights", async () => {
      await permissionInstance.transferAdmin(newAdmin, { from: admin });
      const currentAdmin = await permissionInstance.admin();
      assert.equal(currentAdmin, newAdmin, "The new admin should be the newAdmin account");

      // Revert back to original admin for further testing
      await permissionInstance.transferAdmin(admin, { from: newAdmin });
    });

    it("should not allow non-admin to transfer admin rights", async () => {
      try {
        await permissionInstance.transferAdmin(nonAdmin, { from: nonAdmin });
        assert.fail("Only admin should be able to transfer admin rights");
      } catch (error) {
        assert(error.message.includes("Only admin can perform this action"), "Expected only admin error");
      }
    });

    it("should not transfer admin rights to zero address", async () => {
      try {
        await permissionInstance.transferAdmin("address", { from: admin });
        assert.fail("Cannot transfer admin rights to zero address");
      } catch (error) {
        assert(error.message.includes("New admin address cannot be zero address"), "Expected zero address error");
      }
    });
  });
});
