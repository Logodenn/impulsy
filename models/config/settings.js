// mettre ça dans les setting du projet

module.exports = {
    database   : {
        protocol : "mysql",
        query    : { pool: true },
        host     : process.env.DB_HOST,
        database : process.env.DB_DATABASE_NAME,
        user     : process.env.DB_USERNAME,
        password : process.env.DB_PASSWORD
    }
};