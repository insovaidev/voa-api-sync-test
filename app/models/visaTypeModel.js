const generalLib = require('../libraries/generalLib')
const db = require('../services/dbService')

const table = "visa_types"

module.exports = {
    get: async function(id, idType='id') {
        return id ? await db.select('*').table(table).where((builder) =>{
            builder.where(idType == "id" && !Number.isFinite(id) ? "type" : idType, id)
        }).first(): null
    },

    add: async function(data) {
        const body = generalLib.omit(data, 'id')
        body.created_at = generalLib.dateTime()
        body.updated_at = generalLib.dateTime()
        const result  = await db(table).insert({id: db.raw('uuid_to_bin("'+data.id+'")'),...body})
        return result[0]
    },

    gets: async function({select=null, filters=null}={}) {
        const q = db(table)

        if(select) q.select(db.raw(select))

        if(filters){
            if(filters.published) q.where('published', filters.published)
        }

        const result = await q
        return result && result.length ? result : null
    },

    sync: async function({select=null,  filters}={}){
        const q = db(table + ' as vt')  

        // Select Fields
        q.select()
        if(select) q.select(db.raw(select))  
        
        // Join table
        q.join(db.raw('visa_types_sync'+' as s on vt.id=s.id'))
        
        // Sort
        q.orderBy('s.sid', 'asc')

        // Where condition
        if(filters){
            if(filters.sid) q.where('s.sid', '>', filters.sid)
        }

        // Return 
        const result = await q;
        return result && result.length ? result : null
    },

    update: async function(id, data, idType="id") {
        data.updated_at = generalLib.dateTime()
        const result = await db(table).update(data).whereRaw('id = uuid_to_bin('+"'"+id+"'"+')')
        return result == 1
    },

    getOne: async function({select=null, filters=null}={}){
        const q = db(table)
        
        // Select
        q.select()
        if(select) q.select(db.raw(select))

        // Condidtion
        if(filters){
            if(filters.id) q.whereRaw('id='+'uuid_to_bin('+"'"+filters.id+"'"+')')
            if(filters.code) q.where('code', filters.code)
        }
        
        const result = await q;
        return result && result[0] && result.length ? result[0] : null
    }, 

    addSync: async function(data){
        const body = generalLib.omit(data, 'id')
        body.created_at = generalLib.formatDateTime(data.created_at)
        body.updated_at = generalLib.formatDateTime(data.updated_at)
        const result  = await db(table).insert({id: db.raw('uuid_to_bin("'+data.id+'")'),...body})
        return result[0]       
    },

    updateSync: async function(data){
        const body = generalLib.omit(data, 'id')        
        body.created_at = generalLib.formatDateTime(data.created_at)
        body.updated_at = generalLib.formatDateTime(data.updated_at)
        const result = await db(table).update(body).whereRaw('id = uuid_to_bin('+"'"+data.id+"'"+')')
        return result == 1    
    },
}
