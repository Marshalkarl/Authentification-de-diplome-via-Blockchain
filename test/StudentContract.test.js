const StudentContract = artifacts.require("StudentContract");

contract("StudentContract", (accounts) => {
  let studentInstance;
  const admin = accounts[0];
  const newAdmin = accounts[1];
  const student1 = accounts[2];
  const student2 = accounts[3];
  const nonAdmin = accounts[4];
  
  before(async () => {
    studentInstance = await StudentContract.deployed();
  });

  describe("Deployment", () => {
    it("should set the deployer as the admin", async () => {
      const currentAdmin = await studentInstance.admin();
      assert.equal(currentAdmin, admin, "The deployer should be the admin");
    });
  });

  describe("Student Registration", () => {
    it("should register a new student", async () => {
      await studentInstance.registerStudent(student1, "Alice", { from: admin });
      const student = await studentInstance.students(student1);
      assert.equal(student.name, "Alice", "Student name should be 'Alice'");
    });

    it("should not register a student from a non-admin account", async () => {
      try {
        await studentInstance.registerStudent(student2, "Bob", { from: nonAdmin });
        assert.fail("Only admin should be able to register students");
      } catch (error) {
        assert(error.message.includes("Only admin can perform this action"), "Expected only admin error");
      }
    });

    it("should not allow duplicate student registration", async () => {
      try {
        await studentInstance.registerStudent(student1, "Alice", { from: admin });
        assert.fail("Should not be able to register the same student twice");
      } catch (error) {
        assert(error.message.includes("Student already registered"), "Expected student already registered error");
      }
    });
  });

  describe("Diploma Management", () => {
    it("should add a diploma to a student", async () => {
      await studentInstance.addDiplomaToStudent(student1, 1, { from: admin });
      const diplomas = await studentInstance.getStudentDiplomas(student1);
      assert.equal(diplomas.length, 1, "Student should have 1 diploma");
      assert.equal(diplomas[0], 1, "Diploma ID should be 1");
    });

    it("should not add a diploma to a non-registered student", async () => {
      try {
        await studentInstance.addDiplomaToStudent(student2, 1, { from: admin });
        assert.fail("Cannot add diploma to non-registered student");
      } catch (error) {
        assert(error.message.includes("Student not registered"), "Expected student not registered error");
      }
    });

    it("should not allow non-admin to add a diploma", async () => {
      try {
        await studentInstance.addDiplomaToStudent(student1, 2, { from: nonAdmin });
        assert.fail("Only admin should be able to add diplomas");
      } catch (error) {
        assert(error.message.includes("Only admin can perform this action"), "Expected only admin error");
      }
    });
  });

  describe("Admin Transfer", () => {
    it("should transfer admin rights", async () => {
      await studentInstance.transferAdmin(newAdmin, { from: admin });
      const currentAdmin = await studentInstance.admin();
      assert.equal(currentAdmin, newAdmin, "The new admin should be the newAdmin account");

      // Revert back to original admin for further testing
      await studentInstance.transferAdmin(admin, { from: newAdmin });
    });

    it("should not transfer admin rights from non-admin account", async () => {
      try {
        await studentInstance.transferAdmin(nonAdmin, { from: nonAdmin });
        assert.fail("Only admin should be able to transfer admin rights");
      } catch (error) {
        assert(error.message.includes("Only admin can perform this action"), "Expected only admin error");
      }
    });

    it("should not transfer admin rights to zero address", async () => {
      try {
        await studentInstance.transferAdmin("address", { from: admin });
        assert.fail("Cannot transfer admin rights to zero address");
      } catch (error) {
        assert(error.message.includes("New admin address cannot be zero address"), "Expected zero address error");
      }
    });
  });
});
