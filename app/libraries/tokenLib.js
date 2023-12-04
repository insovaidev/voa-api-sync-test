const jwt = require('jose')
const alg = 'RS256'
const fs = require("fs").promises
const passwordLib = require('./passwordLib')
const generalLib = require('./generalLib')
const tokenModel = require('../models/tokenModel')
const config = require('../config/config')
const lang = require('../language/en.json')
const deviceModel = require('../models/deviceModel')

module.exports = {
    
    // Generate Access Token & Refresh Token
    generate: async function(req, user, deviceId, existToken=null) {
        try {
            // Token ID
            const jti = existToken && !config.regenerateTokenId ? existToken.token : Buffer.from(user.uid+'').toString('base64').replaceAll('=','')+''+passwordLib.generate(60)
            let accessToken = null    
            let refreshToken = null
            const device = await deviceModel.get({filters: {'device_id': deviceId}})
            
            await Promise.all([
                this.create({
                    'jti': jti,
                    'sub': user.uid+'',
                    'role': user.role,
                    'port': user.port ? user.port : device.port,
                }).then(val => accessToken = val),
                this.create({
                    'jti': jti,
                    'sub': user.uid+'',
                    'port': user.port ? user.port : device.port,
                }, false).then(val => refreshToken = val)
            ])

            // Save Token
            if(accessToken && refreshToken) {
                const tokenData = {
                    'id': generalLib.generateUUID(),
                    'uid': user.uid,
                    'token': jti,
                    'device_id': deviceId,
                    'port': device.port,
                    'ip': generalLib.getIp(req),
                    'expire_at': generalLib.dateTime({addYear: 1}),
                    'user_agent': req.headers["user-agent"],
                    'issued_at': generalLib.dateTime(),
                }
      
                if(existToken) {
                    tokenModel.update(existToken.id, tokenData)
                } else {
                    tokenModel.add(tokenData)
                } 
  
                return {'access_token':accessToken, 'expires_in': config.accessTokenExpiration, 'refresh_token': refreshToken}
            }

        } catch (error) {
            // console.log(error)
        }
        return null
    },

    // Veriry access token or refresh token
    verify: async function(token, deviceId, isAccessToken=true, twoStepVerification=true) {
        try {
            var cert = await fs.readFile('./app/config/key/'+(isAccessToken?'accessTokenPublicKey.pem':'refreshTokenPublicKey.pem'), "ascii")
            const key = await jwt.importSPKI(cert, alg)
            const { payload, protectedHeader } = await jwt.jwtVerify(token, key)
            if(payload.jti != undefined && payload.jti) {
                if(!twoStepVerification) return {'status': 200, 'payload': payload}  
                // Verify the key in table token is still there or not?
                const data = await tokenModel.get({select: 'bin_to_uuid(id) as id, expire_at, port', filters: {'token': payload.jti, 'device_id': deviceId, 'active': true }})
                
                // Verify Device port && User port
                const device = await deviceModel.get({filters: {'device_id': deviceId}})
                if(device && device.port!=data.port) return {'status': 401, 'message': 'The user port and device port do not match.'}

                if(data) return {'status': 200, 'payload': payload, 'data':data}           
            }
        } catch (error) {
            // console.log(error)
            // return {'status': 401, 'message': 'Token '+error.message}
        }
        return {'status': 401, 'message': lang.invalidToken}
    },

    // Create access token or refresh token
    create: async function(payload, isAccessToken=true) {
        var cert = await fs.readFile('./app/config/key/'+(isAccessToken?'accessTokenPrivateKey.pem':'refreshTokenPrivateKey.pem'), "ascii")
        const key = await jwt.importPKCS8(cert, alg)
        const token = await new jwt.SignJWT(payload)
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setExpirationTime(isAccessToken?config.accessTokenExpiration+'s':config.refreshTokenExpiration+'d')
        .sign(key)
        return token
    },

    // Remove Token
    remove: async function(req) {
        const token = req.headers["refresh-token"] != undefined ? req.headers["refresh-token"] : null
        const deviceId = req.headers['device-id'] != undefined && req.headers['device-id'] ? req.headers['device-id'] : null      
        
        if(token && deviceId) {
            const result = await this.verify(token, deviceId, false, false)

            const device = await deviceModel.get({filters: {'device_id': deviceId}})

            // Not match port
            if(device && device.port!=result.payload.port) return {'status': 401, 'message': lang.invalidToken}
            
            if(device && result.status == 200) {
                tokenModel.delete(result.payload.jti, 'token')
                await deviceModel.update(deviceId, {'uid': null}, 'device_id')
                return {'status': 200, 'payload': result.payload}
            }

            return result
        }
        return {'status': 400, 'message': lang.missingToken}
    },


}
