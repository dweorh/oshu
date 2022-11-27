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
        registration: true,
        header: {
            canSignOut: false,
            canMinimalize: false
        },
        peers: ['http://localhost:8765/gun'],
        storageStoreUrl: 'http://localhost:3000/store',
        storageFetchUrl: 'http://localhost:3000/fetch',
        storeFile: 'oshu-demo-chat',
        storeFileTeam: 'oshu-demo-chat-team',
        storeFileSesssion: 'oshu-demo-chat-session',
      }
    }
  },
  created () {
    this.configuration.registrationAuthority = this.$route.params.id
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