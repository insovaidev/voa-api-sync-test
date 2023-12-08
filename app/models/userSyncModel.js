const db = require('../services/dbService')
const table = "users_sync"
const generalLib = require('../libraries/generalLib')

module.exports = {
    get: async function({select=null, filters=null}={}) {
        const q = db(table) 
        
        q.select()

        if(select) q.select(db.raw(select))

        // Apply Where Condition
        if(filters){
            if(filters.id) q.whereRaw('id = UUID_TO_BIN('+"'"+filters.id+"'"+');')
        }
        
        // Return Result
        const result = await q
        return result && result[0] && result.length ? result[0] : null

    },

    delete: async function({filters}={}){
        const q = db(table)    
        if(filters.id) q.whereRaw('id = uuid_to_bin('+"'"+filters.id+"'"+')')
        await q.del()
    },
    
    add: async function(data){
        const body = generalLib.omit(data, 'id')
        const result  = await db(table).insert({id: db.raw('uuid_to_bin("'+data.id+'")'),...body})
        return result[0]
    },

    update: async function(data){
        const body = generalLib.omit(data, 'id')        
        body.created_at = generalLib.formatDateTime(data.created_at)
        body.updated_at = generalLib.formatDateTime(data.updated_at)
        const result = await db(table).update(body).whereRaw('id = uuid_to_bin('+"'"+data.uid+"'"+')')
        return result == 1    
    }
}


