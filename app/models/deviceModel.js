const generalLib = require('../libraries/generalLib')
const db = require('../services/dbService')

const table = "devices"

module.exports = {
    add: async function(data){
        
        const body = generalLib.omit(data, 'id', 'uid')
        body.created_at = generalLib.dateTime()
        body.updated_at = generalLib.dateTime()
        body.last_active_at = generalLib.dateTime()
        const result  = await db(table).insert({id: db.raw('uuid_to_bin("'+data.id+'")'),  uid: data.uid ? db.raw('uuid_to_bin("'+data.uid+'")') : null, ...body})
        return result[0]
    },

    update: async function(id, data, idType="id") {
        if(!id) return
        const body = generalLib.omit(data, 'uid')
        body.updated_at = generalLib.dateTime()
        body.last_active_at = generalLib.dateTime()
        const result = await db(table).update({uid: data.uid ? db.raw('uuid_to_bin("'+data.uid+'")') : null,...body}).where(idType, id)
        return result == 1
    },
    
    updateLastUserActive: async function(id, data, idType="id") {
        const result = await db(table).update(data).where(idType, id)
        return result == 1
    },
    
    get: async function({select=null, filters=null}={}){
        const q = db(table)
        q.select()
        if(select) q.select(db.raw(select))
        this.filters(q, filters)
        const result = await q
        return result[0]
    },
    lists: async function({select=null, filters=null}={}){
        const q = db(table)
        q.select()
        if(select) q.select(db.raw(select))
        this.filters(q, filters)
        const result = await q
        return result && result.length ? result : null
    }, 
    filters: function(q, filters=null) {
        if(filters) {
            if(filters.id) q.whereRaw('id = uuid_to_bin('+"'"+filters.id+"'"+')')
            if(filters.device_id) q.where('device_id', filters.device_id)
        }
    }
}

