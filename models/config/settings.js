// mettre ça dans les setting du projet

module.exports = {
    database   : {
        protocol : "mysql",
        query    : { pool: true },
        host     : process.env.DB_HOST,
        database : process.env.DB_DATABASE_NAME || 'm6fljbi9c3pe9xgt',
        user     : process.env.DB_USERNAME,
        password : process.env.DB_PASSWORD,
        JAWSDB_URL: process.env.JAWSDB_URL
    }
};