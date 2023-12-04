const axios = require('axios');
const config = require('../config/config');
const fs = require("fs").promises

module.exports = {

    async generateKey(length = 256 ) {
        const { generateKeySync } = await import('node:crypto');
        const key = generateKeySync('aes', { length: length })
        return key.export().toString('hex')
    },

    async generatePublicKey(key) {
        const data = {
            "key": key,
            "client_email": config.als.email,
            "post_key": config.als.post_key
        }
        const { publicEncrypt } = await import('node:crypto');
        var constants = require("constants");
        const buffer = Buffer.from(JSON.stringify(data), 'utf8');
        var cert = await fs.readFile('./app/config/key/als.pem', "ascii")
        const encrypted = publicEncrypt({"key":cert, padding: constants.RSA_PKCS1_PADDING}, buffer);
        return encrypted.toString('hex');
    },
    async encryptPayload(key, data) {
        const { randomBytes, createCipheriv } = await import('node:crypto');
        const iv = randomBytes(16);
        const cipher = createCipheriv('aes256', Buffer.from(key, 'hex'), iv);
        let encrypted = cipher.update(JSON.stringify(data), 'utf-8', 'hex') + cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    },

    async decryptPayload(key, encode) {
        try {
            const { createDecipheriv } = await import('node:crypto');
            const textParts = encode.split(':');
            const iv = Buffer.from(textParts.shift(), 'hex');
            const messageText = textParts.shift();
            const decipher = createDecipheriv('aes256', Buffer.from(key, 'hex'), iv);
            const decrypted = decipher.update(messageText, 'hex', 'utf-8') + decipher.final('utf-8');
            return JSON.parse(decrypted.toString());
        } catch (error) {
            console.log(error)
        }
    },
    
    async checkAlerlist(data) {

        // Test Error
        // if(Math.floor(Math.random() * 20) >= 15) return {'http_status': 500, 'status_code':0, 'status':2, 'message': 'Unable connect to system alert list.', 'response': null}

        // // Test banned
        // if(Math.floor(Math.random() * 20) >= 10) return {'http_status': 200, 'status_code':1, 'status':1, 'message': 'This passport is on the blacklist.', 'response': null}

        // Test allowed
        return {'http_status': 200, 'status_code':1, 'status':0, 'message': null, 'response': null}

        const secret_key = await this.generateKey()
        const encrypt = await this.generatePublicKey(secret_key)
        const payload = await this.encryptPayload(secret_key, data)
        const body = {
            'public_key_id': config.als.public_key_id,
            'encrypt': encrypt,
            'payload': payload,
        }
        const url = config.als.url+'al-report/setProfileEncrypted'
        var message = null
        try {
            const response = await axios.post(url, body)
            const result = await this.decryptPayload(secret_key, response.data.payload)
            if(result) {
                var status = 0
                if(result.header_key != undefined && result.header_key != null) {
                    status = 1
                    message = 'This passport is on the blacklist.'
                }
                return {'http_status': response.status, 'status_code':1, 'status':status, 'message': message, 'response': result}
            }
            return {'http_status': 500, 'status_code':5, 'status':2, 'message': 'Unable to decrypt data.', 'response': response.data}
        } catch(error) {
            var status_code = error.response != undefined ? 2 : 0
            if(error.response != undefined) {
                if(error.response.status == '400' || error.response.status == '401') status_code = 3
                if(error.response.status == '404') status_code = 4
                if(error.response.data.message != undefined) message = error.response.data.message
                if(!message && error.response.data.error != undefined) message = error.response.data.error
            }
            if(!message) message = error.response != undefined ? 'Something went wrong, please try again!' : 'No internet connection.'
            return {'http_status': error.response != undefined ? error.response.status : 500, 'status_code':status_code, 'status':2, 'message': message, 'response': error.response != undefined ? error.response.data : null}
        }
    }


}