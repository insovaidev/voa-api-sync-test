const config = require('../config/config')
const fileLib = require('../libraries/fileLib')
const passwordLib = require('../libraries/passwordLib')
let  formidable = require('formidable')
const checkAuth = require('../middleware/checkAuth')
const sizeOf = require('image-size')

module.exports = function(app) {

    // Check Auth
    app.use('/upload', checkAuth)
    
    // handle file upload and save in tmp folder
    app.post('/upload', async (req, res) => {
        const form = new formidable.IncomingForm()
        const [fields, files] = await form.parse(req)
        const me = req.me    

        if(files && files.file && files.file.length) {
            const file = files.file[0]
            const extension = (file.originalFilename.split('.').slice(-1)[0]).toLowerCase()
            if(!config.allowExtension.includes(extension)) return res.status(422).send({'message':'File extension is invalid. Please upload file with extension '+config.allowExtension.join(', ')+'.'})
            try {
                
                const name = (me.port+'-'+Date.now()+'-'+passwordLib.generate(12))+'.'+extension
                const newFilePath = config.tmpDir+name

                // Move upload file to tmp
                    if(fileLib.copy(file.filepath, newFilePath, true)){
                        try {
                            var dimensions = sizeOf(newFilePath)
                            // return data
                            return res.send({
                                'data': {
                                    'name': name,
                                    'path': newFilePath,
                                    'original_name': file.originalFilename,
                                    'url': config.baseUrl+newFilePath,
                                    'size': file.size,
                                    'mime_type': file.mimetype,
                                }
                            })                          
                        } catch (error) {
                            return res.status(422).send({'message': 'File is invalid. Please upload file image only.'})
                        }

                    }
                } catch (error) {
                return res.status(422).send({'message': error.message })
            }
        }

        return res.status(422).send({'message':'Upload has been failed.'})    
    })

}