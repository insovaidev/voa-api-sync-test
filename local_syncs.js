// Set Default Timezone
process.env.TZ = 'Asia/Phnom_Penh'
const express = require('express')
const local_syncs = express()
const cors = require('cors')
require('dotenv').config()
const PORT = 5001 
const CENTRAL_SYNC_API = process.env.CENTRAL_SYNC_API

const fs = require('fs')
const config = require('./app/config/config')
const axios = require('axios')
const FormData = require('form-data');
const activityLogModel = require("./app/models/activityLogModel")
const portModel = require("./app/models/portModel")
const userModel = require("./app/models/userModel")
const visaModel = require("./app/models/visaModel")
const visaTypeModel = require('./app/models/visaTypeModel')
const countryModel = require('./app/models/countryModel')
const passportModel = require('./app/models/passportModel')
const checklistModel = require("./app/models/checklistModel")
const printedVisasModel = require('./app/models/printedVisasModel')
const deletedVisasModel = require('./app/models/deletedVisasModel')

// Allow close domain
local_syncs.use(cors())

// Accept Form Submition
const bodyParser = require('body-parser')
local_syncs.use(bodyParser.json()) // for parsing application/json
local_syncs.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded


// Enable public resource
local_syncs.use(express.static('public'))

// Public Folder
local_syncs.use('/uploads', express.static('uploads'))

// Users
local_syncs.post('/local_syncs/users', async (req, res) => {    
    console.log('users')  
    const portCode = ['PHN'] // Port that can use this server.
    var sync_logs = {}
    if(result = await fs.readFileSync('sync_logs')) sync_logs = JSON.parse(result)
    var sid = sync_logs.users != undefined ? sync_logs.users : 0
    
    try {    
        const request = await axios.post(CENTRAL_SYNC_API+'central_syncs/users', {'sid': parseInt(sid), 'ports': portCode})         
        if(request && request.data != null && request.data.data) {
                for(var i in request.data.data) {
                    var val = request.data.data[i]
                    if(sid<=val.sid) sid = val.sid
                    delete val.sid
                    const user = await userModel.get({select: '*', filters: {'uid': val.uid}})
                    if(user) {
                        await userModel.updateSync(val)
                    } else {
                        await userModel.addSync(val)
                    }
                }
            }
            sync_logs.users = sid
            fs.writeFileSync('sync_logs', JSON.stringify(sync_logs))
            return res.send({'sid': sid })
    } catch (error) {
        // 
    }
})

// Profiles
local_syncs.post('/local_syncs/profile', async (req, res) => {
    console.log('profile')  
    var sync_logs = {}
    if(result = fs.readFileSync('sync_logs')) sync_logs = JSON.parse(result)
    var sid = sync_logs.profile != undefined ? sync_logs.profile : 0       
    const data = await userModel.getUserSync({select: 'bin_to_uuid(u.uid) as uid, u.password, u.phone, u.sex, u.name, u.email, u.updated_at, s.sid' , filters: {'sid': sid}})
    try {
        if(data && data.length){
            if(sync_reaspone = await axios.post(CENTRAL_SYNC_API+'central_syncs/profile', { 'data': data })){
                if(sync_reaspone.data.sid){
                    sync_logs.profile = sync_reaspone.data.sid
                    fs.writeFileSync('sync_logs', JSON.stringify(sync_logs))
                } 
            }

        }
        return res.send({'sid': sync_logs.profile})
    } catch (error) {
        // console.log('sync error')
    }
})

// Ports
local_syncs.post('/local_syncs/ports', async (req, res) => {
    var sync_logs = {}
    let request = null;
    if(result = fs.readFileSync('sync_logs')) sync_logs = JSON.parse(result)
    var sid = sync_logs.ports != undefined ? sync_logs.ports : 0 
    try {
        request = await axios.post(CENTRAL_SYNC_API+'central_syncs/ports', {'sid': parseInt(sid)})    
        if(request.data != null && request.data.data) {
            for(var i in request.data.data) {
                var val = request.data.data[i]
                // check record
                if(sid<=val.sid) sid = val.sid
                delete val.sid
                const port = await portModel.getOne({select: '*', filters: {'id': val.id}})
                if(port) {
                    await portModel.updateSync(val)
                }
                else {
                    await portModel.addSync(val)
                }
            }
        }
        sync_logs.ports = sid
        fs.writeFileSync('sync_logs', JSON.stringify(sync_logs))
        res.send({'sid':sid})
    } catch (error) {
        // 
    }
})

// Visa Types
local_syncs.post('/local_syncs/visa_types', async (req, res) => {
    var sync_logs = {}
    var request = null
    if(result = fs.readFileSync('sync_logs')) sync_logs = JSON.parse(result)
    var sid = sync_logs.visa_types != undefined ? sync_logs.visa_types : 0 
    try {
        request = await axios.post(CENTRAL_SYNC_API+'central_syncs/visa_types', {'sid': parseInt(sid)})    
        if(request.data != null && request.data.data) {
            for(var i in request.data.data) {
                var val = request.data.data[i]
                // check record
                if(sid<=val.sid) sid = val.sid
                delete val.sid
                const visaType = await visaTypeModel.getOne({select: '*', filters: {'id': val.id}})
                if(visaType) {
                    await visaTypeModel.updateSync(val)
                } else {
                    await visaTypeModel.addSync(val)
                }
            }
        }
        sync_logs.visa_types = sid
        fs.writeFileSync('sync_logs', JSON.stringify(sync_logs))
        res.send({'sid':sid})
            
    } catch (error) {
        // 
    }
})

// Countries
local_syncs.post('/local_syncs/countries', async (req, res) => {
    var sync_logs = {}
    if(result = fs.readFileSync('sync_logs')) sync_logs = JSON.parse(result)
    var sid = sync_logs.countries != undefined ? sync_logs.countries : 0
    try {
        const request = await axios.post(CENTRAL_SYNC_API+'central_syncs/countries', {'sid': parseInt(sid)})    
        if(request.data != null && request.data.data) {
            for(var i in request.data.data) {
                var val = request.data.data[i]
                if(sid<=val.sid) sid = val.sid
                delete val.sid
                const country = await countryModel.getOne({select: '*', filters: {'id': val.id}})
                if(country) {
                    await countryModel.updateSync(val)
                } else {
                    await countryModel.addSync(val)
                }
            }
        }
        sync_logs.countries = sid
        fs.writeFileSync('sync_logs', JSON.stringify(sync_logs))
        res.send({'sid':sid})   
    } catch (error) {
        // 
    }        
})

// Activity Logs
local_syncs.post('/local_syncs/activity_logs', async (req, res) => {
    console.log('logs')
    let sync_logs = {}
    if(result = fs.readFileSync('sync_logs')) sync_logs = JSON.parse(result)
    let sid = sync_logs.activities != undefined ? sync_logs.activities : 0 
    const data = await activityLogModel.getActivitySync({select: 'a.*, bin_to_uuid(a.id) as id, bin_to_uuid(a.uid) as uid, bin_to_uuid(a.record_id) as record_id, s.sid', filters: {'sid': sid}})
    try {
        if(data && data.length){
            if(sync_reaspone = await axios.post(CENTRAL_SYNC_API+'central_syncs/activity_logs', { 'data': data })){
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

// Checklists
local_syncs.post('/local_syncs/checklists', async (req, res) => {
    console.log('checklists')
    let sync_logs = {}
    if(result = fs.readFileSync('sync_logs')) sync_logs = JSON.parse(result)
    let sid = sync_logs.checklists != undefined ? sync_logs.checklists : 0 
    const data = await checklistModel.getChecklistSync({select: 'c.*, bin_to_uuid(c.id) as id, bin_to_uuid(c.uid) as uid, s.sid',  filters: {'sid': '0'}})   
    try {
        if(data && data.length){
            if(sync_reaspone = await axios.post(CENTRAL_SYNC_API+'central_syncs/checklists', { 'data': data })){
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

// Passports
local_syncs.post('/local_syncs/passports', async (req, res) => {
    console.log('passports')
    let sync_logs = {}
    if(result = fs.readFileSync('sync_logs')) sync_logs = JSON.parse(result)
    let sid = sync_logs.passports != undefined ? sync_logs.passports : 0 
    const data = await passportModel.getPassportSync({select: 'p.*, bin_to_uuid(p.pid) as pid, bin_to_uuid(p.vid) as vid, bin_to_uuid(p.uid) as uid, s.sid',  filters: {'sid': '0'}})
    try {
        if(data && data.length){
            if(sync_reaspone = await axios.post(CENTRAL_SYNC_API+'central_syncs/passports', { 'data': data })){
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

// Visas
local_syncs.post('/local_syncs/visas', async (req, res) => {
    console.log('visas')
    let sync_logs = {}
    if(result = fs.readFileSync('sync_logs')) sync_logs = JSON.parse(result)
    let sid = sync_logs.visas != undefined ? sync_logs.visas : 0 
    const data = await visaModel.getVisaSync({select: 'v.*, bin_to_uuid(v.vid) as vid, bin_to_uuid(v.uid) as uid, s.sid',  filters: {'sid': '0'}})                   
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
                            const upload = await axios.post(CENTRAL_SYNC_API+'upload_sync', data, { headers: { 'attachments': value,  'accept': 'application/json', 'Accept-Language': 'en-US,en;q=0.8','Content-Type': `multipart/form-data; boundary=${data._boundary}`,}})  
                        } catch (error) {
                            //  
                        }          
                    }
                }                  
            } 
        })
        try {
            if(sync_reaspone = await axios.post(CENTRAL_SYNC_API+'central_syncs/visas', { 'data': data })){
                if(sync_reaspone.data.sid){
                    sync_logs.visas = sync_reaspone.data.sid
                    fs.writeFileSync('sync_logs', JSON.stringify(sync_logs))
                } 
            }
            return res.send({'sid': sync_logs.visas})
        } catch (error) {
            // console.log('sync error')
        }
    }
    // next()
})

// Printed Visas
local_syncs.post('/local_syncs/printed_visas', async (req, res) => {
    console.log('printed')
    let sync_logs = {}
    if(result = fs.readFileSync('sync_logs')) sync_logs = JSON.parse(result)
    let sid = sync_logs.printed_visas != undefined ? sync_logs.printed_visas : 0 
    const data = await printedVisasModel.getVisasSync({select: 'pv.*, bin_to_uuid(pv.id) as id, bin_to_uuid(pv.vid) as vid, bin_to_uuid(pv.uid) as uid, s.sid',  filters: {'sid': sid}})           
    try {
        if(data && data.length){
            
            if(sync_reaspone = await axios.post(CENTRAL_SYNC_API+'central_syncs/printed_visas', { 'data': data })){
                if(sync_reaspone.data.sid){
                    sync_logs.printed_visas = sync_reaspone.data.sid
                    fs.writeFileSync('sync_logs', JSON.stringify(sync_logs))
                } 
            }
        }
        return res.send({'sid': sync_logs.printed_visas})
    } catch (error) {
        // console.log('sync error')
    }
})

// Deleted Visas
local_syncs.post('/local_syncs/deleted_visas', async (req, res) => {
    console.log('delete visas')
    let sync_logs = {}
    if(result = fs.readFileSync('sync_logs')) sync_logs = JSON.parse(result)
    let sid = sync_logs.deleted_visas != undefined ? sync_logs.deleted_visas : 0 
    const data = await deletedVisasModel.getVisasSync({select: 'dv.*, bin_to_uuid(dv.id) as id, bin_to_uuid(dv.vid) as vid, bin_to_uuid(dv.uid) as uid, s.sid',  filters: {'sid': sid}})                      
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
                            const upload = await axios.post(CENTRAL_SYNC_API+'upload_sync', data, { headers: { 'attachments': value,  'accept': 'application/json', 'Accept-Language': 'en-US,en;q=0.8','Content-Type': `multipart/form-data; boundary=${data._boundary}`,}})  
                        } catch (error) {
                            //  
                        }          
                    }
                }                  
            } 
        })
        try {
            if(sync_reaspone = await axios.post(CENTRAL_SYNC_API+'central_syncs/deleted_visas', { 'data': data })){
                if(sync_reaspone.data.sid){
                    sync_logs.deleted_visas = sync_reaspone.data.sid
                    fs.writeFileSync('sync_logs', JSON.stringify(sync_logs))
                } 
            }
        } catch (error) {
            // console.log(error)
        }
    }
    return res.send({'sid': sync_logs.deleted_visas})
})

local_syncs.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`)
})

local_syncs.use(function(req, res, next) {
  console.log(req.get('User-Agent'))
  res.locals.ua = req.get('User-Agent');
  next();
})

