module.exports = {
    app: {
        apiURL: 'v1'
    },
    port: process.env.PORT,
    database: {
        uri: process.env.MONGO_URI
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        tokenLife: '7d'
    }
}