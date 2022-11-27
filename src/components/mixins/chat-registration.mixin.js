/* global SEA */
const methods = {
    registerUser (user_pub) {
        let userReg = this.pendingRegistrations[user_pub]
        if (!userReg) return
        this.setupUser(this.userMeta.access, userReg.data.form, { credentials: userReg.data.user }, async () => {
            const loginAccount = await SEA.pair()
            const password = userReg.data.form.password
            delete userReg.data.form.password
            this.createAccount(loginAccount, this.gunTechnical)
                .then(() => {
                    this.authenticate(loginAccount, this.gunTechnical)
                        .then(async() => {
                            this.recentRegistrations[user_pub] = {
                                ts: (new Date()).getTime(),
                                // data: userReg.data,
                                personalData: userReg.data.form,
                                loginAccount
                            }
                            const loginData = {
                                user: userReg.data.user,
                                operator: this.userMeta.operatorPubKey,
                                certificate: await SEA.certify(
                                    '*',
                                    { '*': 'login'},
                                    loginAccount,
                                    null
                                )
                            }
                            this.gunTechnical.user().get('login').put(await SEA.encrypt(loginData, password))
                            this.gunInvitation.user().get('public-registration').get(user_pub).put(null)
                        })
                })
        })
    },
    rejectUser (user) {
        console.log('[reject user]', user)
    }
}

export default {
    methods
}