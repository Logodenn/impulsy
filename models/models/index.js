const orm = require('orm')

const logger = require('../../utils/logger')(module)
const settings = require('../config/settings')

let connection = null

const setup = (db, callback) => {
  require('./track')(orm, db)
  require('./user')(orm, db)
  require('./score')(orm, db)

  return callback(null, db)
}

module.exports = (callback) => {
  if (connection) {
    return callback(null, connection)
  }

  orm.connect(settings.database, (err, db) => {
    if (err) {
      logger.error(err)

      return callback(err)
    }

    connection = db

    db.driver.execQuery(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_DATABASE_NAME}`, (err, result) => {
      if (err) {
        logger.error(err)

        callback(err)
      } else {
        logger.info('Database created')

        db.settings.set('instance.returnAllErrors', true)

        setup(db, callback)
      }
    })
  })
}
