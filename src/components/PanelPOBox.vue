<template>
<div>
    <div class="main h5 my-1 text-sm truncate text-left">
        <div v-for="pobox in poboxes" :key="pobox.email"
            class="hover:bg-gray-300 cursor-pointer"
            :class="{'bg-gray-200 border-2': pobox.email === selectedEmail && boardActive}"
            @click="selectPOBox(pobox)"
            :title="pobox.email"
        >
            {{pobox.email}}
        </div>
    </div>
</div>
</template>

<script>
// import GUN from '../libs/gun'
import '../libs/gun/sea'
import { OshuCryptoFactory } from '@dweorh/oshu-crypto'
/* global SEA */
export default {
    name: 'PanelPOBox',
    props: {
        expanded: {
            type: Boolean,
            default: false
        },
        configuration: {
            type: Object,
            required: false,
            default: () => {}
        },
        userMeta: {
            type: [Object, Boolean],
            required: false,
            default: null
        },
        gun: {
            type: [Object, Boolean],
            required: false,
            default: null
        },
        gunMail: {
            type: [Object, Boolean],
            required: false,
            default: null
        },
        boardActive: {
            type: Boolean,
            requried: false,
            default: false
        }
    },
    emits: ['mail-request', 'no-more-slots', 'goto-pobox', 'pobox-added'],
    data() {
        return {
            inProgress: false,
            maxSlots: 5,
            poboxes: [],
            selectedEmail: false,
            // gunMail: false,
            connected: false
        }
    },
    watch: {
        poboxes (val) { 
            if (val.length >= this.maxSlots) {
                this.$emit('no-more-slots')
            }
        }
    },
    mounted () {
        this.fetchPOBoxes()
    },
    methods: {
        selectPOBox (box) {
            this.$emit('goto-pobox', box)
            this.selectedEmail = box.email
        },
        fetchPOBoxes () {
            this.gun.user().get('private-poboxes').once(data => {
                if (data && Object.keys(data).length > this.maxSlots) {
                    this.$emit('no-more-slots')
                }
            })
            this.gun.user().get('private-poboxes').map(async pobox => {
                const box = await SEA.decrypt(pobox, this.userMeta.access.keys.main)
                if (box) {
                    box.email = box.alias + '@' + box.domain
                    let idx = this.poboxes.findIndex(el => el.email === box.email)
                    if (idx < 0) {
                        this.poboxes.push(box)
                        this.$emit('pobox-added', box)
                    }
                }
            })
        },
        requestNewPOBox () {
            this.inProgress = true
            this.$emit('mail-request', 1)
            const mailServer = this.gunMail.get('~' +this.configuration.mailServerPub)
            mailServer.get('public').get('epub').once(serverEPub => {
                if (!serverEPub) {
                    this.inProgress = false
                    this.$emit('mail-request', 0)
                    return
                }
                mailServer.get('public').get('certs').once(async serverCerts => {
                    if (!serverCerts) {
                        this.inProgress = false
                        this.$emit('mail-request', 0)
                        return
                    }
                    const mail_pair = await SEA.pair()
                    this.gunMail.user().auth(mail_pair, async () => {
                        const crypto = await OshuCryptoFactory.create(true)
                        const crypto_keys = await crypto.generateKey()
                        const secret = await SEA.secret(serverEPub, mail_pair)
                        const message = {
                            epub: mail_pair.epub,
                            data: await SEA.encrypt({
                                // pub: mail_pair.pub,
                                rsa_pub: crypto_keys.publicKey,
                                cert_account: await SEA.certify(
                                    this.configuration.mailServerPub,
                                    { '*': 'account' },
                                    mail_pair,
                                    null,
                                    { expiry: Date.now() + 3600000 }
                                ),
                                cert_pobox: await SEA.certify(this.configuration.mailServerPub, { '*': 'pobox' }, mail_pair, null)
                            }, secret)
                        }
                        mailServer
                            .get('pobox-requests')
                            .get(mail_pair.pub)
                            .put(message, null, {opt: { cert: serverCerts.pobox }})

                        this.gunMail.user().get('account').on(async (data) => {
                            if (data) {
                                // console.log('[account]', data)
                                if (data.e && data.e !== 200) { // error may not be set, but if it is, it must be 200
                                    // for now error will be surpressed
                                    this.inProgress = false
                                    this.$emit('mail-request', 0)
                                    return
                                }
                                await crypto.importKey(crypto_keys.privateKey)
                                const account = {
                                    alias: await crypto.decrypt(data.a, 'ascii'),
                                    domain: data.d,
                                    person: await crypto.decrypt(data.p, 'ascii'),
                                    pair: mail_pair,
                                    rsa: {
                                        privateKey: encodeURIComponent(crypto_keys.privateKey),
                                        publicKey: encodeURIComponent(crypto_keys.publicKey),
                                    },
                                    server: {
                                        pub: this.configuration.mailServerPub,
                                        epub: serverEPub
                                    }
                                }
                                this.gun.user().get('private-poboxes').get(mail_pair.epub).put(
                                    await SEA.encrypt(account, this.userMeta.access.keys.main)
                                )
                            }
                            this.inProgress = false
                            this.$emit('mail-request', 0)
                        })
                    })
                })
            })
        }
    }
}
</script>

<style lang="scss" scoped>

</style>