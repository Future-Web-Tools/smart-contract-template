async function main () {
  const [deployer] = await ethers.getSigners()

  console.log('Deploying contracts with the account:', deployer.address)
  console.log('Account balance:', (await deployer.getBalance()).toString())

  const Skeleton = await ethers.getContractFactory('Skeleton')
  const skeleton = await Skeleton.deploy()

  console.log('Skeleton address:', skeleton.address)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
