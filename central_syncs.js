// Set Default Timezone
process.env.TZ = 'Asia/Phnom_Penh'
const express = require('express')
const central_syncs = express()
const cors = require('cors')
require('dotenv').config()
const PORT = 3001

// Allow close domain
central_syncs.use(cors())

// Accept Form Submition
const bodyParser = require('body-parser')
central_syncs.use(bodyParser.json()) // for parsing application/json
central_syncs.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded


// Enable public resource
central_syncs.use(express.static('public'))

// Public Folder
central_syncs.use('/tmp', express.static('tmp'))
central_syncs.use('/pdf', express.static('pdf'))
central_syncs.use('/xlsx', express.static('xlsx'))
central_syncs.use('/uploads', express.static('uploads'))

// Configure 
const config = require('./app/config/config')

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

central_syncs.post('/central_syncs/users', async (req, res) => {
        var data = []
        if(req.body.sid != undefined && req.body.ports != undefined) {
            const sid = req.body.sid
            const ports = req.body.ports 
            data = await userModel.sync({select: 'u.*, bin_to_uuid(u.uid) as uid, s.sid', filters: {'sid': sid, 'ports': ports}})
        }
        res.send({'data': data && data.length ? data : null})
    })

central_syncs.post('/central_syncs/profile', async (req, res) => {
    const body = req.body
    if(body != null && body.data){
        try {
            let sid = 0
            for( i in body.data){
                const val = body.data[i]
                console.log('value', val)
                sid = val.sid
                const result = await userModel.getOne({select: '*', filters: {'uid': val.uid}})  
                delete val.sid   
                if(result){
                    await userModel.updateProfileSync(val.uid, val, 'uid')
                } 
            }
            return res.send({'sid': sid})    
        } catch (error) {
            // console.log(error)
        }
    }
})

central_syncs.post('/central_syncs/ports', async (req, res) => {
    var data = []
    if(req.body.sid != undefined) {
      var sid = req.body.sid
      data = await portModel.sync({select: 'p.*, bin_to_uuid(p.id) as id, s.sid', filters: {'sid': sid }}) 
    }
    res.send({'data': data && data.length ? data : null})
})

central_syncs.post('/central_syncs/visa_types', async (req, res) => {
    var data = []
    if(req.body.sid != undefined) {
      var sid = req.body.sid
      data = await visaTypeModel.sync({select: 'vt.*, bin_to_uuid(vt.id) as id, s.sid', filters: {'sid': sid }}) 
    }
    res.send({'data': data && data.length ? data : null})
})

central_syncs.post('/central_syncs/countries', async (req, res) => {
    var data = []
    if(req.body.sid != undefined) {
      var sid = req.body.sid
      data = await countryModel.sync({select: 'c.*, bin_to_uuid(c.id) as id, s.sid', filters: {'sid': sid }}) 
    }
    res.send({'data': data && data.length ? data : null})
})

central_syncs.post('/central_syncs/activity_logs', async (req, res) => {
    const body = req.body
    try {
        let sid = 0
        for( i in body.data){
            const val = body.data[i]
            sid = val.sid
            const activity_logs = await activityLogModel.get({select: '*', filters: {'id': val.id}})
            delete val.sid
            if(activity_logs == null){
                await activityLogModel.addSync(val)
            }
        }
        return res.send({'sid': sid})    
    } catch (error) {
    //  console.log(error)   
    }
})

central_syncs.post('/central_syncs/checklists', async (req, res) => {
    const body = req.body
    if(body != null && body.data){
        try {
            let sid = 0
            for( i in body.data){
                const val = body.data[i]
                sid = val.sid
                const result = await checklistModel.getOne({select: 'bin_to_uuid(id) as id', filters: {'id': val.id}})
                delete val.sid
                if(result==null){
                    await checklistModel.addSync(val)
                } else {
                    await checklistModel.updateSync(result.id, val, 'id')
                }   
            }
            return res.status(200).send({'sid': sid})    
        } catch (error) {
          // console.log('error')
        }
    }
})

central_syncs.post('/central_syncs/passports', async (req, res) => {
    const body = req.body
    if(body != null && body.data){
        try {
            let sid = 0
            for( i in body.data){
                const val = body.data[i]
                sid = val.sid
                const result = await passportModel.getOne({select: 'bin_to_uuid(pid) as pid', filters: {'pid': val.pid}})
                delete val.sid
                if(result == null){
                    await passportModel.addSync(val)
                } else {
                    await passportModel.updateSync(result.pid, val, 'pid')
                }   
            }
            return res.status(200).send({'sid': sid})    
        } catch (error) {
          // console.log('error')
        }
    }
})

central_syncs.post('/central_syncs/visas', async (req, res) => {
    const body = req.body
    if(body != null && body.data){
        try {
            let sid = 0 
            for( i in body.data){
                const val = body.data[i]
                sid = val.sid
                const result = await visaModel.getOne({select: 'bin_to_uuid(vid) as vid', filters: {'vid': val.vid}})
                delete val.sid
                if(result == null){
                    await visaModel.addSync(val)
                } else {
                    await visaModel.updateSync(result.vid, val, 'vid')
                }   
            }
            return res.send({'sid': sid})    
        } catch (error) {
          // console.log(error)
        }
    }
})

central_syncs.post('/central_syncs/printed_visas', async (req, res) => {
    const body = req.body
    if(body != null && body.data){
        try {
            let sid = 0 
            for( i in body.data){
                const val = body.data[i]
                sid = val.sid
                const result = await printedVisasModel.getOne({select: 'bin_to_uuid(id) as id', filters: {'id': val.id}})
                delete val.sid
                if(result==null){
                    await printedVisasModel.addSync(val)
                } else {
                    await printedVisasModel.updateSync(result.id, val, 'id')
                }   
            }
            return res.send({'sid': sid})    
        } catch (error) {
        //  console.log(error)
        }
    }
})

central_syncs.post('/central_syncs/deleted_visas', async (req, res) => {
    const body = req.body
    if(body != null && body.data){
        try {
            let sid = 0 
            for( i in body.data){
                const val = body.data[i]
                sid = val.sid
                const result = await deletedVisasModel.getOne({select: 'bin_to_uuid(id) as id', filters: {'id': val.id}})         
                delete val.sid           
                if(result==null){
                    await deletedVisasModel.addSync(val)
                } else {
                    await deletedVisasModel.updateSync(result.id, val, 'id')
                }   
            }
            return res.send({'sid': sid})    
        } catch (error) {
          // console.log(error)
        }
    }
})


  
central_syncs.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`)
})

central_syncs.use(function(req, res, next) {
  console.log(req.get('User-Agent'))
  res.locals.ua = req.get('User-Agent');
  next();
})

