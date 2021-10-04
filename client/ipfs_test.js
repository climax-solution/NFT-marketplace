const create = require('ipfs-http-client').create

const client = create('http://127.0.0.1:5001')

client.add('Hello world!').then(result => {
    console.log(result)
})
