<template>
  <div
    :class="[nonAuthView, {
      'minimalized': minimalized, 'loggedout': !this.auth,
      'three-panels': signInToOperator && panelsNo === 3,
      'two-panels': signInToOperator && panelsNo === 2,
    }]"

    class="chat-window shadow rounded-bl-md rounded-br-md"
  >
    <template v-if="!this.auth">
      <chat-header
        @minimalize="minimalized = true"
        @maximalize="minimalized = false"
        :minimalized="minimalized"
        :configuration="config"
      />
      <login-form
        v-if="nonAuthView === 'login'"
        v-show="!minimalized"
        @login="login"
        @sign-up="signup"
        @sign-up-operator="signupOperator"
        :loginError="loginError"
      />
      <register-operator-failed-form
        v-if="nonAuthView === 'register-operator-failed'"
        v-show="!minimalized"
        @sign-up-operator="signupOperator"
      />
      <registration-form
        v-if="nonAuthView === 'registration'"
        :gun="gun"
        :configuration="config"
      />
      <authentication-form
        v-if="nonAuthView === 'authentication'"
        :gun="gun"
        :configuration="config"
        @login="authenticateAlt"
      />
      <in-progress-form
        v-if="nonAuthView === 'in-progress'"
        v-show='!minimalized'
      />
    </template>
    <template v-else>
      <chat-header
        @signout="signout"
        @minimalize="minimalized = true"
        @maximalize="minimalized = false"
        :configuration="config"
        :userMeta="userMeta"
        :minimalized="minimalized"
      />
      <div
        v-if="(!signInToOperator && userMeta.operatorPubKey)"
        v-show="!minimalized"
        class="panels items-center"
      >
        <div class="animate-pulse all-columns">
          {{$t('UI.chat.loading')}}
        </div>
      </div>
      <div
        v-else  
        v-show="!minimalized"
        class="panels"
      >
        <panel-left v-if="signInToOperator && leftPanelStatus === 1 && publicCalls && config.leftPanel"
          :userMeta="userMeta"
          :operator="operator"
          :gun="gun"
          :gunMail="gunMail"
          :managedCalls="callsList"
          :publicCalls="publicCalls"
          :invalidPublicCalls="invalidPublicCalls"
          :pendingRegistrations="pendingRegistrations"
          :recentRegistrations="recentRegistrations"
          :chatRoomId="chatRoomId"
          :configuration="config"
          :boardType="boardType"
          @pickup-call="pickupCall"
          @goto-call="goToCall"
          @goto-room="goToRoom"
          @goto-pobox="goToPoBox"
          @pobox-added="poboxAdded"
          @register-user="registerUser"
          @reject-user="rejectUser"
        />
        <panel-main
          v-if="config.mainPanel"
          v-show="boardType === 'chat'"
          :configuration="config"
          :messages="messages[chatRoomId] || false"
          :userMeta="userMeta"
          :scroll="scrollToBottom"
          :chatRoom="currentRoom"
          :chatRoomKeys="chatRoomKeys"
          :chatRoomAllKeys="chatRoomAllKeys"
          :chatRoomCert="chatRoomCert"
          :priv_to="priv_to"
          :reply_to="reply_to"
          :gun="gun"
          :isOperator="signInToOperator"

          @avatar-click="privMessage"
          @message-click="replyTo"
          @can-auto-scroll="canAutoScroll = $event"

          @message-sent="messageSent"
          @file-sent="fileSent"
        />
        <panel-po-box-main
          v-if="config.mainPanel" 
          v-show="boardType === 'pobox'"
          :configuration="config"
          :userMeta="userMeta"
          :scroll="scrollToBottom"
          :gun="gun"
          :mails="mails[selectedPoBox.email] || []"
          @mail-click="mailClicked"
        />
        <panel-right v-if="signInToOperator && config.rightPanel"
          :userMeta="userMeta"
          :operator="operator"
        />
      </div>
    </template>
  </div>
</template>

<script>
import GUN from './libs/gun'
import './libs/gun/sea';
import {merge} from 'lodash'
// import '../../libs/git/gun/axe';
// import GUN from 'gun'
// import 'gun/sea';
// import 'gun/axe';
import debounce from 'lodash.debounce';
import PanelMain from './components/PanelMain.vue';
import PanelPoBoxMain from './components/PanelPOBoxMain.vue';
import PanelLeft from './components/PanelLeft.vue';
import PanelRight from './components/PanelRight.vue';
import ChatHeader from './components/ChatHeader.vue';
import LoginForm from './components/LoginForm.vue';
import RegisterOperatorFailedForm from './components/RegisterOperatorFailedForm.vue'
import InProgressForm from './components/InProgressForm.vue'
import RegistrationForm from './components/RegistrationForm.vue'
import AuthenticationForm from './components/AuthenticationForm.vue'

import ChatHelpers from './components/mixins/chat-helpers.mixin.js'
import ChatOperator from './components/mixins/chat-operator.mixin.js'
import ChatPublicCalls from './components/mixins/chat-public-calls.mixin.js'
import ChatSignInOut from './components/mixins/chat-sign-in-out.mixin.js'
import ChatTracking from './components/mixins/chat-tracking.mixin.js'
import POBoxes from './components/mixins/pobox.mixin.js'
import CredentialsMixin from './components/mixins/credentials.mixin.js'
import ChatMessages from './components/mixins/chat-messages.mixin.js'
import ChatLogin from './components/mixins/chat-login.mixin.js'
import ChatRegistration from './components/mixins/chat-registration.mixin.js'

const deployOshu = (configuration, instance) => {
  require('./libs/gun/lib/radix')
  const radisk = require('./libs/gun/lib/radisk')
  require('./libs/gun/lib/store')
  require('./libs/gun/lib/rindexed')
  const storeFile =  configuration.storeFile || 'wim-chat'
  const storeFileTeam =  configuration.storeFileTeam || 'wim-chat-team'
  const storeFileSession = configuration.storeFileSession || 'wim-chat-session'
  const peers = configuration.peers
  let gunConnectedChecksum = 31

  const gun = GUN({peers: peers, localStorage: false, radisk: radisk || false, file: storeFile });
  // gun.on('create', (msg) => console.log('[on create]', msg))
  // gun.on('bye', (msg) => console.log('[on bye]', msg))
  gun.on('hi', (msg) => {
    if (msg.wire && msg.wire.readyState === 1) {
      instance.gunConnected += 1
    }
  })
  let gunTeam = false
  if (configuration.registration) {
    gunConnectedChecksum -= 2
  } else {
    gunTeam = GUN({peers: peers, localStorage: false, radisk: radisk || false, file: storeFileTeam });
    gunTeam.on('hi', (msg) => {
      if (msg.wire && msg.wire.readyState === 1) {
        instance.gunConnected += 2
      }
    })
  }

  let gunMail = false
  if(configuration.mailEnabled) {
    gunMail = GUN({peers: configuration.mailPeers, localStorage: false});
    gunMail.on('hi', (msg) => {
      if (msg.wire && msg.wire.readyState === 1) {
        instance.gunConnected += 4
      }
    })
  } else {
    gunConnectedChecksum -= 4
  }

  let gunInvitation = false
  if (configuration.invitation) {
    gunInvitation = GUN({peers: peers, localStorage: false, radisk: false });
    gunInvitation.on('hi', (msg) => {
      if (msg.wire && msg.wire.readyState === 1) {
        instance.gunConnected += 8
      }
    })
  } else {
    gunConnectedChecksum -= 8
  }

  let gunTechnical = false
  gunTechnical = GUN({peers: peers, localStorage: false, radisk: false });
  gunTechnical.on('hi', (msg) => {
    if (msg.wire && msg.wire.readyState === 1) {
      instance.gunConnected += 16
    }
  })

  window.gun_user = gun
  window.gun_team = gunTeam
  window.gun_invitation = gunInvitation
  window.gun_technical = gunTechnical

  return {
    gun, gunTeam, gunInvitation, gunTechnical, gunMail, storeFileSession, gunConnectedChecksum
  }
}

export default {
  name: 'Chat',
  components: {
    PanelMain, PanelPoBoxMain, ChatHeader, LoginForm, RegistrationForm, AuthenticationForm,
    PanelLeft, PanelRight, RegisterOperatorFailedForm, InProgressForm
  },
  mixins: [ChatHelpers, ChatOperator, ChatPublicCalls, ChatSignInOut, ChatMessages, ChatLogin, ChatTracking, POBoxes, CredentialsMixin, ChatRegistration],
  props: {
    configuration: {
      type: Object,
      required: false,
      default () {
        return {}
      }
    }
  },
  data () {
    const {gun, gunTeam, gunInvitation, gunTechnical, gunMail, storeFileSession, gunConnectedChecksum} = deployOshu(this.configuration, this)

    return {
      gun,
      gunTeam,
      gunInvitation,
      gunTechnical,
      gunMail,
      gunConnected: 0,
      gunConnectedChecksum,
      strings: {
        bot_name: 'ChatBot: Argus Panoptes',
        welcome_public: this.$t('UI.chat.welcome_public')
      },
      canAutoScroll: true,
      scrollToBottom: false,
      scrollDebouncer: debounce(() => this.scrollToBottom = false, 50),
      unreadMessages: 0,
      loginError: '',
      auth: false,
      minimalized: false,
      chatRooms: false,
      chatRoomId: '',
      chatRoomKeys: {},
      chatRoomAllKeys: {},
      chatRoomCert: false,
      boardType: 'chat',
      roomsList: {}, // this.operator.get('private-chats').get('list') <-- decrytped list
      calling: {}, // list of pending calls
      publicCalls: false, // this.operator.get('public-calls')
      invalidPublicCalls: {}, // eg. certificate expired
      callsList: {}, // managed calls
      signInToOperator: false,
      inCallRoom: false, // each call it is a separate gun.user() space
      leftPanelStatus: 0, // 0 - in progress, 1 - ready
      settingsExpanded: false,
      nonAuthView: 'login',
      storeFileSession: storeFileSession,
      invitationAdmin: false,
      invitationId: '',
      teamAdmin: false,
      pendingRegistrations: {},
      recentRegistrations: {},
      loginAccountPub: ''
    }
  },
  computed: {
    registrations() { return Object.keys(this.pendingRegistrations).length },
    config () {
      const settings = {
        randomAlias: false,
        leftPanel: true,
        mainPanel: true,
        rightPanel: true,
        header: {
          showNick: true,
          canCloseChat: false,
          canSignOut: true,
          canMinimalize: true,
          canSwitchUser: true,
          canMakeCalls: true
        },
        message: {
          showAvatar: true
        },
        autoSignupOperator: false,
        autoLogin: false,
        mailEnabled: true,
        invitation: false,
        invitationDomain: '',
        registration: false,
        registrationAuthority: false,
        teamAdmin: this.teamAdmin,
        invitationAdmin: this.invitationAdmin,
        invitationId: this.invitationId,
        authentication: false,
        loginAccountPub: ''
      }
      return merge(settings, this.configuration)
    },
    panelsNo () {
      return +this.config.leftPanel + this.config.mainPanel + this.config.rightPanel
    },
    operator () {
      let op =  this.gun.get('~' + this.userMeta.operatorPubKey)
      return op
    },
    currentRoom () {
      return this.inCallRoom || this.findChatRoom(this.chatRoomId)
    }
  },
  /* eslint-disable vue/no-deprecated-destroyed-lifecycle */
  beforeDestroy () {
    console.log('[chat destroyed]')
  },
  mounted () {
    if(this.configuration.registration) {
      this.nonAuthView = 'registration'
    } else if(this.configuration.authentication) {
      this.nonAuthView = 'authentication'
    } else {
      this.bootstrap()
    }
  },
  watch: {
    auth (val) {
      /* in case of successful login reset nonAuthView to default one */
      if (val.sea && val.sea.pub) {
        this.nonAuthView = 'login'
      }
    },
    minimalized (newVal) {
      if (!newVal) {
        this.$root.$emit('typeMessageFocus')
      }
    },
    chatRoomId (newVal) {
      if (newVal) {
        if (!this.messages[newVal]) {
          this.messages[newVal] = []
          // this.goToRoom(newVal)
          this.fetchMessages(newVal, this.inCallRoom || this.findChatRoom(newVal), this.chatRoomKeys, this.chatRoomAllKeys)
        }
      }
    }
  },
  methods: {
    bootstrap () {
      this.gun.on('auth', async(event) => {
        this.auth = event
      });
      this.gun.user().get('alias').on( v => this.userMeta.name = v)
      this.$root.$on('switchUser', this.switchUserEvent)
      // this.$root.$on('addContact', this.addContactEvent)
      this.$root.$on('makeCall', this.makeCallEvent)

      this.$root.$on('signupUserToOperatorFailed', this.signupUserToOperatorFailedEvent)
      this.$root.$on('createOperatorFailed', this.signupUserToOperatorFailedEvent)
      if (this.config.autoSignupOperator || this.config.autoLogin) {
        this.nonAuthView = 'in-progress'
        if (this.gunConnected < 3) {
          this.config.autoLogin ? this.autoLogin() : this.signupOperator({})
        } else {
          /* gun is not ready yet */
          console.log('[GUN is not ready yet]')
          let interval = setInterval(() => {
            if (this.gunConnected === this.gunConnectedChecksum) {
              this.config.autoLogin ? this.autoLogin() : this.signupOperator({})
              clearInterval(interval)
            }
          }, 100)
        }
      }
    },
    makeCallEvent (contact) {
      this.track('make-call')
      this.callForChatToOperator(contact)
    },
    autoScroll() {
      this.scrollToBottom = true
      this.unreadMessages = false
      this.scrollDebouncer()
    },
    findChatRoom(roomId) {
      if (!roomId) return false
      let groups = this.userMeta?.access?.groups
      let gIdx = false
      Object.keys(groups).forEach(idx => {
          if (idx === 'default') return
          if (groups[idx].rooms[roomId]) {
              gIdx = idx
          }
      })
      if (gIdx) {
          return this.operator.get('private-chats').get(gIdx).get('rooms').get(roomId)
      }
      return false
    }
  }
}
</script>
