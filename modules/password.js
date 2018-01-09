var crypto = require('crypto');
const logger = require('../utils/logger')(module)

// https://ciphertrick.com/2016/01/18/salt-hash-passwords-using-nodejs-crypto/ 
/**
 * generates random string of characters i.e salt
 * @function
 * @param {number} length - Length of the random string.
 */
var genRandomString = function(length){
    return crypto.randomBytes(Math.ceil(length/2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0,length);   /** return required number of characters */
};

/**
 * hash password with sha512.
 * @function
 * @param {string} password - List of required fields.
 * @param {string} salt - Data to be validated.
 */
const sha512 = (password, salt) => {
    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt:salt,
        passwordHash:value
    };
};

const saltHashPassword = (userpassword) => {
    //var salt = genRandomString(20); /** Gives us salt of length 20 */
    var salt = "SaltLogodenn"
    var passwordData = sha512(userpassword, salt);
    logger.debug('UserPassword = '+userpassword);
    logger.debug('Passwordhash = '+passwordData.passwordHash);
    logger.debug('nSalt = '+passwordData.salt);
    return passwordData.passwordHash
};

module.exports = saltHashPassword;

// saltHashPassword('MYPASSWORD');
// saltHashPassword('MYPASSWORD');