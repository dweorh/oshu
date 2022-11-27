/* global SEA */
import { OshuCryptoFactory } from '@dweorh/oshu-crypto'
import { USER } from './constants'
const methods = {

    signupUserToOperator() {
        // this.userMeta.operatorPubKey = operator?.credentials?.pub
        // this.userMeta.mainKeys = operator.keys.main
        if (!this.userMeta.operatorPubKey) {
            return
        }

        this.operator.get('public-enc').on(async operatorKeys => {
            if (!operatorKeys)
            return
            
            this.operator.get('public-enc').off()
            this.userMeta.operatorKeys = operatorKeys
            this.operator.get('private-access').get(this.userMeta.credentials.pub).on(async access => {
                let secret = await SEA.secret(operatorKeys.main, this.userMeta.credentials)
                this.userMeta.access = await SEA.decrypt(access, secret)
                if (!this.userMeta.access || !this.userMeta.access.certificates || !this.userMeta.access.certificates.users) {
                    return
                }
                this.operator.get('personal-data').get(this.userMeta.credentials.pub).once(async encrypted => {
                    const decrypted = await SEA.decrypt(encrypted, this.userMeta.access.keys.personal)
                    SEA.encrypt(
                        {
                            alias: this.userMeta.name,
                            status: USER.STATUS.ONLINE,
                            ts: (new Date()).getTime(),
                            ...decrypted
                        },
                        this.userMeta.access.keys.users[this.monthTsKey()],
                        encUserMeta => {
                            this.operator
                                .get('private-users')
                                .get(this.userMeta.credentials.pub)
                                .put(encUserMeta, null, { opt: { cert: this.userMeta.access.certificates.users } })
                        })
                })
                if (this.userMeta.access.keysStore) {
                    this.gun.get('~' + this.userMeta.access.keysStore.pub).get('keys').once(async keys => {
                        if (keys) {
                            const decrypted = await SEA.decrypt(keys, this.userMeta.access.keysStore)
                            if (decrypted) {
                                this.userMeta.access.keys = { ...this.userMeta.access.keys, ...decrypted }
                                
                                if (this.userMeta.access.keys.credentials) {
                                    this.authenticate(this.userMeta.access.keys.credentials, this.gunTeam).then(() => {
                                        this.teamAdmin = true
                                    })
                                }
                                if (this.userMeta.access.keys.invitation && this.config.invitation) {
                                    this.authenticate(this.userMeta.access.keys.invitation, this.gunInvitation).then(() => {
                                        this.invitationAdmin = true
                                        this.invitationId = this.userMeta.access.keys.invitation.pub
                                        this.gunInvitation.user().get('public-registration').map(async (form, key) => {
                                            if (key === '__init__') return
                                            // console.log('[public regs]', key, form === null, this.pendingRegistrations[key], form)
                                            if (form && form !== null && form.data && form.passphrase) {
                                                let oshuCrypto = await OshuCryptoFactory.create(true)
                                                await oshuCrypto.importKey(
                                                    this.userMeta.access.keys.invitation_rsa.privateKey,
                                                    this.userMeta.access.keys.invitation_passphrase
                                                )
                                                let passphrase = await oshuCrypto.decrypt(form.passphrase, 'ascii')
                                                let data = await SEA.decrypt(form.data, passphrase)
                                                this.$set(this.pendingRegistrations, key, { data: data} )
                                            } else if (this.pendingRegistrations[key] && form === null) {
                                                this.$delete(this.pendingRegistrations, key)
                                            }
                                        })
                                    })
                                }
                            }
                        }
                    })
                }

                if (this.userMeta.access.groups) {
                    this.leftPanelStatus = 1
                    
                    let gIdx = this.userMeta.access.groups?.default
                    if (gIdx && this.userMeta.access.groups[gIdx]?.rooms) {
                        this.chatRoomId = this.userMeta.access.groups[gIdx].rooms.default
                        this.goToRoom(this.chatRoomId);
                    }
                }


                this.operator.get('private-calls').map((data, key) => { 
                    if (typeof this.callsList[key] === 'undefined' || this.callsList[key] !== -1) {
                        return { data, key }
                    }
                    return {}
                }).on(({data, key}) => {
                    if (!key) return
                    SEA.decrypt(data, this.userMeta.access.keys.calls, decrypted => {
                        if (!decrypted) {
                            return false
                        }
                        const endAt = typeof decrypted.end_at === 'undefined' ? false : decrypted.end_at
                        this.$set(this.callsList, key, endAt ? -1 : decrypted)
                    })
                })

                this.publicCalls = this.operator.get('public-calls')
                this.publicCalls.once(() => {
                    this.signInToOperator = true
                })
            })
        })

        // if (this.userMeta.operatorPubKey && !this.userMeta.mainKeys) {
        //     this.callForChatToOperator()
        // }

        // if (!this.userMeta.operatorPubKey || !this.userMeta.mainKeys)
        //     return

        // this.operatorGet('public-certs').then(({ data }) => {
        this.operator.get('public-certs').on(data => {
            if (data) {
                this.userMeta.pubCerts = data
                this.operator.get('public-certs').off()
            }
        })

        // this.operator.get('private-certs').on(data => {
        //     if (data) {
        //         this.operator.get('private-certs').off()
        //         SEA.decrypt(data, this.userMeta.mainKeys, decPrivCerts => {
        //             this.userMeta.privCerts = decPrivCerts
        //             // console.log('[private certs]', this.userMeta.privCerts, data, this.userMeta.mainKeys)
        //             this.chatRoomCert = this.userMeta.privCerts.chats
        //             SEA.encrypt({
        //                 alias: this.userMeta.name,
        //                 status: USER.STATUS.ONLINE
        //             }, this.userMeta.mainKeys, encUserMeta => {
        //                 this.operator
        //                     .get('private-users')
        //                     .get(this.auth.sea.pub)
        //                     .put(encUserMeta, null, { opt: { cert: this.userMeta.privCerts.users } })
        //             })
        //         })
        //     }
        // })
 

        /* this.operator.get('private-keys').on((data) => {
            // console.log('[private keys -> data]', data)
            if (data) {
                this.operator.get('private-keys').off()
            } else {
                return undefined
            }
            if (!this.userMeta) {
                return;
            }
            SEA.decrypt(data, this.userMeta.mainKeys, decKeys => {
                console.log('[private keys]', decKeys)
                this.userMeta.keys = decKeys
                this.chatRoomKeys = this.userMeta.keys.p_chats
                this.operator.get('private-chats').get('list').on((data) => {
                    if (data) {
                        this.operator.get('private-chats').get('list').off()
                    } else {
                        return undefined
                    }
                    SEA.decrypt(data, this.userMeta.keys.p_chats, decRoomList => {
                        this.roomsList = decRoomList
                        this.chatRooms = this.operator
                            .get('private-chats')
                            .get('rooms')
        
                        this.chatRoomId = this.roomsList.default
                        this.leftPanelStatus = 1
                    })
    
                })
                this.operator.get('private-calls').map((data, key) => { 
                    console.log('[private calls]', data, key)
                    if (typeof this.callsList[key] === 'undefined' || this.callsList[key] !== -1) {
                        return { data, key }
                    }
                    return {}
                }).on(({data, key}) => {
                    if (!key) return
                    SEA.decrypt(data, this.userMeta.keys.calls, decrypted => {
                        if (!decrypted) {
                            return false
                        }
                        const endAt = typeof decrypted.end_at === 'undefined' ? false : decrypted.end_at
                        this.$set(this.callsList, key, endAt ? -1 : decrypted)
                    })
                })
            })
            this.publicCalls = this.operator.get('public-calls')
            this.publicCalls.once(() => {
                this.signInToOperator = true
            })
        }) */
        // .catch(error => console.error('[private-keys]', error))
    },
    signoutUserFromOperator() {
        return new Promise ((resolve) => {
            if (!this.userMeta.operatorPubKey || !this.userMeta.mainKeys)
                return
            SEA.encrypt({
                alias: this.userMeta.name,
                status: USER.STATUS.OFFLINE
            }, this.userMeta.access.users)
            .then(userMeta => {
                this.signInToOperator = false
                this.operator
                    .get('private-users')
                    .get(this.auth.sea.pub)
                    .put(userMeta, () => resolve(), { opt: { cert: this.userMeta.privCerts.users } })
            })
        })
    },
    async signup(user, callback) {
        this.track('signup')
        this.userMeta.name = this.config.randomAlias ? this.pickRandomAlias() : user.name
        this.userMeta.credentials = await SEA.pair()
        this.userMeta.operatorPubKey = user.operator_pub_key || user.operatorPubKey
        try {
            this.userMeta.mainKeys = typeof user.main_keys != 'object' ? JSON.parse(user.main_keys) : user.main_keys
        } catch (e) {
            console.log('[Wrong operator\'s keys]')
        }

        this.loginError = ''
        this.gun.user().create(this.userMeta.credentials, (ack) => {
            if (callback) {
                return callback.call(this, ack)
            }
            if (ack.err) {
                this.loginError = ack.err
            } else {
                this.login()
            }
        })
    },
    signout(callback, options) {
        this.track('signout')
        this.signoutUserFromOperator()
        .then(() => {
            this.gun.user().leave();
            this.auth = false
            this.userMeta.name = ''
            this.userMeta.credentials = false
            this.userMeta.operatorPubKey = ''
            this.userMeta.mainKeys = false
            this.userMeta.pubCerts = {}
            this.userMeta.privCerts = {}
            this.userMeta.access = {}
            
            if (!options || !options.preserve_chat_rooms) {
                this.messages = {}
                this.chatRooms = false
                this.chatRoomKeys = {}
                this.chatRoomCert = false
                this.chatRoomId = ''
                this.roomsList = {}
            } else {
                let keys = Object.keys(this.messages)
                this.messages = {}
                keys.forEach(key => this.messages[key] = [] )
            }

            this.publicCalls = false
            this.callsList = {}
            this.inCallRoom = false
            if (callback) {
                callback.call(this)
            }
            if (this.autoLogin && this.storeFileSession) {
                window.localStorage.removeItem(this.storeFileSession)
            }
            this.$emit('signout', { callback: callback, options: options, instance: this })
        })
    }
}

export default {
    methods
}