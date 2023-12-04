const bcrypt = require('bcrypt');
const config = require('../config/config');

module.exports = {
  
    generate: function(length) {
      let result = '';
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const charactersLength = characters.length;
      let counter = 0;
      while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
      }
      return result;
    },

    compare: async function(password, hash) {
        return await bcrypt.compare(config.key+''+password, hash)
    },

    hash: async function(password) {
        return await bcrypt.hash(config.key+''+password, config.saltHashPassword);
    }
  
  }
  
