const TransactionContract = artifacts.require("TransactionContract");

contract("TransactionContract", (accounts) => {
    let transactionInstance;
    const admin = accounts[0];
    const user1 = accounts[1];
    const user2 = accounts[2];
    const nonAdmin = accounts[3];

    before(async () => {
        transactionInstance = await TransactionContract.deployed();
    });

    describe("Deployment", () => {
        it("should set the deployer as the admin", async () => {
            const currentAdmin = await transactionInstance.admin();
            assert.equal(currentAdmin, admin, "The deployer should be the admin");
        });
    });

    describe("Recording Transactions", () => {
        it("should record a transaction", async () => {
            const timestamp = Math.floor(Date.now() / 1000); // Current timestamp
            await transactionInstance.recordTransaction(user1, user2, "Payment", timestamp, { from: admin });

            const transaction = await transactionInstance.getTransaction(1);
            assert.equal(transaction.sender, user1, "Sender should match");
            assert.equal(transaction.receiver, user2, "Receiver should match");
            assert.equal(transaction.transactionType, "Payment", "Transaction type should match");
            assert.equal(transaction.timestamp.toNumber(), timestamp, "Timestamp should match");
        });

        it("should not allow non-admin to record a transaction", async () => {
            const timestamp = Math.floor(Date.now() / 1000); // Current timestamp
            try {
                await transactionInstance.recordTransaction(user1, user2, "Payment", timestamp, { from: nonAdmin });
                assert.fail("Only admin should be able to record transactions");
            } catch (error) {
                assert(error.message.includes("Only admin can perform this action"), "Expected only admin error");
            }
        });
    });

    describe("Admin Transfer", () => {
        const newAdmin = accounts[4];

        it("should transfer admin rights", async () => {
            await transactionInstance.transferAdmin(newAdmin, { from: admin });
            const currentAdmin = await transactionInstance.admin();
            assert.equal(currentAdmin, newAdmin, "The new admin should be the newAdmin account");

            // Revert back to original admin for further testing
            await transactionInstance.transferAdmin(admin, { from: newAdmin });
        });

        it("should not allow non-admin to transfer admin rights", async () => {
            try {
                await transactionInstance.transferAdmin(nonAdmin, { from: nonAdmin });
                assert.fail("Only admin should be able to transfer admin rights");
            } catch (error) {
                assert(error.message.includes("Only admin can perform this action"), "Expected only admin error");
            }
        });

        it("should not transfer admin rights to zero address", async () => {
            try {
                await transactionInstance.transferAdmin("address", { from: admin });
                assert.fail("Cannot transfer admin rights to zero address");
            } catch (error) {
                assert(error.message.includes("New admin address cannot be zero address"), "Expected zero address error");
            }
        });
    });
});
