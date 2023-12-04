const db = require('../services/dbService')
const generalLib = require('../libraries/generalLib')


const table = "countries"

module.exports = {

    get: async function(id, idType="code") {
        return await db.select('*').table(table).where(idType, id).first()
    },
    gets: async function(){

        const q = db(table)
        // Select
        q.select(db.raw('bin_to_uuid(id) as id ,code,name,nationality,published'))
        
        // Sort
        q.orderBy('name', 'ASC')

        // Return Result
        const result = await q
        return result && result.length ? result : null
    },

    sync: async function({select=null,  filters}={}){
        const q = db(table + ' as c')  

        // Select Fields
        q.select()
        if(select) q.select(db.raw(select))  
        
        // Join table
        q.join(db.raw('countries_sync'+' as s on c.id=s.id'))
        
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

    getOne: async function({select=null, filters=null}={}){
        const q = db(table)
        
        q.select()
        if(select) q.select(db.raw(select))

        if(filters){
            if(filters.id) q.whereRaw('id='+'uuid_to_bin('+"'"+filters.id+"'"+')')
        }
        
        const result = await q;
        return result && result[0] && result.length ? result[0] : null
    },
}