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


module.exports = function(app) {
    app.post('/central_syncs/users', async (req, res) => {
        var data = []
        if(req.body.sid != undefined && req.body.ports != undefined) {
            const sid = req.body.sid
            const ports = req.body.ports 
            data = await userModel.sync({select: 'u.*, bin_to_uuid(u.uid) as uid, s.sid', filters: {'sid': sid, 'ports': ports}})
        }
        res.send({'data': data && data.length ? data : null})
    })

    app.post('/central_syncs/profile', async (req, res) => {
        const body = req.body
        if(body != null && body.data){
            try {
                let sid = 0
                for( i in body.data){
                    const val = body.data[i]
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

    app.post('/central_syncs/ports', async (req, res) => {
        var data = []
        if(req.body.sid != undefined) {
          var sid = req.body.sid
          data = await portModel.sync({select: 'p.*, bin_to_uuid(p.id) as id, s.sid', filters: {'sid': sid }}) 
        }
        res.send({'data': data && data.length ? data : null})
    })

    app.post('/central_syncs/visa_types', async (req, res) => {
        var data = []
        if(req.body.sid != undefined) {
          var sid = req.body.sid
          data = await visaTypeModel.sync({select: 'vt.*, bin_to_uuid(vt.id) as id, s.sid', filters: {'sid': sid }}) 
        }
        res.send({'data': data && data.length ? data : null})
    })

    app.post('/central_syncs/countries', async (req, res) => {
        var data = []
        if(req.body.sid != undefined) {
          var sid = req.body.sid
          data = await countryModel.sync({select: 'c.*, bin_to_uuid(c.id) as id, s.sid', filters: {'sid': sid }}) 
        }
        res.send({'data': data && data.length ? data : null})
    })

    app.post('/central_syncs/activity_logs', async (req, res) => {
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

    app.post('/central_syncs/checklists', async (req, res) => {
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

    app.post('/central_syncs/passports', async (req, res) => {
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
 
    app.post('/central_syncs/visas', async (req, res) => {
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

    app.post('/central_syncs/printed_visas', async (req, res) => {
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

    app.post('/central_syncs/deleted_visas', async (req, res) => {
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
}