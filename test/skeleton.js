
const { expect } = require('chai')
const { provider } = waffle

describe('Skeleton contract', function () {
  let skeleton, admin1, admin2, user1, user2

  before(async () => {
    [admin1, admin2, user1, user2] = await ethers.getSigners()

    const Skeleton = await ethers.getContractFactory('Skeleton')
    skeleton = await Skeleton.deploy()
  })

  describe('stat tests', function () {
    it('should have a count of 0', async () => {
      expect((await skeleton.count())).to.equal(0)
    })
  })

  describe('admin tests', function () {
    it('admin can pause', async function () {
      await expect(skeleton.connect(admin1).pause())
        .to.emit(skeleton, 'Paused')

      expect(await skeleton.paused()).to.equal(true)
    })

    it('admin can unpause', async function () {
      await expect(skeleton.connect(admin1).unpause()).to.emit(skeleton, 'Unpaused')

      await expect(await skeleton.paused()).to.equal(false)
    })

    it('only admin can pause', async function () {
      await expect(skeleton.connect(user1).pause()).to.be.revertedWith('Not authorized')
    })

    it('only admin can unpause', async function () {
      await skeleton.connect(admin1).pause()
      await expect(await skeleton.paused()).to.equal(true)

      await expect(skeleton.connect(user1).unpause()).to.be.revertedWith('Not authorized')
      await expect(await skeleton.paused()).to.equal(true)

      await expect(skeleton.connect(admin1).unpause()).to.emit(skeleton, 'Unpaused')
      await expect(await skeleton.paused()).to.equal(false)
    })

    it('admin can add other admin', async function () {
      const initialAdminCount = (await skeleton.adminCount()).toNumber()

      await skeleton.connect(admin1).addAdmin(admin2.address)
      await expect(await skeleton.isAdmin(admin2.address)).to.equal(true)

      await expect((await skeleton.adminCount()).toNumber()).to.equal(initialAdminCount + 1)
    })

    it('admin can remove other admin', async function () {
      const initialAdminCount = (await skeleton.adminCount()).toNumber()

      await skeleton.connect(admin1).removeAdmin(admin2.address)
      await expect(await skeleton.isAdmin(admin2.address)).to.equal(false)

      await expect((await skeleton.adminCount()).toNumber()).to.equal(initialAdminCount - 1)
    })

    it('only admin can add other admin', async function () {
      const initialAdminCount = (await skeleton.adminCount()).toNumber()

      await expect(skeleton.connect(user1).addAdmin(user2.address)).to.be.revertedWith('Not authorized')
      await expect((await skeleton.adminCount()).toNumber()).to.equal(initialAdminCount)
    })

    it('only admin can remove other admin', async function () {
      await skeleton.connect(admin1).addAdmin(admin2.address)
      await expect(await skeleton.isAdmin(admin2.address)).to.equal(true)

      await expect(skeleton.connect(user1).removeAdmin(admin2.address)).to.be.revertedWith('Not authorized')
      await expect(await skeleton.isAdmin(admin2.address)).to.equal(true)
    })

    it('admin can renounce', async function () {
      await skeleton.connect(admin2).renounceAdmin()
      await expect(await skeleton.isAdmin(admin2.address)).to.equal(false)
    })

    it('cannot remove last admin', async function () {
      await expect(await skeleton.isAdmin(admin1.address)).to.equal(true)

      await expect(skeleton.connect(admin1).removeAdmin(admin1.address)).to.be.revertedWith('Cannot remove last admin')
      await expect(skeleton.connect(admin1).renounceAdmin()).to.be.revertedWith('Cannot remove last admin')

      await expect(await skeleton.isAdmin(admin1.address)).to.equal(true)
    })

    it('only admin can withdraw gas tokens', async function () {
      await admin1.sendTransaction({ to: skeleton.address, value: 10 })

      const initialUser1GasBalance = await provider.getBalance(user1.address)
      const contractGasBalance = await provider.getBalance(skeleton.address)

      const expectedUser1GasBalance = initialUser1GasBalance.add(contractGasBalance)

      await expect(skeleton.connect(user2).withdrawGas(user1.address)).to.be.revertedWith('Not authorized')
      await expect(skeleton.connect(admin1).withdrawGas(user1.address)).to.emit(skeleton, 'GasWithdrawn')

      expect((await provider.getBalance(user1.address))).to.equal(expectedUser1GasBalance)
    })
  })

  describe('user tests', function () {
    it('users can read', async function () {
      await expect(await skeleton.count()).to.equal(0)
      await expect(await skeleton.members(user1.address)).to.equal(false)
    })

    it('users can write', async function () {
      await expect(skeleton.connect(user1).register()).to.emit(skeleton, 'NewMember')

      await expect(await skeleton.count()).to.equal(1)
      await expect(await skeleton.members(user1.address)).to.equal(true)
    })

    it('no writes when paused', async function () {
      await skeleton.connect(admin1).pause()

      await expect(await skeleton.members(user2.address)).to.equal(false)
      await expect(skeleton.connect(user2).register()).to.be.revertedWith('Pausable: paused')

      await expect(await skeleton.members(user2.address)).to.equal(false)
    })

    it('writes work after pausing and unpausing', async function () {
      await skeleton.connect(admin1).unpause()

      await expect(await skeleton.members(user2.address)).to.equal(false)
      await expect(skeleton.connect(user2).register()).to.emit(skeleton, 'NewMember')

      await expect(await skeleton.members(user2.address)).to.equal(true)
    })
  })
})
