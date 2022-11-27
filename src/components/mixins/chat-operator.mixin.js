import { OshuCryptoFactory } from '@dweorh/oshu-crypto'
// import debounce from 'lodash.debounce';

/* global SEA */
const methods = {
    createAccount(credentials, gunInstance) {
        return new Promise((resolve, reject) => {
            gunInstance.user().create(credentials, ack => {
                if(ack.err)
                    reject(ack)
                else
                    resolve()
            })
        })
    },
    authenticate(credentials, gunInstance) {
        return new Promise((resolve, reject) => {
            gunInstance.user().auth(credentials, ack => {
                if (ack.err)
                    reject(ack)
                else
                    resolve()
            })
        })
    },
    createInvitationAccount (credentials, pubKey) {
        const expiryDate = new Date()
        expiryDate.setFullYear( expiryDate.getFullYear() + 1 )
        this.createAccount(credentials, this.gunInvitation)
            .then(() => {
                this.authenticate(credentials, this.gunInvitation)
                    .then(async() => {
                        const certsPublic = {
                            registration: await SEA.certify(
                                '*',
                                { '*': 'public-registration', '+': '*' },
                                credentials,
                                null,
                                {expiry: expiryDate.getTime()}
                            )
                        }
                        this.gunInvitation.user().get('public-registration').get('__init__').put({message: 'ignore'})
                        this.gunInvitation.user().get('public-certs').put({
                            registration: certsPublic.registration
                        })
                        this.gunInvitation.user().get('public-enc').put({
                            registration: pubKey
                        })
                    })
            })
    },
    createOperator () {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async(resolve, reject) => {
            const credentials = await SEA.pair()
            const expiryDate = new Date()
                
            expiryDate.setFullYear( expiryDate.getFullYear() + 1 )
            this.createAccount(credentials, this.gunTeam)
                .then(() => {
                    this.authenticate(credentials, this.gunTeam)
                        .then(async() => {
                            const blacklists = {
                                public: this.gunTeam.user().get('all').set({}),
                                private: this.gunTeam.user().get('all').set({})
                            }
            
                            this.gunTeam.get('blacklists').get('public').put(blacklists.public)
                            this.gunTeam.get('blacklists').get('private').put(blacklists.private)
            
                            /* the main operator keys */
                            let oshuCrypto = await OshuCryptoFactory.create(true)
                            let passphrase = this.uuidv4()
                            const keys = {
                                credentials,
                                main: await SEA.pair(),
                                invitation: await SEA.pair(),
                                invitation_rsa: await oshuCrypto.generateKey(passphrase),
                                invitation_passphrase: passphrase,
                                p_chats: await SEA.pair(),
                                calls: await SEA.pair(),
                                users: {
                                    [this.monthTsKey()]: await SEA.pair(),
                                    [this.monthTsKey(1)]: await SEA.pair()
                                },
                                registration: await SEA.pair(),
                                personal: await SEA.pair()
                            }
                            const certsPublic = {
                                calls: await SEA.certify(
                                    '*',
                                    { '*': 'public-calls', '+': '*' },
                                    credentials,
                                    null,
                                    {expiry: expiryDate.getTime(), blacklists: blacklists.public}
                                )
                            }
                            if (this.config.invitation) {
                                this.createInvitationAccount(keys.invitation, keys.invitation_rsa.publicKey)
                            }
                            this.gunTeam.user().get('public-calls').get('__init__').put({message: 'ignore'})
                            this.gunTeam.user().get('public-enc').put({
                                main: keys.main.epub,
                                calls: keys.calls.epub
                            })
            
                            this.gunTeam.user().get('public-certs').put({
                                calls: certsPublic.calls
                            })
            
                            // let certsPrivateEnc = await SEA.encrypt(certsPrivate, keys.main)
                            // this.gunTeam.user().get('private-certs').put(certsPrivateEnc)
            
                            let keysEnc = await SEA.encrypt(keys, keys.main)
                            this.gunTeam.user().get('private-keys').put(keysEnc)
            
                            let usersEnc = await SEA.encrypt({}, keys.main)
                            this.gunTeam.user().get('private-users').put(usersEnc)

                            let accessEnc = await SEA.encrypt({}, keys.main)
                            this.gunTeam.user().get('private-access').put(accessEnc)
            
                            let callsEnc = await SEA.encrypt({}, keys.main)
                            this.gunTeam.user().get('private-calls').put(callsEnc)

                            let dashboardChatID = this.uuidv4()
                            let rooms = {}
                            rooms[dashboardChatID] = 'main'
                            rooms.default = dashboardChatID

                            let defaultGroupId = this.uuidv4()
                            let groups = {}
                            groups[defaultGroupId] = {
                                name: 'main',
                                keys: {
                                    [this.monthTsKey()]: await SEA.pair(),
                                    [this.monthTsKey(1)]: await SEA.pair()
                                },
                                rooms
                            }

                            groups.default = defaultGroupId
                            this.gunTeam.user().get('private-groups').put(await SEA.encrypt(groups, keys.main))

                            this.gunTeam.user().get('private-chats').get(defaultGroupId).get('list')
                                .put(await SEA.encrypt(rooms, groups[defaultGroupId].keys[this.monthTsKey()]))
            
                            this.gunTeam.user().get('private-chats').get(defaultGroupId).get('rooms')
                                .get(dashboardChatID)
                                .put(await SEA.encrypt({}, groups[defaultGroupId].keys[this.monthTsKey()]))

                            // this.gunTeam.user().get('private-chats').get('list')
                            //     .put(await SEA.encrypt(rooms, keys.p_chats))
            
                            // this.gunTeam.user().get('private-chats').get('rooms')
                            //     .get(dashboardChatID)
                            //     .put(await SEA.encrypt({}, keys.p_chats))
                            // this.addRoom(keys.p_chats)
                            resolve({
                                keys,
                                certsPublic,
                                // certsPrivate,
                                credentials,
                                // rooms,
                                groups
                            })
                        })
                        .catch(err => reject(err))
                })
                .catch(err => reject(err))
        })
    },
    signupOperator (user) {
        this.createOperator()
            .then((operator) => {
                user.main_keys = operator.keys.main
                user.operatorPubKey = operator.credentials.pub
                delete user.operator_pub_key
                this.signup(user, () => {
                    // console.log('[signup as operator]', ack)
                    this.login(null, async () => {

                        // this.userMeta.operatorPubKey = operator.credentials.pub
                        // this.userMeta.mainKeys = operator.keys.main
                        this.setupSuperAdmin(operator, this.userMeta, () => {
                            this.signupUserToOperator()
                        })
                    })
                })
            })
            .catch(error => {
                // console.log('[create operator failed]', error)
                this.$root.$emit('createOperatorFailed', error)
                this.track('create-operator-failed')
            })
    },
    async createUserCertificates(operator, user, expiryDate = false) {
        if (!expiryDate) {
            expiryDate = new Date(this.monthTsKey(1))
        }
        const credentials = operator.credentials ?? operator.keys.credentials
        const fakeCredentials = await SEA.pair()
        return {
            users: await SEA.certify(
                user.credentials,
                { '*': 'private-users', '+': '*' },
                credentials,
                null,
                {expiry: expiryDate.getTime()}
            ),
            access: await SEA.certify( // fake certificate
                user.credentials,
                { '*': 'private-access' },
                fakeCredentials,
                null,
                {expiry: expiryDate.getTime()}
            ),
            chats: await SEA.certify(
                user.credentials,
                { '*': 'private-chats' },
                credentials,
                null,
                {expiry: expiryDate.getTime()}
            ),
            calls: await SEA.certify(
                user.credentials,
                { '*': 'private-calls' },
                credentials,
                null,
                {expiry: expiryDate.getTime()}
            ),
            groups: await SEA.certify( // fake certificate
                user.credentials,
                { '*': 'private-groups' },
                fakeCredentials,
                null,
                {expiry: expiryDate.getTime()}
            ),
            personal: await SEA.certify(
                user.credentials,
                { '*': 'personal-data', '+': '*' },
                credentials,
                null,
                {expiry: expiryDate.getTime()}
            )
        }
    },    
    async createSuperAdminCertificates(operator, user) {
        const expiryDate = new Date()
        expiryDate.setFullYear( expiryDate.getFullYear() + 1 )
        const credentials = operator.credentials ?? operator.keys.credentials
        return {
            users: await SEA.certify(
                user.credentials,
                { '*': 'private-users' },
                credentials,
                null,
                {expiry: expiryDate.getTime()}
            ),
            access: await SEA.certify(
                user.credentials,
                { '*': 'private-access' },
                credentials,
                null,
                {expiry: expiryDate.getTime()}
            ),
            chats: await SEA.certify(
                user.credentials,
                { '*': 'private-chats' },
                credentials,
                null,
                {expiry: expiryDate.getTime()}
            ),
            calls: await SEA.certify(
                user.credentials,
                { '*': 'private-calls' },
                credentials,
                null,
                {expiry: expiryDate.getTime()}
            ),
            groups: await SEA.certify(
                user.credentials,
                { '*': 'private-groups' },
                credentials,
                null,
                {expiry: expiryDate.getTime()}
            ),
            personal: await SEA.certify(
                user.credentials,
                { '*': 'personal-data' },
                credentials,
                null,
                {expiry: expiryDate.getTime()}
            )
        }
    },
    async setupSuperAdmin(operator, user, cb = null) {
        let certificates = await this.createSuperAdminCertificates(operator, user)
        let keysStore = await SEA.pair()
        this.authenticate(keysStore, this.gunTechnical)
        .then(async () => {
            const keysEncryptped = await SEA.encrypt(operator.keys, keysStore)
            this.gunTechnical.user().get('keys').put(keysEncryptped)
            let data = {
                operator: {
                    epub: operator.keys.epub ?? operator.keys.credentials?.epub
                },
                keysStore: keysStore,
                certificates: certificates,
                groups: operator.groups,
                keys: { 
                    calls: operator.keys.calls,
                    users: operator.keys.users,
                    p_chats: operator.keys.p_chats,
                    personal: operator.keys.personal
                }
            }
            let secret = await SEA.secret(user.credentials.epub, operator.keys.main)
    
            this.gunTeam.user().get('private-access').get(user.credentials.pub)
                .put(await SEA.encrypt(data, secret), () => {
                    if (cb) cb(data)
                })
        })
    },
    async setupUser(operator, personalData, user, cb = null) {
        let certificates = await this.createUserCertificates(operator, user)
        let fakeKeys = await SEA.pair() // those keys are just to keep the same data size as admin has
        let data = {
            operator: {
                epub: operator.keys.epub ?? operator.keys.credentials?.epub
            },
            keysStore: fakeKeys,
            certificates: certificates,
            groups: operator.groups,
            keys: { 
                calls: operator.keys.calls,
                users: operator.keys.users,
                p_chats: operator.keys.p_chats,
                personal: operator.keys.personal
            }
        }
        let secret = await SEA.secret(user.credentials.epub, operator.keys.main)

        this.gunTeam.user().get('private-access').get(user.credentials.pub)
            .put(await SEA.encrypt(data, secret), () => {
                if (cb) cb(data)
            })

        this.gunTeam.user().get('personal-data').get(user.credentials.pub)
            .put(await SEA.encrypt(personalData, operator.keys.personal))
    },
    operatorGet(key, operatorPubKey) {
        let state = {
            calls: 10,
            data: null,
            dirty: false
        }
        // sometimes there is a delay in updates
        return new Promise((resolve, reject) => {
            let interval = setInterval(() => {
                if (!state.dirty) {
                    state.dirty = true
                    const operator = operatorPubKey ? this.gun.get('~' + operatorPubKey) : this.operator
                    state.node = operator.get(key).once((data) => {
                        // console.log('[get]', key, data, state, typeof data)
                        state.dirty = false
                        if (typeof data !== 'undefined') {
                            state.calls = 0
                            state.data = data
                        } else {
                            state.calls--
                        }
                    })
                }
                if (state.calls <= 0) {
                    clearInterval(interval)
                    
                    if (state.data !== null) {
                        resolve({ data: state.data, node: state.node })
                    } else {
                        reject(state.data)
                    }
                }
            }, 350)
        })
    }
}

export default {
    methods
}
