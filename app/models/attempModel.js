const db = require('../services/dbService')
const generalLib = require('../libraries/generalLib')

const table = "attempts"

module.exports = {

    add: async function(data) {
        const body = generalLib.omit(data, 'id', 'uid')
        body.created_at = generalLib.dateTime()
        const result = await db(table).insert({id: db.raw('uuid_to_bin("'+data.id+'")'), uid: data.uid ? db.raw('uuid_to_bin("'+data.uid+'")') : null , ...body})
        return result[0]
    },

    gets: async function({select=null, groupBy=null, filters=null}={}){
        const q = db(table)
        
        // Select
        q.select()
        if(select || groupBy) q.select(db.raw(select ?? groupBy))
        
        // Apply Where Condition
        if(filters){
            if(filters.user) q.where('user', filters.user)
        }

        q.limit(filters && filters.limit != undefined ? filters.limit : 5)
        q.orderBy('created_at', 'desc')

        const result = await q
        return result && result.length ? result : null
    },
    
    delete:
     async function({filters={}}){
        const q = db(table)    
        q.del()
        if(filters.user) q.where('user', filters.user)
        await q
    }
}


