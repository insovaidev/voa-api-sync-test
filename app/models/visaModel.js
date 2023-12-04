const generalLib = require('../libraries/generalLib')
const db = require('../services/dbService')
const table = "visas"

module.exports = {

    getVisaSync: async function({select=null, filters=null}={}){
        const q = db(table+' as v')
        
        // Select
        q.select()
        if(select) q.select(db.raw(select))
        
        // Join
        q.join(db.raw('visas_sync'+' as s on v.vid=s.id'))
        
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
        const q = db(table+' as v') 
        
        // Select
        q.select()
        if(select) q.select(db.raw(select))
        
        // Jion Table Passports
        q.join(db.raw('passports'+' as p on v.passport_id=p.passport_id'))
        
        // Apply Where Condition
        if(filters){
            if(filters.vid) q.whereRaw('v.vid = uuid_to_bin('+"'"+filters.vid+"'"+')')
            if(filters.port) q.where('v.port', filters.port)
            if(filters.deleted) q.where('v.deleted', filters.deleted)
            if(filters.passport_id) q.where('v.passport_id', filters.passport_id)            
            if(filters.minusHour) q.where('v.created_at', '>=', generalLib.dateTime({ minusHour: filters.minusHour}))
        }

        // Sort
        if(filters && filters.sort=="upeated_at" ){
            q.orderBy('v.upeated_at', 'DESC')
        } else {
            q.orderBy('v.created_at', 'DESC')
        }

        q.limit(1)

        // Return Result
        const result = await q
        return result[0] && result.length ? result[0] : null
    },

    add: async function(data) {
        const body = generalLib.omit(data, 'vid', 'uid')
        body.created_at = generalLib.dateTime()
        body.updated_at = generalLib.dateTime()
        const result  = await db(table).insert({vid: db.raw('uuid_to_bin("'+data.vid+'")'), uid: db.raw('uuid_to_bin("'+data.uid+'")'), ...body})
        return result[0]
    },

    // Update printed = 1
    updatePrint: async function(id) {
        const body = {}
        body.printed = 1
        body.printed_at = generalLib.dateTime()
        const result = await db(table).update(body).whereRaw('vid = uuid_to_bin('+"'"+id+"'"+')')        
        return result == 1
    },

    // Update deleted = 1
    updateDelete: async function(id) {
        const body = {}
        body.deleted = 1
        body.deleted_at = generalLib.dateTime()
        const result = await db(table).update(body).whereRaw('vid = uuid_to_bin('+"'"+id+"'"+')')       
        return result == 1
    },
    
    update: async function(id, data, idType="vid"){
        if(!id) return
        const body = generalLib.omit(data, 'vid')
        body.updated_at = generalLib.dateTime()
        const result = await db(table).update(body).whereRaw('vid = uuid_to_bin('+"'"+id+"'"+')')        
        return result == 1
    },

    list: async function({select=null, filters=null}={}) {
        const q = db(table+' as v') 

        // Select Fields
        q.select()
        if(select) q.select(db.raw(select))

        this.filters(q, filters)

        // Sort
        q.limit(30)
        q.offset(filters && filters.offset != undefined ? filters.offset : 0)
        q.orderBy(filters.sort && filters.sort != undefined ? filters.sort : 'vid', filters.sort_value && filters.sort_value != undefined ? filters.sort_value : 'desc' )
        
        // Search
        if(filters.search_type && filters.search_value != undefined) {
            q.where(filters.search_type, 'like' ,`%${filters.search_value}%`)
        }
        filters.search_type == 'all'
        if(filters.search_type == 'all'){
            q.whereRaw("CONCAT(v.visa_no, v.sex, v.nationality)"+'like'+`%${filters.search_value}%`) 
        }


        // Return Result
        const result = await q
        return result && result.length ? result : null
    },

    getOne: async function({select=null, filters=null}={}) {
        const q = db(table)
        q.select()
        if(select) q.select(db.raw(select)) 
        if(filters){
            if(filters.vid) q.whereRaw('vid=uuid_to_bin('+"'"+filters.vid+"'"+')')
        }
        q.limit(1)

        const result = await q;
        return result && result[0] && result.length ? result[0] : null
    },

    addSync: async function(data){
        const body = generalLib.omit(data, 'vid', 'uid')
        body.issued_date = generalLib.formatDate(body.issued_date)
        body.expire_date = generalLib.formatDate(body.expire_date)
        body.passport_expire_date = generalLib.formatDate(body.passport_expire_date)
        if(data.printed_at) body.printed_at = generalLib.formatDateTime(body.printed_at)
        if(data.deleted_at) body.deleted_at = generalLib.formatDateTime(body.deleted_at)
        body.created_at = generalLib.formatDateTime(body.created_at)
        body.updated_at = generalLib.formatDateTime(body.updated_at)
        const result  = await db(table).insert({vid: db.raw('uuid_to_bin("'+data.vid+'")'), uid: db.raw('uuid_to_bin("'+data.uid+'")'), ...body})
        return result? data.id : null
    },

    updateSync: async function(id, data, idType="vid"){
        const body = generalLib.omit(data, 'vid', 'uid')
        body.issued_date = generalLib.formatDate(body.issued_date)
        body.expire_date = generalLib.formatDate(body.expire_date)
        body.passport_expire_date = generalLib.formatDate(body.passport_expire_date)
        if(data.printed_at) body.printed_at = generalLib.formatDateTime(body.printed_at)
        if(data.deleted_at) body.deleted_at = generalLib.formatDateTime(body.deleted_at)
        body.created_at = generalLib.formatDateTime(body.created_at)
        body.updated_at = generalLib.formatDateTime(body.updated_at)
        const result  = await db(table).update({uid: db.raw('uuid_to_bin("'+data.uid+'")'), ...body}).where(db.raw('vid=uuid_to_bin('+"'"+id+"'"+')')) 
        return result? data.id : null
    },

    total: async function({select=null, groupBy=null, filters=null}={}) {
        const q = db(table+' as v')

        // Select Fields
        if(select || groupBy) q.select(db.raw(select ?? groupBy))
        
        q.count('* as total')
            
        this.filters(q, filters)

        // Group By Record
        if(groupBy) q.groupBy(db.raw(groupBy))

        // Jion Table Passport
        q.join(db.raw('passports'+' as p on v.passport_id=p.passport_id')) 

        // Return Result
        const result = await q

        return result && result.length ? result : null
    },

    filters: function(q, filters=null) {
        if(filters){ 
            // When Search Advance
            if(filters.issued_or_expire=='issued_date'){
                if(filters.ie_start_date) q.where('v.issued_date', '>=', filters.ie_start_date)
                if(filters.ie_end_date) q.where('v.issued_date', '<=', filters.ie_end_date)
            }
            if(filters.issued_or_expire=='expire_date'){
                if(filters.ie_start_date) q.where('v.expire_date', '>=', filters.ie_start_date)
                if(filters.ie_end_date) q.where('v.expire_date', '<=', filters.ie_end_date)
            }
            if(filters.visa_id) q.where('v.visa_id', filters.visa_id)
            if(filters.passport_id) q.where('v.passport_id', filters.passport_id)
            if(filters.port) q.where('v.port', filters.port)
            if(filters.vid) q.whereRaw('v.vid = uuid_to_bin('+"'"+filters.vid+"'"+')')
            if(filters.visa_type) q.where('v.visa_type', filters.visa_type)
            if(filters.nationality) q.where('v.nationality', filters.nationality)
            if(filters.sex) q.where('v.sex', filters.sex)
            if(filters.visa_no) q.where('v.visa_no', filters.visa_no)
            if(filters.printed) q.where('v.printed', filters.printed)
            if(filters.deleted) q.where('v.deleted', filters.deleted)
            if(filters.scanned) q.where('v.scanned', filters.scanned)
        }
    }
}

