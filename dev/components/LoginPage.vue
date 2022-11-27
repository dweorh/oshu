<template>
  <chat :configuration="configuration"/>
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
        // authentication: true,
        // header: {
        //     canSignOut: false,
        //     canMinimalize: false
        // },
        // storageStoreUrl: 'http://localhost:3000/store',
        // storageFetchUrl: 'http://localhost:3000/fetch',
        // storeFile: 'oshu-demo-chat',
        // storeFileTeam: 'oshu-demo-chat-team',
        // storeFileSesssion: 'oshu-demo-chat-session',
        authentication: true,
        peers: ['http://localhost:8765/gun'],
        autoSignupOperator: false,
        autoLogin: false,
        randomAlias: false,
        rightPanel: true,
        header: {
          canSignOut: false,
          canMinimalize: false,
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
      },
    }
  },
  created () {
    this.configuration.loginAccountPub = this.$route.params.id
  },
  methods: {
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