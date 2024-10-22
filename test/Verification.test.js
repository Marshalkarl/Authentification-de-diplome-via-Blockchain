const DiplomaVerificationContract = artifacts.require("DiplomaVerificationContract");

contract("DiplomaVerificationContract", (accounts) => {
    let diplomaInstance;
    const admin = accounts[0];
    const student = accounts[1];
    const newAdmin = accounts[2];
    const nonAdmin = accounts[3];

    before(async () => {
        diplomaInstance = await DiplomaVerificationContract.deployed();
    });

    describe("Deployment", () => {
        it("should set the deployer as the admin", async () => {
            const currentAdmin = await diplomaInstance.admin();
            assert.equal(currentAdmin, admin, "The deployer should be the admin");
        });
    });

    describe("Creating Diplomas", () => {
        it("should create a diploma", async () => {
            const date = Math.floor(Date.now() / 1000); // Current timestamp
            await diplomaInstance.createDiploma(student, "University A", "Computer Science", date, { from: admin });

            const diploma = await diplomaInstance.getDiploma(1);
            assert.equal(diploma.student, student, "Student address should match");
            assert.equal(diploma.institution, "University A", "Institution should match");
            assert.equal(diploma.program, "Computer Science", "Program should match");
            assert.equal(diploma.date.toNumber(), date, "Date should match");
        });

        it("should not allow non-admin to create a diploma", async () => {
            const date = Math.floor(Date.now() / 1000); // Current timestamp
            try {
                await diplomaInstance.createDiploma(student, "University B", "Mathematics", date, { from: nonAdmin });
                assert.fail("Only admin should be able to create diplomas");
            } catch (error) {
                assert(error.message.includes("Only admin can perform this action"), "Expected only admin error");
            }
        });
    });

    describe("Verifying Diplomas", () => {
        it("should verify a diploma", async () => {
            const isVerified = await diplomaInstance.verifyDiploma(1);
            assert.isTrue(isVerified, "Diploma should be verified");
        });

        it("should return false for non-existing diploma", async () => {
            const isVerified = await diplomaInstance.verifyDiploma(999); // Non-existing diploma ID
            assert.isFalse(isVerified, "Non-existing diploma should not be verified");
        });
    });

    describe("Admin Transfer", () => {
        it("should transfer admin rights", async () => {
            await diplomaInstance.transferAdmin(newAdmin, { from: admin });
            const currentAdmin = await diplomaInstance.admin();
            assert.equal(currentAdmin, newAdmin, "The new admin should be the newAdmin account");

            // Revert back to original admin for further testing
            await diplomaInstance.transferAdmin(admin, { from: newAdmin });
        });

        it("should not allow non-admin to transfer admin rights", async () => {
            try {
                await diplomaInstance.transferAdmin(nonAdmin, { from: nonAdmin });
                assert.fail("Only admin should be able to transfer admin rights");
            } catch (error) {
                assert(error.message.includes("Only admin can perform this action"), "Expected only admin error");
            }
        });

        it("should not transfer admin rights to zero address", async () => {
            try {
                await diplomaInstance.transferAdmin("address", { from: admin });
                assert.fail("Cannot transfer admin rights to zero address");
            } catch (error) {
                assert(error.message.includes("New admin address cannot be zero address"), "Expected zero address error");
            }
        });
    });
});
