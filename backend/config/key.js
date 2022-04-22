module.exports = {
    app: {
        apiURL: 'v1'
    },
    port: process.env.PORT,
    database: {
        uri: process.env.MONGO_URI
    },
    jwt: {
        secret: "climax",
        tokenLife: '7d'
    },
    ADMIN: {
        secret: "NFTD Admin",
        tokenLife: '1h'
    }
}