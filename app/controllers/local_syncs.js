const fs = require('fs')
const config = require('../config/config')
const axios = require('axios')
const FormData = require('form-data');
const activityLogModel = require("../models/activityLogModel")
const portModel = require("../models/portModel")
const userModel = require("../models/userModel")
const visaModel = require("../models/visaModel")
const visaTypeModel = require('../models/visaTypeModel')
const countryModel = require('../models/countryModel')
const passportModel = require('../models/passportModel')
const checklistModel = require("../models/checklistModel")
const printedVisasModel = require('../models/printedVisasModel')
const deletedVisasModel = require('../models/deletedVisasModel')
const activityLogSyncModel = require('../models/activityLogSyncModel')
const checklistSyncModel = require('../models/checklistSyncModel')
const passportSyncModel = require('../models/passportSyncModel')
const visaSyncModel = require('../models/visaSyncModel') 
const printedVisasSyncModel = require('../models/printedVisasSyncModel')
const deletedVisasSyncModel = require('../models/deletedVisasSyncModel');


module.exports = function(app) {
    // app.use('/local_syncs', chec)

    app.post('/local_syncs/users', async (req, res, next) => {      
        var sync_logs = {}
        if(result = await fs.readFileSync('sync_logs')) sync_logs = JSON.parse(result)
        var sid = sync_logs.users != undefined ? sync_logs.users : 0
        
        try {    
            const request = await axios.post(config.centralUrl+'central_syncs/users', {'sid': parseInt(sid)})
            if(request && request.data != null && request.data.data) {
                    for(var i in request.data.data) {
                        var val = request.data.data[i]
                        if(sid<=val.sid) sid = val.sid
                        delete val.sid
                        const user = await userModel.get({select: '*', filters: {'uid': val.uid}})
                        if(user) {
                            await userModel.updateSync(request.data.data[i])
                        } else {
                            await userModel.addSync(request.data.data[i])
                        }
                    }
                }
                sync_logs.users = sid
                fs.writeFileSync('sync_logs', JSON.stringify(sync_logs))
                return res.send({'sid': sid })
        } catch (error) {
            next()
            // res.status(201).send({'message': 'CONFUSE SERVER'})
        }
    })

    app.post('/local_syncs/profile', async (req, res) => {
        var sync_logs = {}
        if(result = fs.readFileSync('sync_logs')) sync_logs = JSON.parse(result)
        var sid = sync_logs.profile != undefined ? sync_logs.profile : 0       
        const data = await userModel.getUserSync({select: 'bin_to_uuid(u.uid) as uid, u.password, u.phone, u.sex, u.name, u.email, u.updated_at, s.sid' , filters: {'sid': sid}})     
        if(data){
            const lastSid = data[0].sid
            try {
                const result = await axios.post(config.centralUrl+'central_syncs/profile', { 'data': data })
                if(result && result.status==200){
                    sync_logs.profile = lastSid
                    fs.writeFileSync('sync_logs', JSON.stringify(sync_logs))
                    return res.send({'message': 'sync success'})
                }
            } catch (error) {
                // console.log('sync error')
            }
        }
        return res.status(200).send({'message': 'Nothing update'})
    })

    app.post('/local_syncs/ports', async (req, res, next) => {
        var sync_logs = {}
        let request = null;
        if(result = fs.readFileSync('sync_logs')) sync_logs = JSON.parse(result)
        var sid = sync_logs.ports != undefined ? sync_logs.ports : 0 
        try {
            request = await axios.post(config.centralUrl+'central_syncs/ports', {'sid': parseInt(sid)})    
            if(request.data != null && request.data.data) {
                for(var i in request.data.data) {
                    var val = request.data.data[i]
                    // check record
                    if(sid<=val.sid) sid = val.sid
                    delete val.sid
                    const port = await portModel.getOne({select: '*', filters: {'id': val.id}})
                    if(port) {
                        await portModel.updateSync(request.data.data[i])
                    }
                    else {
                        await portModel.addSync(request.data.data[i])
                    }
                }
            }
            sync_logs.ports = sid
            fs.writeFileSync('sync_logs', JSON.stringify(sync_logs))
            res.send({'sid':sid})
        } catch (error) {
            next()
        }
    })

    app.post('/local_syncs/visa_types', async (req, res, next) => {
        var sync_logs = {}
        var request = null
        if(result = fs.readFileSync('sync_logs')) sync_logs = JSON.parse(result)
        var sid = sync_logs.visa_types != undefined ? sync_logs.visa_types : 0 
        try {
            request = await axios.post(config.centralUrl+'central_syncs/visa_types', {'sid': parseInt(sid)})    
            if(request.data != null && request.data.data) {
                for(var i in request.data.data) {
                    var val = request.data.data[i]
                    // check record
                    if(sid<=val.sid) sid = val.sid
                    delete val.sid
                    const visaType = await visaTypeModel.getOne({select: '*', filters: {'id': val.id}})
                    if(visaType) {
                        await visaTypeModel.updateSync(request.data.data[i])
                    } else {
                        await visaTypeModel.addSync(request.data.data[i])
                    }
                }
            }
            sync_logs.visa_types = sid
            fs.writeFileSync('sync_logs', JSON.stringify(sync_logs))
            res.send({'sid':sid})
                
        } catch (error) {
            next() 
        }
    })

    app.post('/local_syncs/countries', async (req, res, next) => {
        var sync_logs = {}
        if(result = fs.readFileSync('sync_logs')) sync_logs = JSON.parse(result)
        var sid = sync_logs.countries != undefined ? sync_logs.countries : 0

        try {
            const request = await axios.post(config.centralUrl+'central_syncs/countries', {'sid': parseInt(sid)})    
            if(request.data != null && request.data.data) {
                for(var i in request.data.data) {
                    var val = request.data.data[i]
                    if(sid<=val.sid) sid = val.sid
                    delete val.sid
                    const country = await countryModel.getOne({select: '*', filters: {'id': val.id}})
                    if(country) {
                        await countryModel.updateSync(request.data.data[i])
                    } else {
                        await countryModel.addSync(request.data.data[i])
                    }
                }
            }
            sync_logs.countries = sid
            fs.writeFileSync('sync_logs', JSON.stringify(sync_logs))
            res.send({'sid':sid})   
        } catch (error) {
            next()
        }        
    })

    app.post('/local_syncs/activity_logs', async (req, res) => {
        let sync_logs = {}
        if(result = fs.readFileSync('sync_logs')) sync_logs = JSON.parse(result)
        let sid = sync_logs.activities != undefined ? sync_logs.activities : 0 
        const data = await activityLogModel.getActivitySync({select: 'a.*, bin_to_uuid(a.id) as id, bin_to_uuid(a.uid) as uid, bin_to_uuid(a.record_id) as record_id, s.sid', filters: {'sid': sid}})
        try {
            if(data && data.length){
                if(sync_reaspone = await axios.post(config.centralUrl+'central_syncs/activity_logs', { 'data': data })){
                    if(sync_reaspone.data.sid){
                        sync_logs.activities = sync_reaspone.data.sid
                        fs.writeFileSync('sync_logs', JSON.stringify(sync_logs))
                    } 
                }
            }
            return res.send({'sid': sync_logs.activities})
        } catch (error) {
            // console.log(error)
        }
    })

    app.post('/local_syncs/checklists', async (req, res) => {
        let sync_logs = {}
        if(result = fs.readFileSync('sync_logs')) sync_logs = JSON.parse(result)
        let sid = sync_logs.checklists != undefined ? sync_logs.checklists : 0 
        const data = await checklistModel.getChecklistSync({select: 'c.*, bin_to_uuid(c.id) as id, bin_to_uuid(c.uid) as uid, s.sid',  filters: {'sid': '0'}})   
        try {
            if(data && data.length){
                if(sync_reaspone = await axios.post(config.centralUrl+'central_syncs/checklists', { 'data': data })){
                    if(sync_reaspone.data.sid){
                        sync_logs.checklists = sync_reaspone.data.sid
                        fs.writeFileSync('sync_logs', JSON.stringify(sync_logs))
                    } 
                }
            }
            return res.send({'sid': sync_logs.checklists})
        } catch (error) {
            // console.log('sync error')
        }
    })

    app.post('/local_syncs/passports', async (req, res) => {
        let sync_logs = {}
        if(result = fs.readFileSync('sync_logs')) sync_logs = JSON.parse(result)
        let sid = sync_logs.passports != undefined ? sync_logs.passports : 0 
        const data = await passportModel.getPassportSync({select: 'p.*, bin_to_uuid(p.pid) as pid, bin_to_uuid(p.vid) as vid, bin_to_uuid(p.uid) as uid, s.sid',  filters: {'sid': '0'}})
        try {
            if(data && data.length){
                if(sync_reaspone = await axios.post(config.centralUrl+'central_syncs/passports', { 'data': data })){
                    if(sync_reaspone.data.sid){
                        sync_logs.passports = sync_reaspone.data.sid
                        fs.writeFileSync('sync_logs', JSON.stringify(sync_logs))
                    } 
                }
            }
            return res.send({'sid': sync_logs.passports})
        } catch (error) {
            // console.log('sync error')
        }
    })

    app.post('/local_syncs/visas', async (req, res, next) => {
        const data = await visaModel.getVisaSync({select: 'v.*, bin_to_uuid(v.vid) as vid, bin_to_uuid(v.uid) as uid',  filters: {'sid': '0'}})                   
        if(data && data.length ){
            // Upload To Central
            data.forEach(async val => {
                let attFiles = null
                if(val.attachments !=undefined ){
                    attFiles = JSON.parse(val.attachments)
                    if( attFiles !=undefined){
                        for (const [key, value] of Object.entries(attFiles)) {
                            const data = new FormData();
                            data.append('file', fs.createReadStream(config.uploadDir+value));
                            try {
                                const upload = await axios.post(config.centralUrl+'upload_sync', data, { headers: { 'attachments': value,  'accept': 'application/json', 'Accept-Language': 'en-US,en;q=0.8','Content-Type': `multipart/form-data; boundary=${data._boundary}`,}})  
                            } catch (error) {
                                //  
                            }          
                        }
                    }                  
               } 
            })

            // Send Data To Central
            try {
                const result = await axios.post(config.centralUrl+'syncs/visas_from_sub', { 'data': data })
                if(result && result.status==200){
                    await visaSyncModel.delete()
                    return res.send({'message': 'sync success'})
                }
            } catch (error) {
                // console.log('sync error')
            }
        }
        return res.status(200).send({'message': 'Nothing update'})
    })

    app.post('/local_syncs/printed_visas', async (req, res) => {
        const data = await printedVisasModel.getVisasSync({select: 'pv.*, bin_to_uuid(pv.id) as id, bin_to_uuid(pv.vid) as vid, bin_to_uuid(pv.uid) as uid',  filters: {'sid': '0'}})           
        if(data && data.length ){
            try {
            const result = await axios.post(config.centralUrl+'central_syncs/printed_visas', { 'data': data })
            if(result && result.status==200){
                await printedVisasSyncModel.delete()
                return res.send({'message': 'sync success'})
            }
        } catch (error) {
            // console.log('sync error')
        }}
        return res.status(200).send({'message': 'Nothing update'})
    })

    app.post('/local_syncs/deleted_visas', async (req, res) => {
        const data = await deletedVisasModel.getVisasSync({select: 'dv.*, bin_to_uuid(dv.id) as id, bin_to_uuid(dv.vid) as vid, bin_to_uuid(dv.uid) as uid',  filters: {'sid': '0'}})        
        if(data && data.length ){   
            // Upload To Central
            data.forEach(async val => {
                let attFiles = null
                if(val.attachments !=undefined ){
                    attFiles = JSON.parse(val.attachments)
                    if( attFiles !=undefined){
                        for (const [key, value] of Object.entries(attFiles)) {
                            const data = new FormData();
                            data.append('file', fs.createReadStream(config.uploadDir+value));
                            try {
                                const upload = await axios.post(config.centralUrl+'upload_sync', data, { headers: { 'attachments': value,  'accept': 'application/json', 'Accept-Language': 'en-US,en;q=0.8','Content-Type': `multipart/form-data; boundary=${data._boundary}`,}})  
                            } catch (error) {
                                //  
                            }          
                        }
                    }                  
                } 
            })
            try {
                const result = await axios.post(config.centralUrl+'central_syncs/deleted_visas', { 'data': data })
                if(result && result.status==200){
                    await deletedVisasSyncModel.delete()
                    return res.send({'message': 'sync success'})
                }
            } catch (error) {
                // console.log('sync error')
            }
        }
        return res.status(200).send({'message': 'Nothing update'})
    })
}