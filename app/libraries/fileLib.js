const fs = require('fs')
const config = require('../config/config')


module.exports = {

    copy: function(source, distrination, deleteSource=false) {
        this.createDir(distrination)
        if(fs.existsSync(source)) {
            if(deleteSource) {
                fs.renameSync(source, distrination)
            } else {
                fs.copyFileSync(source, distrination)
            }
            return distrination
        }
        return null
    },    
    
    createDir: function(path) {
        var dist = ""
        path.split('/').forEach(v => {
            if(v.indexOf(".") < 0) {
                dist += "/"+v
                if (!fs.existsSync("."+dist)) fs.mkdirSync("."+dist)
            }
        })
    },

    exist: function(dir) {
        return fs.existsSync(dir)
    },

    copyTo: function(source, port, passportId) {    
        const date = new Date()
        const f = date.getFullYear()+'/'+((m = date.getMonth()+1)>9?m:'0'+m)+'/'+((d = date.getDate())>9?d:'0'+d)
        var dir = port+'/'+f+'/'+(passportId+'-'+port+'-'+Date.now())+'.'+source.split('.').slice(-1)[0]
        var dis = config.uploadDir+dir
        if(this.copy(source, dis)) return {'path':dis, 'dir': dir, 'url': config.baseUrl+dis}
        return null
    },

    writeFile: function(distrination, source) {
        this.createDir(distrination)
        if(source){
            fs.writeFileSync(distrination, source)
            return distrination
        }
        return null
    },

    deleteFile: function(source){
        if(fs.existsSync(source)) {   
            fs.unlink(source, (err) => {
                if (err) throw err;
            });
        }
        return null
    },

    writeExcel: function({destination, data=null, settings=null}={}){
        if(data){
            return destination
        }
        return null
    }  
}