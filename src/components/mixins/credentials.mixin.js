/* global SEA */
const methods = {
    async credentialsPass (credentials) {
        let crc = this.d_crc32(credentials.pub)
        let start = crc % 10
        let len = (crc >> 2) % 10
        let salt = credentials.pub.substr(start, 13 + len)
        return await SEA.work(JSON.stringify(credentials), salt)
    },
    async copyCredentials (userMeta) {
        const data = userMeta || this.userMeta
        this.copyToClipboard(await this.exportCredentials({credentials: data.credentials}))
    },
    async exportCredentials (data) {
        let enc = await SEA.encrypt(JSON.stringify(data), data.credentials)
            enc = await SEA.encrypt(enc, this.credentialsPass({ pub: data.credentials.pub }))
        return JSON.stringify({
            credentials: { pub: data.credentials.pub, epriv: data.credentials.epriv },
            data: enc
        })
    },
    async importCredentials (data) {
        try {
            let userData = JSON.parse(data)
            let dec = await SEA.decrypt(userData.data, this.credentialsPass({ pub: userData.credentials.pub }))
            return await SEA.decrypt(dec, userData.credentials)
        } catch (error){
            console.log('[credentials error]', error)
            return false
        }
    }
}

export default {
    methods
}