const generalLib = require('../libraries/generalLib')
const db = require('../services/dbService')

const table = "deleted_visas"

module.exports = {
   
    get: async function({select=null, filters=null}={}){

        const q = db(table) 
        
        if(select) q.select(db.raw(select))
        
        // Apply Where Condition
        if(filters){
            if(filters.vid) q.whereRaw('id = uuid_to_bin('+"'"+filters.vid+"'"+')')
        }

        q.limit(1)
        q.orderBy('deleted_at', 'DESC')

        // Return Result
        const result = await q
        return result[0] && result.length ? result[0] : null
    },


    add: async function(data) {
        const body = generalLib.omit(data,'id' ,'vid', 'uid')
        body.deleted_at = generalLib.dateTime()
        const result  = await db(table).insert({id: db.raw('uuid_to_bin("'+data.id+'")'),vid: db.raw('uuid_to_bin("'+data.vid+'")'), uid: db.raw('uuid_to_bin("'+data.uid+'")'), ...body})
        return result[0]
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
        const body = generalLib.omit(data, 'id', 'vid', 'uid')
        if(data.deleted_at) body.deleted_at = generalLib.formatDateTime(body.deleted_at)
        const result  = await db(table).insert({id: db.raw('uuid_to_bin("'+data.id+'")'), vid: db.raw('uuid_to_bin("'+data.vid+'")'), uid: db.raw('uuid_to_bin("'+data.uid+'")'), ...body})
        return result? data.id : null
    },

    updateSync: async function(id, data, idType="vid"){
        const body = generalLib.omit(data, 'id', 'vid', 'uid')
        if(data.deleted_at) body.deleted_at = generalLib.formatDateTime(body.deleted_at)
        const result  = await db(table).update({vid: db.raw('uuid_to_bin("'+data.vid+'")'), uid: db.raw('uuid_to_bin("'+data.uid+'")'), ...body}).where(db.raw('id=uuid_to_bin('+"'"+id+"'"+')')) 
        return result? data.id : null
    },
    getVisasSync: async function({select=null, filters=null}={}){
        const q = db(table+' as dv')
        
        // Select
        q.select()
        if(select) q.select(db.raw(select))
        
        // Join
        q.join(db.raw('deleted_visas_sync'+' as s on dv.id=s.id'))
        
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
}

