module.exports = {
    env: 'development', // 'development', 'production'
    port: process.env.PORT,

    // combine with user password
    key: 'C@mb0D1A#K1Nd0m#0F#W0nd3r',
    saltHashPassword: 10,

    // Tokens
    regenerateTokenId: true, // jti
    accessTokenExpiration: process.env.EXPIRE_TOKEN || 60, //12604800, // 900, // second
    refreshTokenExpiration: 365, // day

    // ALS - Alert List System
    als: {
        'url': 'http://167.172.92.229:3012/',
        'public_key_id': 'b87826d5-9350-4855-98bc-c3fa6111cdb6',
        'email': 'voa-644dd10c@immigration.gov.kh',
        'post_key': 'cUEdst254cRWsLgQGEwA',
    },
    
    // URL
    baseUrl: process.env.BASEURL, // URL of this server. 
    centralUrl: process.env.CENTRAL_URL,
    
    // For File Upload And 
    tmpDir: 'tmp/',
    uploadDir: 'uploads/',
    pdfDir: 'pdf/',
    xlsxDir: 'xlsx/',
    allowMimeTypes: ['image/jpeg','image/png'],
    allowExtension: ['jpg','jpeg','png'],

}