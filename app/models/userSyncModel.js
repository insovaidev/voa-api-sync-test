const db = require('../services/dbService')
const table = "users_sync"
const generalLib = require('../libraries/generalLib')

module.exports = {
    delete: async function({filters}={}){
        const q = db(table)    
        q.del()
        await q
    },
    
    add: async function(data){
        const body = generalLib.omit(data, 'id')
        const result  = await db(table).insert({id: db.raw('uuid_to_bin("'+data.id+'")'),...body})
        return result[0]
    }
}


