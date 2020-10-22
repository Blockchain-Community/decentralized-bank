const { assert } = require('chai')
const { default: Web3 } = require('web3')

const DecentralizedBank = artifacts.require('./DecentralizedBank.sol')

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('Decentragram', ([deployer, currentUser, sender]) => {
    let decentralizedBank

    // before method is used to initiate the contract
    before(async () => {
        decentralizedBank = await DecentralizedBank.deployed()
    })

    // check if the app is deployed
    describe('deployment', async () => {
        // it method checks the specific task
        it('deploys successfully', async () => {
            // check if the address is valid
            const address = await decentralizedBank.address
            assert.notEqual(address, 0x0)
            assert.notEqual(address, '')
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })

        // checks if the name is retrieved successfully
        it('has a user count', async () => {
            const userCount = await decentralizedBank.userCount()
            assert.equal(userCount, 0)
        })
    })

    describe('users', async () => {
        let result, userCount

        before(async () => {
            result = await decentralizedBank.createUser(
                'Laxman Rai',
                {
                    from: currentUser
                }
            )
            userCount = await decentralizedBank.userCount()
        })

        it('create users', async () => {
            // success
            assert.equal(userCount, 1)
            const event = result.logs[0].args

            assert.equal(event.id.toNumber(), userCount.toNumber(), 'id is correct')
            assert.equal(event.userName, 'Laxman Rai', 'description is correct')
            assert.equal(event.userAddress, currentUser, 'user is correct')
            assert.equal(event.amount, '0', 'amount is correct')

            // failure: user must have a username
            await decentralizedBank.createUser('', { from: currentUser }).should.be.rejected
        })

        it('lists users', async () => {
            const user = await decentralizedBank.users(userCount)

            assert.equal(user.id.toNumber(), userCount.toNumber(), 'id is correct')
            assert.equal(user.userName, 'Laxman Rai', 'description is correct')
            assert.equal(user.userAddress, currentUser, 'user is correct')
            assert.equal(user.amount, '0', 'amount is correct')
        })

        it('allows users to send amounts', async () => {
            // Track the author balance before purchase
            let oldAuthorBalance
            oldAuthorBalance = await web3.eth.getBalance(currentUser)
            oldAuthorBalance = new web3.utils.BN(oldAuthorBalance)

            result = await decentralizedBank.sendAmount(userCount, { from: sender, value: web3.utils.toWei('1', 'Ether') })

            // SUCCESS
            const event = result.logs[0].args

            assert.equal(event.id.toNumber(), userCount.toNumber(), 'id is correct')
            assert.equal(event.userName, 'Laxman Rai', 'description is correct')
            assert.equal(event.userAddress, currentUser, 'user is correct')
            assert.equal(event.amount, '1000000000000000000', 'amount is correct')

            // Check that user received funds
            let newAuthorBalance
            newAuthorBalance = await web3.eth.getBalance(currentUser)
            newAuthorBalance = new web3.utils.BN(newAuthorBalance)

            let sendUserAmount
            sendUserAmount = web3.utils.toWei('1', 'Ether')
            sendUserAmount = new web3.utils.BN(sendUserAmount)

            const expectedBalance = oldAuthorBalance.add(sendUserAmount)

            assert.equal(newAuthorBalance.toString(), expectedBalance.toString())

            // FAILURE: Tries to a send amount to user that does not exist
            await decentralizedBank.sendAmount(99, { from: sender, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected
        })
    })
})