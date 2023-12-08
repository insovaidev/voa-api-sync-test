// Set Default Timezone
process.env.TZ = 'Asia/Phnom_Penh'
const express = require('express')
const local_syncs = express()
const cors = require('cors')
require('dotenv').config()
const PORT = 5001

// Allow close domain
local_syncs.use(cors())

// Accept Form Submition
const bodyParser = require('body-parser')
local_syncs.use(bodyParser.json()) // for parsing application/json
local_syncs.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded


// Enable public resource
local_syncs.use(express.static('public'))

// Public Folder
local_syncs.use('/tmp', express.static('tmp'))
local_syncs.use('/pdf', express.static('pdf'))
local_syncs.use('/xlsx', express.static('xlsx'))
local_syncs.use('/uploads', express.static('uploads'))


const fs = require('fs')
const axios = require('axios')
const config = require('./app/config/config')
const userModel = require('./app/models/userModel')
const CENTRAL_SYNC_API = process.env.CENTRAL_SYNC_API

// Add Update users data from Central
local_syncs.post('/local_syncs/users', async (req, res) => {      
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
        // 
    }
})

local_syncs.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`)
})

local_syncs.use(function(req, res, next) {
  console.log(req.get('User-Agent'))
  res.locals.ua = req.get('User-Agent');
  next();
})

