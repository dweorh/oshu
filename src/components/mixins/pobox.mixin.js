import { OshuCryptoFactory } from '@dweorh/oshu-crypto'
// import { SEA } from "../../libs/gun"
/* global SEA */
const data = () => {
    return {
        mails: {},
        selectedPoBox: false
    }
}
const methods = {
    goToPoBox (pobox) {
        this.track('go-to-pobox')
        this.boardType = 'pobox'
        this.selectedPoBox = pobox
        // console.log('[go to pobox]', pobox)
    },
    poboxAdded (pobox) {
        this.fetchMails(pobox)
    },
    mailClicked (mail) {
        if (mail.status === 1) {
            if (this.mails && this.mails[this.selectedPoBox.email] && this.mails[this.selectedPoBox.email]) {
                this.mails[this.selectedPoBox.email][mail.idx].status = 0
                this.gunMail.user().auth(this.selectedPoBox.pair, ack => {
                    if (ack.err)
                        return
                    this.gunMail.user().get('pobox').get(mail.idx).get('s').put(0)
                })
            }
        }
    },
    async fetchMails(pobox) {
        if (!this.mails[pobox.email]) {
            this.$set(this.mails, pobox.email, {})
            const crypto = await OshuCryptoFactory.create(true)
            await crypto.importKey(decodeURIComponent(pobox.rsa.privateKey))
            
            this.gunMail.get('~' + pobox.pair.pub).get('pobox').map(async(data, idx) => {
                if (!data) return
                const key = await crypto.decrypt(data.k, 'ascii')
                const message = await SEA.decrypt(data.m, key)
                this.$set(this.mails[pobox.email], idx, {
                    idx,
                    status: data.s,
                    message
                })
            })
        }
    }
}

export default {
    data,
    methods
}