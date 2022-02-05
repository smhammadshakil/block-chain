const { BlockChain, Transactions } =require('./blockChain')
const EC = require('elliptic').ec

const ec = new EC('secp256k1')
// private key from keygenerator
const myKey = ec.keyFromPrivate('de2d158f3f3559e8a76860ab64aa29c112c17c67e95ff99a034ae6535f0ab19f')
const myWallet = myKey.getPublic('hex')

let hammadCoin = new BlockChain()

// Mine first block
hammadCoin.minePendingTransactions(myWallet) // wallet balance = 100

// Create a transaction & sign it with your key
const tx1 = new Transactions(myWallet, 'address2', 20) // wallet balance = 100 - 20 = 80
tx1.signTransaction(myKey)
hammadCoin.addTransaction(tx1)


// Mine block
hammadCoin.minePendingTransactions(myWallet) // wallet balance = 80 + 100 = 180

// Create second transaction
const tx2 = new Transactions(myWallet, 'address1', 50) // wallet balance = 180 - 50 = 130
tx2.signTransaction(myKey)
hammadCoin.addTransaction(tx2)

// Mine block
hammadCoin.minePendingTransactions(myWallet)

console.log(`Balance of hammad is ${hammadCoin.getBalanceOfAddress(myWallet)}`) // wallet balance = 130

console.log('Is chain VALID? ', hammadCoin.isChainValid())
