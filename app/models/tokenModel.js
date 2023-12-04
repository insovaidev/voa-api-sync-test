const db = require('../services/dbService')
const generalLib = require('../libraries/generalLib')

const table = "tokens"

module.exports = {
    get: async function({select=null, filters=null}={}) {

        const q = db(table)

        // Select
        if(select) q.select(db.raw(select))

        // Apply Where Condition
        if(filters){

            if(filters.token) q.where('token', filters.token)
            if(filters.device_id) q.where('device_id', filters.device_id)
            if(filters.active) q.where('expire_at', '>=', generalLib.dateTime())
        }
        q.limit(1)
        const result = await q    
        return result[0] && result.length ? result[0] : null
    },

    update: async function(id, data, idType="id") {
        data.updated_at = generalLib.dateTime()
        const result = await db(table).update(data).whereRaw('id = uuid_to_bin('+"'"+id+"'"+')')
        return result == 1
    },

    add: async function(data) {
        const body = generalLib.omit(data, 'id', 'uid')
        body.created_at = generalLib.dateTime()
        body.updated_at = generalLib.dateTime()
        const result  = await db(table).insert({id: db.raw('uuid_to_bin("'+data.id+'")') , uid: db.raw('uuid_to_bin("'+data.uid+'")'), ...body})
        return result[0]
    },

    delete: async function(id, idType="id") {
        const result = await db(table).where(idType, id).del()
        return result == 1
    },
    updateLastUsed: async function(id, data, idType="id") {
        const result = await db(table).update(data).whereRaw('id = uuid_to_bin('+"'"+id+"'"+')')
        return result == 1
    },

}
