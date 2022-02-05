const EC = require('elliptic').ec
const SHA256 = require('crypto-js/SHA256')

const ec = new EC('secp256k1')

class Transactions {
    constructor(fromAddress, toAddress , amount) {
        this.fromAddress = fromAddress
        this.toAddress = toAddress
        this.amount = amount
    }
    calculateHash() {
        return SHA256(
            this.fromAddress +
            this.toAddress +
            this.amount
        ).toString()
    }
    signTransaction(signingKey) {
        if (signingKey.getPublic('hex') !== this.fromAddress) {
            throw new Error('You can not sign transaction of other wallets')
        }

        const hash = this.calculateHash()
        const sig = signingKey.sign(hash, 'base64')
        this.signature = sig.toDER('hex')
    }

    isValid() {
        if (this.fromAddress === null) return true
        if (!this.signature || this.signature.length === 0) {
            throw new Error('No signature in the transaction')
        }
        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex')
        return publicKey.verify(this.calculateHash(), this.signature)
    }
}

class Block {
    constructor(timestamp, transactions, previousHash = '') {
        this.timestamp = timestamp
        this.transactions = transactions
        this.previousHash = previousHash
        this.hash = this.calculateHash()
        this.nonce = 0 
    }
    calculateHash() {
        return SHA256(
            this.previousHash +
            this.timestamp +
            JSON.stringify(this.transactions) +
            this.nonce
        ).toString()
    }

    miningBlock(difficulty) {
        // proof of work
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
            this.nonce++
            this.hash = this.calculateHash()
        }
        console.log('Block mined', this.hash)
    }

    hasValidTransaction() {
        for (const tx of this.transactions) {
            if (!tx.isValid()) return false
        }
        return true
    }
}

class BlockChain {
    constructor() {
        this.chain = [this.createGenesisBlock()]
        this.difficulty = 5
        this.pendingTransactions = []
        this.miningReward = 100
    }

    createGenesisBlock() {
        return new Block('01/01/2017', 'Genesis Block', '0')
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1]
    }

    addBlock(newBlock) {
        newBlock.previousHash = this.getLatestBlock().hash
        newBlock.miningBlock(this.difficulty)
        this.chain.push(newBlock)
    }

    minePendingTransactions(miningRewardAddress) {
        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash)
        block.miningBlock(this.difficulty)
        this.chain.push(block)

        console.log('Block is mined and pushed to the chain')
        this.pendingTransactions = [new Transactions(null, miningRewardAddress, this.miningReward)]
    }

    addTransaction(transaction) {
        if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('Transaction must have from and to address')
        }
        if (!transaction.isValid()) {
            throw new Error('Can not add invalid transaction to the chain.')
        }
        this.pendingTransactions.push(transaction)
    }
    
    getBalanceOfAddress(address) {
        let balance = 0
        for(const block of this.chain) {
            for (const transaction of block.transactions) {
                if (transaction.toAddress === address) {
                    balance += transaction.amount
                }
                if (transaction.fromAddress === address) {
                    balance -= transaction.amount
                }
            }
        }

        return balance
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const current = this.chain[i]
            const prev = this.chain[i - 1]
            if (!current.hasValidTransaction()) {
                return false
            }
            if (current.hash !== current.calculateHash()) {
                return false
            }
            if (current.previousHash !== prev.hash) {
                return false
            }
        }
        return true
    }
}

module.exports.BlockChain = BlockChain
module.exports.Transactions = Transactions