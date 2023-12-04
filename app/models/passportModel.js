const generalLib = require('../libraries/generalLib')
const db = require('../services/dbService')

const table = "passports"

module.exports = {

    getPassportSync: async function({select=null, filters=null}={}){
        const q = db(table+' as p')
        
        // Select
        q.select()
        if(select) q.select(db.raw(select))
        
        // Join
        q.join(db.raw('passports_sync'+' as s on p.pid=s.id'))
        
        // Sort
        q.orderBy('s.sid', 'asc')
 
        // Where condition
        if(filters){
            if(filters.sid) q.where('s.sid', '>', parseInt(filters.sid))
        }
        // Return data
        const result = await q
        return result && result.length ? result : null
    },

    get: async function({select=null, filters=null}={}){

        const q = db(table) 
        
        // Select
        q.select()
        if(select) q.select(db.raw(select))
        
        // Apply Where Condition
        if(filters){
            if(filters.port) q.where('port', filters.port)
            if(filters.passport_id) q.where('passport_id', filters.passport_id)
        }

        q.limit(1)
        q.orderBy('created_at', 'DESC')

        // Return Result
        const result = await q
        return result[0] && result.length ? result[0] : null
    },

    update: async function(id, data, idType="pid") {
        if(!id) return
        const body = generalLib.omit(data, 'vid')
        body.updated_at = generalLib.dateTime()
        const result = await db(table).update({vid: db.raw('uuid_to_bin("'+data.vid+'")'),...body}).where(idType, id)
        return result == 1
    },

    add: async function(data) {
        const body = generalLib.omit(data, 'pid', 'uid', 'vid')
        body.created_at = generalLib.dateTime()
        body.updated_at = generalLib.dateTime()
        const result  = await db(table).insert({pid: db.raw('uuid_to_bin("'+data.pid+'")'), vid: db.raw('uuid_to_bin("'+data.vid+'")'), uid: db.raw('uuid_to_bin("'+data.uid+'")'), ...body})
        return result[0]
    },

    list: async function({select=null,  filters}={}) {
        
        // Table Passports 
        const q = db(table+' as p') 

        // Select Fields
        q.select()
        
        if(select) q.select(db.raw(select))

        this.filters(q, filters)
        
        // Sort
        q.limit(30)
        q.offset(filters && filters.offset != undefined ? filters.offset : 0)
        if(filters.sort=='sex') {
            q.orderByRaw("CAST(p.sex AS CHAR)"+" "+filters.sort_value)
        } else {
            q.orderBy(filters.sort && filters.sort != undefined ? 'p.'+filters.sort : 'p.created_at', filters.sort_value && filters.sort_value != undefined ? filters.sort_value : 'desc' )
        }
        
        // Jion Table Visas
        q.join(db.raw('visas'+' as v on v.passport_id=p.passport_id'))
        

        // Search
        if(filters.search_type == 'all' && filters.search_value != undefined ){
            q.whereRaw("CONCAT(p.passport_no, p.full_name, v.visa_no)"+' like '+`'%${filters.search_value}%'`) 
        } else if(filters.search_type && filters.search_value != undefined) q.where(filters.search_type, 'like' ,`%${filters.search_value}%`)  

        // Return Result
        const result = await q
        return result && result.length ? result : null

    },

    total: async function({select=null, groupBy=null, filters}={}) {

        const q = db(table+' as p')

        // Select Fields
        if(select || groupBy) q.select(db.raw(select ?? groupBy))

        q.count('p.passport_no as total')
        
        this.filters(q, filters)
        
        if(filters.search_type == 'all' && filters.search_value != undefined ){
            q.whereRaw("CONCAT(p.passport_no, p.full_name, v.visa_no)"+' like '+`'%${filters.search_value}%'`) 
        } else if(filters.search_type && filters.search_value != undefined) q.where(filters.search_type, 'like' ,`%${filters.search_value}%`)  

        // Group By Record
        if(groupBy) q.groupBy(db.raw(groupBy))

        // Jion Table Visas
        q.join(db.raw('visas'+' as v on v.passport_id=p.passport_id'))      

        // Return Result
        const result = await q

        return result && result.length ? result : null
    },

    filters: function(q, filters=null) {
        if(filters) {
            if(filters.issued_or_expire=='issued_date'){
                if(filters.ie_start_date) q.where('p.issued_date', '>=', filters.ie_start_date)
                if(filters.ie_end_date) q.where('p.issued_date', '<=', filters.ie_end_date)
            }
            if(filters.issued_or_expire=='expire_date'){
                if(filters.ie_start_date) q.where('p.expire_date', '>=', filters.ie_start_date)
                if(filters.ie_end_date) q.where('p.expire_date', '<=', filters.ie_end_date)
            }
            // Advan Search
            if(filters.visa_date=='issued_date'){
                if(filters.ie_visa_date_start) q.where('v.issued_date', '>=', filters.ie_visa_date_start)
                if(filters.ie_visa_date_end) q.where('v.issued_date', '<=', filters.ie_visa_date_end)
            } else {
                if(filters.ie_visa_date_start) q.where('v.expire_date', '>=', filters.ie_visa_date_start)
                if(filters.ie_visa_date_end) q.where('v.expire_date', '<=', filters.ie_visa_date_end)    
            } 
            if(filters.check_als){
                if(filters.check_als==0) q.where('v.base_id', null) 
                if(filters.check_als==1) q.whereNot('v.base_id', null) 
            } 
            if(filters.visa_type) q.where('v.visa_type', filters.visa_type)
            if(filters.visa_no) q.where('v.visa_no', filters.visa_no)
            if(filters.passport_no) q.where('p.passport_no', filters.passport_no)
            if(filters.deleted) q.where('v.deleted', filters.deleted)
            if(filters.printed) q.where('v.printed', filters.printed)
            if(filters.scanned) q.where('v.scanned', filters.scanned)
            if(filters.end_date) q.where('p.created_at', '<=', filters.end_date)
            if(filters.start_date) q.where('p.created_at', '>=', filters.start_date)
            if(filters.end_date) q.where('p.created_at', '<=', filters.end_date)
            if(filters.port) q.where('v.port', filters.port)
            if(filters.sex) q.where('p.sex', filters.sex)            
            if(filters.nationality) q.where('p.nationality', filters.nationality.toUpperCase())
            
        }
    },

    getOne: async function({select=null, filters=null}={}) {
       
        const q = db(table)
        q.select()
        if(select) q.select(db.raw(select)) 
        if(filters){
            if(filters.pid) q.whereRaw('pid=uuid_to_bin('+"'"+filters.pid+"'"+')')
        }   
        q.limit(1)
        const result = await q;
        return result && result[0] && result.length ? result[0] : null
    },
    
    addSync: async function(data){
        const body = generalLib.omit(data, 'pid', 'vid', 'uid')
        if(data.issued_date) body.issued_date = generalLib.formatDate(body.issued_date)
        if(data.expire_date) body.expire_date = generalLib.formatDate(body.expire_date)
        if(data.dob) body.dob = generalLib.formatDate(body.dob)
        if(data.entry_at) body.entry_at = generalLib.formatDateTime(body.entry_at)
        body.created_at = generalLib.formatDateTime(body.created_at)
        body.updated_at = generalLib.formatDateTime(body.updated_at)
        const result  = await db(table).insert({pid: db.raw('uuid_to_bin("'+data.pid+'")'), vid: db.raw('uuid_to_bin("'+data.vid+'")'), uid: db.raw('uuid_to_bin("'+data.uid+'")'), ...body})
        return result? data.id : null
    },

    updateSync: async function(id, data, idType="vid"){
    
        const body = generalLib.omit(data, 'pid', 'vid', 'uid')
        if(data.issued_date) body.issued_date = generalLib.formatDate(body.issued_date)
        if(data.expire_date) body.expire_date = generalLib.formatDate(body.expire_date)
        if(data.dob) body.dob = generalLib.formatDate(body.dob)
        if(data.entry_at) body.entry_at = generalLib.formatDateTime(body.entry_at)
        body.created_at = generalLib.formatDateTime(body.created_at)
        body.updated_at = generalLib.formatDateTime(body.updated_at)
        const result  = await db(table).update({vid: db.raw('uuid_to_bin("'+data.vid+'")'), uid: db.raw('uuid_to_bin("'+data.uid+'")'), ...body}).where(db.raw('pid=uuid_to_bin('+"'"+id+"'"+')')) 
        return result? data.id : null
    },
}