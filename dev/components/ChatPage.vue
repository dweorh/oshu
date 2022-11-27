<template>
  <chat :configuration="configuration" @signout="signout" @tracking="track"/>
</template>

<script>
import Chat from '../../src/Chat.vue'
export default {
  components: {
    Chat
  },
  data () {
    return {
      configuration: {
        peers: ['http://localhost:8765/gun'],
        autoSignupOperator: false,
        autoLogin: false,
        randomAlias: false,
        rightPanel: true,
        header: {
          showNick: true,
          showOpExport: true,
          canSwitchUser: false,
          canMakeCalls: false,
          showInvitationLink: true
        },
        message: {
          showAvatar: true
        },
        storageStoreUrl: 'http://localhost:3000/store',
        storageFetchUrl: 'http://localhost:3000/fetch',
        // mailPeers: 'http://localhost:8765/gun',
        mailEnabled: false,
        mailServerPub: '<GUN-PUB-KEY>',
        storeFile: 'oshu-demo-chat',
        storeFileTeam: 'oshu-demo-chat-team',
        storeFileSesssion: 'oshu-demo-chat-session',
        invitation: true,
        invitationDomain: window.location.origin
      }
    }
  },
  methods: {
    track(event) {
      console.log('[tracking]', event)
    },
    signout (event) {
      console.log('[singout]', event)
      // if (!event.callback && event.instance) {
      //   event.instance.$destroy()
      // }
    }
  }
}
</script>

<style lang="scss" src="../../src/styles/styles.scss">

</style>
<style>
.avatar {
  background-color: #912C48;
}
.avatar-alias {
  color: #d2e997;
}
</style>