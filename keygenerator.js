const EC = require('elliptic').ec

const ec = new EC('secp256k1')

const key = ec.genKeyPair()
const publicKey = key.getPublic('hex')
const privateKey = key.getPrivate('hex')

console.log('Public Key >', publicKey)
console.log('Private Key >', privateKey)


// Public Key > 04b4463f634bc1ed3d6cbcd0813656839a7c9c1ef3b801ecd41e484db8ce35ddfa5f1c763c2558ec6a62de6c327cfda494d8f58f4443e9a8f800babc22916144cb
// Private Key > 53617eca95de49a76f8f9b1c315a6f3a480a952ddeb3188f05d50bcba59412d3