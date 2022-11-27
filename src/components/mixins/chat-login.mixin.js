const data = function () {
    return {
        userMeta: {
            name: '',
            credentials: false,
            operatorPubKey: '',
            mainKeys: false,
            pubCerts: {},
            privCerts: {},
            access: {}
          }
    }
}

const methods = {
    signupUserToOperatorFailedEvent () {
        this.signout(() => {
          this.nonAuthView = 'register-operator-failed'
        })
    },
    authenticateAlt(data) { // that's a dummy name for the method. It is an authentication from the dedicated login form 
      this.bootstrap()
      this.login({
        name: '',
        credentials: data.user,
        operator_pub_key: data.operator
      })
    },
    switchUserEvent (data) {
        this.track('switch-user')
        if (data.credentials.pub === this.userMeta.credentials.pub || data.operatorPubKey === this.userMeta.operatorPubKey)
          return // for now it is not allowed to switch user within the same provider as I can't stop .map()
        this.signout(() => {
          this.login({
            name: data.name,
            credentials: data.credentials,
            operator_pub_key: data.operatorPubKey
            // main_keys: data.mainKeys
          })
        }, { preserve_chat_rooms: data.operatorPubKey === this.userMeta.operatorPubKey })
      },
      async autoLogin () {
        let userData = window.localStorage.getItem(this.storeFileSession)
        if (userData) {
          const credentials = await this.importCredentials(userData)
          if (!credentials) {
            window.localStorage.removeItem(this.storeFileSession)
            this.nonAuthView = 'login'
          } else {
            this.login({
              name: credentials.name,
              credentials: credentials.credentials,
              operator_pub_key: credentials.operatorPubKey
              // main_keys: credentials.mainKeys
            })
          }
        } else {
          this.nonAuthView = 'login'
        }
      },
      async login(user, callback) {
        if (user) {
          try {
            this.userMeta.name = user.name
            if (user.credentials) {
              const credentials = typeof user.credentials != 'object' ? await this.importCredentials(user.credentials) : user.credentials
              this.userMeta.credentials = credentials.credentials ?? credentials
            }
            this.userMeta.operatorPubKey = user.operator_pub_key
          } catch (error) {
            console.log('[Wrong user credentials]')
            return false
          }
          // try {
          //   this.userMeta.mainKeys = typeof user.main_keys != 'object' ? JSON.parse(user.main_keys) : user.main_keys
          // } catch (e) {
          //   console.log('[Wrong or not provided operator\'s keys]')
          //   return false
          // }
        }
        this.loginError = ''
        this.gun.user().auth(this.userMeta.credentials, async (ack) => {
            // console.log('[login cb]', ack, (new Date()).toUTCString())
            if (this.autoLogin) {
              const encCredentials = await this.exportCredentials({credentials: this.userMeta.credentials})
              if (encCredentials) {
                window.localStorage.setItem(this.storeFileSession, encCredentials)
              } else {
                window.localStorage.removeItem(this.storeFileSession)
              }
            }
            if (callback) {
              return callback.call(this, ack)
            }
            if (ack.err) {
              this.loginError = ack.err
            } else {
              this.loginError = ''
              try {
                this.signupUserToOperator()
              } catch (e) {
                console.log('[error when signupUserToOperator]', e)
              }
            }
          }
        );
      }
}

export default {
    methods, data
}