const tokenLib = require("./tokenLib")
const generalLib = require("./generalLib")
const userModel = require('../models/userModel')
const lang = require('../language/en.json')
const tokenModel = require("../models/tokenModel")
const deviceModel = require("../models/deviceModel")
const portModel = require("../models/portModel")

module.exports = {
    check: async function(req) {
        const token = req.headers['access-token'] != undefined && req.headers['access-token'] ? req.headers['access-token'] : null    
        const deviceId = req.headers['device-id'] != undefined && req.headers['device-id'] ? req.headers['device-id'] : null      
    
        if(token && deviceId) {
            if(device = await deviceModel.get({filters: {'device_id, port': deviceId}})){
                if(device.status==0) return {'status':403, 'message': lang.deviePending}     
                if(device.status==2) return {'status':403, 'message': lang.deviceBanned}     
                
                // Check Port is Published
                if(port = await portModel.get(device.port, 'code')){
                    if(port.published != 1) return {'status': 403, 'message': `Port ${device.port} is not published.`}
                }

                const result = await tokenLib.verify(token, deviceId)
            
                if(result.status !== 200) return {'status':result.status, 'message': result.message}

                // update token: last_use_at
                await tokenModel.updateLastUsed(result.data.id, {'last_used_at':generalLib.dateTime()})

                // update device: last_active_at
                await deviceModel.updateLastUserActive(deviceId, {'last_active_at': generalLib.dateTime() }, 'device_id')

                const user = await userModel.get({select: 'bin_to_uuid(uid) as uid, name, port, role, username, phone, email, permissions, banned', filters: {'uid': result.payload.sub}})
                
                if(user) {
                    if(user.banned == 1) return {'status':403, 'message': lang.userBanned}     
                    result.user = generalLib.loginInfo(user)
                    return result
                } 
            }
        }
        return {'status':400, 'message': lang.missingToken}
    }
}
