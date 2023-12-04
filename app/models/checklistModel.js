const db = require('../services/dbService')
const generalLib = require('../libraries/generalLib')

const table = "checklists"

module.exports = {
    getChecklistSync: async function({select=null, filters=null}={}){
        const q = db(table+' as c')
        
        // Select
        q.select()
        if(select) q.select(db.raw(select))
        
        // Join
        q.join(db.raw('checklists_sync'+' as s on c.id=s.id'))
        
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
    
    // Get Recent 
    get: async function({select=null, filters=null}={}){
        const q = db(table) 

        q.select()

        if(select) q.select(db.raw(select))

        // Apply Where Condition
        if(filters){
            if(filters.id) q.whereRaw('id = uuid_to_bin('+"'"+filters.id+"'"+')')
            if(filters.port) q.where('port', filters.port)
            if(filters.lastDay) q.where('created_at', '>=', generalLib.dateTime({ minusDay: filters.lastDay }))
        }

        // Sort
        q.limit(1)
        q.orderBy('created_at', 'desc')

        // Return Result
        const result = await q

        return result[0] && result.length ? result[0] : null
    },

    add: async function(data) {
        const body = generalLib.omit(data, 'id', 'uid')
        body.created_at = generalLib.dateTime()
        body.updated_at = generalLib.dateTime()
        const result  = await db(table).insert({id: db.raw('uuid_to_bin("'+data.id+'")'), uid: db.raw('uuid_to_bin("'+data.uid+'")'), ...body})
        return result[0]
    },

    update: async function(id, data) {
        data.updated_at = generalLib.dateTime()
        const result = await db(table).update(data).whereRaw('id = uuid_to_bin('+"'"+id+"'"+')')
        return result == 1
    },

    getOne: async function({select=null, filters=null}={}) {
        const q = db(table)
        q.select()
        if(select) q.select(db.raw(select)) 
        if(filters){
            if(filters.id) q.whereRaw('id=uuid_to_bin('+"'"+filters.id+"'"+')')
        }   
        q.limit(1)
        const result = await q;
        return result && result[0] && result.length ? result[0] : null
    },

    addSync: async function(data){
        const body = generalLib.omit(data, 'id', 'uid')
        if(data.issued_date) body.issued_date = generalLib.formatDate(body.issued_date)
        if(data.expire_date) body.expire_date = generalLib.formatDate(body.expire_date)
        if(data.dob) body.dob = generalLib.formatDate(body.dob)
        body.created_at = generalLib.formatDateTime(body.created_at)
        body.updated_at = generalLib.formatDateTime(body.updated_at)
        const result  = await db(table).insert({id: db.raw('uuid_to_bin("'+data.id+'")'), uid: db.raw('uuid_to_bin("'+data.uid+'")'), ...body})
        return result? data.id : null
    },

    updateSync: async function(id, data, idType="vid"){
        const body = generalLib.omit(data, 'id', 'uid')
        if(data.issued_date) body.issued_date = generalLib.formatDate(body.issued_date)
        if(data.expire_date) body.expire_date = generalLib.formatDate(body.expire_date)
        if(data.dob) body.dob = generalLib.formatDate(body.dob)
        body.created_at = generalLib.formatDateTime(body.created_at)
        body.updated_at = generalLib.formatDateTime(body.updated_at)
        const result  = await db(table).update({uid: db.raw('uuid_to_bin("'+data.uid+'")'), ...body}).where(db.raw('id=uuid_to_bin('+"'"+id+"'"+')')) 
        return result? data.id : null
    },

    total: async function({select=null, groupBy=null, filters=null}={}) {
        const q = db(table)

        // Select Fields
        if(select || groupBy) q.select(db.raw(select ?? groupBy))
        
        q.count('* as total')
            
        if(filters){
            if(filters.match_als) q.where('match_als', filters.match_als)    
        }

        // Group By Record
        if(groupBy) q.groupBy(db.raw(groupBy))

        // Return Result
        const result = await q

        return result && result.length ? result : null
    }, 

    list: async function({select=null, filters=null}={}) {

        const q = db(table) 

        // Select Fields
        q.select()

        if(select) q.select(db.raw(select))

        // Sort
        q.limit(filters && filters.limit != undefined ? filters.limit: 30)
        q.offset(filters && filters.offset != undefined ? filters.offset : 0)
        q.orderBy(filters.sort && filters.sort != undefined ? filters.sort : 'created_at', filters.sort_value && filters.sort_value != undefined ? filters.sort_value : 'desc' )
       

        if(filters){
            if(filters.username) q.where('surname', 'like' ,`%${filters.username}%`)
            if(filters.full_name) q.where('full_name', 'like' ,`%${filters.full_name}%`)
            if(filters.passport_no) q.where('passport_no', filters.passport_no)
            if(filters.sex) q.where('sex', filters.sex)
            if(filters.nationality) q.where('nationality', filters.nationality)
            if(filters.port) q.where('port', filters.port)
        }

        // Return Result
        const result = await q
        return result && result.length ? result : null
    },


}

