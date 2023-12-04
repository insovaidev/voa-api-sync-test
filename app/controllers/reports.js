const generalLib = require('../libraries/generalLib')
const portModel = require('../models/portModel')
const reportModel = require('../models/reportModel')
const checkAuth = require('../middleware/checkAuth')
const userModel = require('../models/userModel')


module.exports = function(app) {

    // Apply authentication
    app.use('/reports', checkAuth)
    
    // All Options
    app.get('/reports', async (req, res) => {
        let data = null
        let total = 0
        let deleted = 0
        let recreated = 0
        let report_time_zone = 0
        const me = req.me
        
        let filters = Object.assign({}, req.query)  
        filters.deleted = '0'

        // Role and Permission
        if(me.role=='staff'){
            if(user=await userModel.get({ select: 'permissions', filters: { uid: me.id }})){
                let perms=[]
                if(!user.permissions) return res.status(403).send({'message':'The user does not have permission to request data.'})
                perms.push(...user.permissions.split(','));
                if(!perms.includes('report')) return res.status(403).send({'message':'The user does not have permission to view reports.'})
            }
        }
    
        if(me.port==null && filters.port && filters.port !='all'){
            if(port = await portModel.get(filters.port, 'code')) {
              if(port.report_time_zone) report_time_zone = port.report_time_zone
            }
        }

        if(filters.port == 'all') delete filters.port
        
        if(me.port) {
            filters.port = me.port
            if(port = await portModel.get(me.port, 'code')) {
                if(port.report_time_zone) report_time_zone = port.report_time_zone
            }
        }
        
        const h = report_time_zone.toString().replace('-','')

        if(start_date = req.query.start_date) filters.start_date = generalLib.dateTime({setDate: start_date, addHour: report_time_zone > 0 ? h : null, minusHour: report_time_zone < 0 ? h : null})
        if(end_date = req.query.end_date) filters.end_date = generalLib.dateTime({setDate: end_date, isEndDate: true, addHour: report_time_zone > 0 ? h : null, minusHour: report_time_zone < 0 ? h : null})
        if(result=await reportModel.total({groupBy: 'v.visa_type', filters: filters})) {
            data = {'visa_types':{}, 'sex':{}, 'nationalities':{}}
            result.forEach(val => {
                data['visa_types'][val.visa_type] = val.total
                total += val.total
            })
            
            await Promise.all([
                reportModel.total({groupBy: 'v.sex', filters: filters}).then(result => {
                    if(result) {
                        result.forEach(val => {
                            data['sex'][val.sex] = val.total
                        })
                    }
                }),

                reportModel.total({groupBy: 'v.nationality', filters: filters}).then(result => {
                    if(result) {
                        result.forEach(val => {
                            data['nationalities'][val.nationality] = val.total
                        })
                    }
                }),

                reportModel.deleted({filters: filters}).then(result => {
                    if(result) deleted = result
                }),

                reportModel.recreated(filters).then(result => {
                    if(result) recreated = result
                }),
            ])
        }

        res.send({'data':data, 'total': total, 'deleted': deleted, 'recreated': recreated, 'not_recreated': deleted-recreated})
    })

    // Report By Month 
    app.get('/reports/date', async (req, res) => {
        let data = null
        let total = 0
        let deleted = 0
        let recreated = 0
        let report_time_zone = 0
        const me = req.me

        // Role and Permission
        if(me.role=='staff'){
            if(user=await userModel.get({ select: 'permissions', filters: { uid: me.id }})){
                let perms=[]
                if(!user.permissions) return res.status(403).send({'message':'The user does not have permission to request data.'})
                perms.push(...user.permissions.split(','));
                if(!perms.includes('report')) return res.status(403).send({'message':'The user does not have permission to view reports.'})
            }
        }

        if(date = req.query.date) {
            var filters = Object.assign({}, req.query)
            filters.deleted = '0'

            if(me.port==null && filters.port && filters.port !='all'){
                if(port = await portModel.get(filters.port, 'code')) {
                  if(port.report_time_zone) report_time_zone = port.report_time_zone
                }
            }
    
            if(filters.port == 'all') delete filters.port


            if(me.port) {
                filters.port = me.port
                if(port = await portModel.get(me.port, 'code')) report_time_zone = port.report_time_zone
            }
    
            const h = report_time_zone.toString().replace('-','')
            filters.start_date = generalLib.dateTime({setDate: date, addHour: report_time_zone > 0 ? h : null, minusHour: report_time_zone < 0 ? h : null})
            filters.end_date = generalLib.dateTime({setDate: date, isEndDate: true, addHour: report_time_zone > 0 ? h : null, minusHour: report_time_zone < 0 ? h : null})

            var select = 'v.issued_date as created_date'
            if(report_time_zone !== 0) {
                if(report_time_zone>0) {
                    select = 'date(date_add(v.created_at, INTERVAL '+h+' hour)) as created_date'
                } else {
                    select = 'date(date_sub(v.created_at, INTERVAL '+h+' hour)) as created_date'
                }
            }
         
            if(result = await reportModel.total({select: select+', v.visa_type', groupBy: 'created_date, v.visa_type', filters: filters})) {
                data = {}
                result.forEach(val => {
                    const key = [val.created_date.getFullYear(), ('0' + (val.created_date.getMonth() + 1)).slice(-2), ('0' + val.created_date.getDate()).slice(-2)].join('-')
                    if(data[key] == undefined) data[key] = {'data':{},'total':0}
                    data[key]['data'][val.visa_type] = val.total
                    data[key]['total'] += val.total
                    total += val.total
                })
                await Promise.all([
                    reportModel.deleted({filters: filters}).then(result => {
                        if(result) deleted = result
                    }),

                    reportModel.recreated(filters).then(result => {
                        if(result) recreated = result
                    }),
                ])                    
            }  
        }

        res.send({'data':data, 'total': total, 'deleted': deleted, 'recreated': recreated, 'not_recreated': deleted-recreated})
    })

    // Report By Nationality
    app.get('/reports/nationalities', async (req, res) => {

        let data = null
        let total = 0
        let deleted = 0
        let recreated = 0
        let report_time_zone = 0
        const me = req.me
        let filters = req.query
        filters.deleted = '0'


        // Role and Permission
        if(me.role=='staff'){
            if(user=await userModel.get({ select: 'permissions', filters: { uid: me.id }})){
                let perms=[]
                if(!user.permissions) return res.status(403).send({'message':'The user does not have permission to request data.'})
                perms.push(...user.permissions.split(','));
                if(!perms.includes('report')) return res.status(403).send({'message':'The user does not have permission to view reports.'})
            }
        }

        if(me.port==null && filters.port && filters.port !='all'){
            if(port = await portModel.get(filters.port, 'code')) {
              if(port.report_time_zone) report_time_zone = port.report_time_zone
            }
        }

        if(filters.port == 'all') delete filters.port

        if(me.port) {
            filters.port = me.port
            if(port = await portModel.get(me.port, 'code')) {
                if(port.report_time_zone) report_time_zone = port.report_time_zone
            }
        }
        const h = report_time_zone.toString().replace('-','')

        if(start_date = req.query.start_date) filters.start_date = generalLib.dateTime({setDate: start_date, addHour: report_time_zone > 0 ? h : null, minusHour: report_time_zone < 0 ? h : null})
        if(end_date = req.query.end_date) filters.end_date = generalLib.dateTime({setDate: end_date, isEndDate: true, addHour: report_time_zone > 0 ? h : null, minusHour: report_time_zone < 0 ? h : null})

        if(result = await reportModel.total({groupBy: 'v.nationality,v.visa_type', filters: filters})) {
            data = {}
            result.forEach(val => {
                const key = val.nationality
                if(data[key] == undefined) data[key] = {'data':{},'total':0}
                data[key]['data'][val.visa_type] = val.total
                data[key]['total'] += val.total
                total += val.total
            })
            await Promise.all([
                reportModel.deleted({filters: filters}).then(result => {
                    if(result) deleted = result
                }),
                reportModel.recreated(filters).then(result => {
                    if(result) recreated = result
                }),
            ])
        }

        res.send({'data':data, 'total': total, 'deleted': deleted, 'recreated': recreated, 'not_recreated': deleted-recreated})
    })

    // Report By Visa Type
    app.get('/reports/visa_types', async (req, res) => {
        let data = null
        let total = 0
        let deleted = 0
        let recreated = 0
        let report_time_zone = 0
        const me = req.me
        let filters = req.query
        filters.deleted = '0'


        // Role and Permission
        if(me.role=='staff'){
            if(user=await userModel.get({ select: 'permissions', filters: { uid: me.id }})){
                let perms=[]
                if(!user.permissions) return res.status(403).send({'message':'The user does not have permission to request data.'})
                perms.push(...user.permissions.split(','));
                if(!perms.includes('report')) return res.status(403).send({'message':'The user does not have permission to view reports.'})
            }
        }

        if(me.port==null && filters.port && filters.port !='all'){
            if(port = await portModel.get(filters.port, 'code')) {
              if(port.report_time_zone) report_time_zone = port.report_time_zone
            }
        }

        if(filters.port == 'all') delete filters.port

        if(me.port) {
            filters.port = me.port
            if(port = await portModel.get(req.me.port, 'code')) {
                if(port.report_time_zone) report_time_zone = port.report_time_zone
            }
        }
        const h = report_time_zone.toString().replace('-','')
        if(start_date = req.query.start_date) filters.start_date = generalLib.dateTime({setDate: start_date, addHour: report_time_zone > 0 ? h : null, minusHour: report_time_zone < 0 ? h : null})
        if(end_date = req.query.end_date) filters.end_date = generalLib.dateTime({setDate: end_date, isEndDate: true, addHour: report_time_zone > 0 ? h : null, minusHour: report_time_zone < 0 ? h : null})

        if(result = await reportModel.total({groupBy: 'v.visa_type', filters: filters})) {
            data = {}
            result.forEach(val => {
                data[val.visa_type] = val.total
                total += val.total
            })
            await Promise.all([
                reportModel.recreated(filters).then(result => {
                    if(result) recreated = result
                }),
                reportModel.deleted({filters: filters}).then(result => {
                    if(result) deleted = result
                })
            ])          
        }

        res.send({'data': data, 'total': total, 'deleted': deleted, 'recreated': recreated, 'not_recreated': deleted-recreated })
    })

    // Report By List Name
    app.get('/reports/names', async (req, res) => {
        let deleted = 0
        let total = 0
        let recreated = 0
        let report_time_zone = 0
        const me = req.me
        let filters =  Object.assign({}, req.query)
        filters.deleted = '0'

        // Role and Permission
        if(me.role=='staff'){
            if(user=await userModel.get({ select: 'permissions', filters: { uid: me.id }})){
                let perms=[]
                if(!user.permissions) return res.status(403).send({'message':'The user does not have permission to request data.'})
                perms.push(...user.permissions.split(','));
                if(!perms.includes('report')) return res.status(403).send({'message':'The user does not have permission to view reports.'})
            }
        }

        if(me.port==null && filters.port && filters.port !='all'){
            if(port = await portModel.get(filters.port, 'code')) {
              if(port.report_time_zone) report_time_zone = port.report_time_zone
            }
        }

        if(filters.port == 'all') delete filters.port

        if(me.port) {
            filters.port = me.port
            if(port = await portModel.get(me.port, 'code')) {
                if(port.report_time_zone) report_time_zone = port.report_time_zone
            }
        }

        const h = report_time_zone.toString().replace('-','')
        if(start_date = req.query.start_date) filters.start_date = generalLib.dateTime({setDate: req.query.start_date, addHour: report_time_zone > 0 ? h : null, minusHour: report_time_zone < 0 ? h : null})
        if(end_date = req.query.end_date) filters.end_date = generalLib.dateTime({setDate: req.query.end_date, isEndDate: true, addHour: report_time_zone > 0 ? h : null, minusHour: report_time_zone < 0 ? h : null})
        
        var select = 'bin_to_uuid(v.vid) as vid, v.sex, v.visa_type, v.visa_no, v.nationality, p.full_name, p.dob, p.passport_no'
        
        if(reportList = await reportModel.reportList({ select: select, groupBy: 'bin_to_uuid(v.vid)', filters: filters})){
            reportList.forEach(val => {
                val.dob = generalLib.formatDate(val.dob)
                delete val.total;
            })
        }
        
        if(result = await reportModel.total({select: 'v.sex', groupBy: 'bin_to_uuid(v.vid)', filters: filters})) {
            total = result.length
            let id = 1
            result.forEach(val => {
                val.dob = generalLib.formatDate(val.dob)
                delete val.total;
            })
            await Promise.all([
                reportModel.deleted({filters: filters}).then(result => {
                    if(result) deleted = result
                }),

                reportModel.recreated(filters).then(result => {
                    if(result) recreated = result
                }),

            ])
        }
        res.send({'data': reportList, 'limit': 30, 'offset': parseInt(filters.offset),  'total': total, 'deleted': deleted, 'recreated': recreated, 'not_recreated': deleted-recreated })
    })
}