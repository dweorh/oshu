/* global SEA */
const methods = {
    callForChatToOperator (operator) {
        console.log('[chall for chat to operator]', { ...this.calling }, { ...this.userMeta })
        let operatorPubKey = typeof operator === 'string' ? operator : this.userMeta?.operatorPubKey
        if (this.calling[operatorPubKey] || !this.userMeta?.credentials) {
            console.error('[calling operator went wrong]', operatorPubKey, [ ...this.calling ], { ...this.userMeta })
            return
        }
        this.calling[operatorPubKey] = true
        this.operatorGet('public-certs', operatorPubKey)
            .then(({ data }) => {
                // console.log('[public certs]', operatorPubKey, data)
                const operatorPubCerts = data
                if (!data) {
                    console.error('[wrong public-certs calling]', operatorPubKey)
                    return
                }
                // console.log( '[in call public-certs]', { ...this.userMeta }, { ...data })
                // this.userMeta.pubCerts = data
                this.gun.get('~' + operatorPubKey).once(() => {
                    this.gun.get('~' + operatorPubKey)
                    .get('public-enc')
                    .on(async operatorKeys => {
                        if (!operatorKeys)
                        return

                        this.gun.get('~' + operatorPubKey).get('public-enc').off()

                        const nodeId = 'calls-' + this.uuidv4()
                        const expiryDate = new Date( Date.now() + ( 86400 * 7)) // 7 days
                        const nodeCert = await SEA.certify(
                            '*',
                            { '*': nodeId },
                            // this.auth.sea,
                            this.userMeta.credentials,
                            null,
                            {expiry: expiryDate.getTime()}
                        )
                        
                        const message = {
                            alias: this.userMeta.name,
                            nodeId,
                            nodeCert
                        }
            
                        const messageEnc = await SEA.encrypt(message, await SEA.secret(operatorKeys.calls, this.userMeta.credentials))
                        const messageNode = this.gun.user().get('all').set({ document: messageEnc })
            
                        // this.operator
                        this.gun.get('~' + operatorPubKey).get('public-calls')
                            // .get(this.auth.sea.pub)
                            .get(this.userMeta.credentials.pub)
                            .put(messageNode, null, { opt: { cert: operatorPubCerts.calls } })

                        this.gun.user().get(nodeId).put({})
                        this.gun.user().get(nodeId).on(async data => {
                            const decrypted = await SEA.decrypt(data, await SEA.secret(operatorKeys.calls, this.userMeta.credentials))
                            decrypted.end_at = false
                            let messageEnc = await SEA.encrypt(decrypted, this.userMeta.access.keys.calls)

                            this.inCallRoom = this.gun.user(decrypted.pub).get('messages')
                            
                            this.operator.get('private-calls')
                                .get(decrypted.callId)
                                .put(messageEnc, null, { opt: { cert: this.userMeta.access.certificates.calls }})

                            this.chatRoomId = decrypted.callId
                            this.chatRoomKeys = decrypted.keys
                            this.chatRoomCert = decrypted.certificate
                        })
                    })
                })
        }).catch(err => console.log( err ))
    },
    async pickupCall(call) {
        this.track('pickup-call')
        this.boardType = 'chat'
        // console.log('pickup call', call)

        const newChatRoom = await SEA.pair()
        const newChatRoomKeys = await SEA.pair()
        // const expiryDate = new Date( Date.now() + ( 86400 * 7)) // 7 days
        const expiryDate = new Date( Date.now() + ( 86400 * 365)) // 365 days
        const newChatRoomCertificate = await SEA.certify(
            '*',
            { '*': 'messages' },
            newChatRoom,
            null,
            {expiry: expiryDate.getTime()}
        )

        const callId = 'call-' + call.pub + '-' + call.when
        const message = {
            callId: callId,
            callKey: call.pub,
            alias: this.userMeta.name,
            pub: newChatRoom.pub,
            keys: newChatRoomKeys,
            certificate: newChatRoomCertificate
        }

        let messageEnc = await SEA.encrypt(message, await SEA.secret(call.epub, this.userMeta.access.keys.calls))
        this.gun.user(call.pub).get(call.message.nodeId).put(messageEnc, async(resp) => { 
            if (resp.err) {
                this.$set(this.invalidPublicCalls, callId, call)
                console.log('[invalid call]', callId)
                return false
            }
        
            message.credentials = newChatRoom
            message.alias = call.message.alias
            // message.call_id = callId
            message.end_at = false
    
            messageEnc = await SEA.encrypt(message, this.userMeta.access.keys.calls)
            this.operator.get('private-calls').get(callId).put(messageEnc, null, { opt: { cert: this.userMeta.access.certificates.calls }})
    
            this.inCallRoom = this.gun.user(newChatRoom.pub).get('messages')
    
            messageEnc = await SEA.encrypt({ msg: this.strings.welcome_public, sender: { alias: this.strings.bot_name } }, newChatRoomKeys)
            const messageNode = this.gun.user().get('all').set({ document: messageEnc })
            const index = new Date().toISOString();
    
            this.inCallRoom.get(index).put(messageNode, null, { opt: { cert: newChatRoomCertificate } })
            this.chatRoomId = callId
            this.chatRoomKeys = newChatRoomKeys
            this.chatRoomCert = newChatRoomCertificate
        }, { opt: { cert: call.message.nodeCert } })
        
    },
    goToCall (call) {
        this.track('go-to-call')
        this.boardType = 'chat'
        if (!this.callsList[call.callId]) {
            console.info('[no such call]', call.callId)
            return false
        }
        this.inCallRoom = this.gun.user(this.callsList[call.callId].pub).get('messages')
        this.chatRoomId = call.callId
        this.chatRoomKeys = this.callsList[call.callId].keys
        this.chatRoomCert = this.callsList[call.callId].certificate
    },
    findRoomCredentials(roomId) {
        let credentials = false
        Object.keys(this.userMeta.access.groups).forEach(gkey => {
            if (gkey === 'default') return
            Object.keys(this.userMeta.access.groups[gkey].rooms).forEach(rkey => {
                if (rkey === 'default') return
                if (rkey === roomId) {
                    credentials = {
                        keys: this.userMeta.access.groups[gkey].keys,
                        cert: this.userMeta.access.certificates.chats
                    }
                    return
                }
            })
        })
        return credentials
    },
    goToRoom (roomId) {
        this.track('go-to-room')
        this.boardType = 'chat'
        this.inCallRoom = false
        const roomCredentials = this.findRoomCredentials(roomId)
        if (roomCredentials) {
            this.chatRoomId = roomId
            this.chatRoomKeys = roomCredentials.keys[this.monthTsKey()]
            this.chatRoomAllKeys = roomCredentials.keys
            this.chatRoomCert = roomCredentials.cert
        } else {
            this.chatRoomId = false
            this.chatRoomKeys = {}
            this.chatRoomAllKeys = {}
            this.chatRoomCert = false
        }
    }
}

export default {
    methods
}