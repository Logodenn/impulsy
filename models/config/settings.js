// mettre ça dans les setting du projet

var settings = {
    database   : {
        protocol : "mysql",
        query    : { pool: true },
        host     : "127.0.0.1",
        database : "mydb",
        user     : "root",
        password : "1234"
    }
};

module.exports = settings;