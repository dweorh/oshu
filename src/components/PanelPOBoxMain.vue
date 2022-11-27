<template>
  <div class="panel-main bg-white relative">
    <toast />
    <div @scroll="scrollWatcher" class="main">
      <div v-for="mail in mails" :key="mail.idx" class="message flex-col text-left mx-1 mb-2">
        <div :class="{'font-semibold': mail.status === 1}" class="cursor-pointer" @click="mailClicked(mail)">{{mail.message.s}}</div>
        <div class="text-xs">{{mail.message.mfn}} {{mail.message.mf}}</div>
        <div class="text-xs">{{formatTime(mail.message.d)}}</div>
        <div class="text-sm whitespace-pre-line" v-show="expandedMail === mail.idx">{{formatMessage(mail.message.t)}}</div>
      </div>
      <div class="scroll-bottom" ref="scrollBottom" />
    </div>
  </div>
</template>

<script>
import debounce from 'lodash.debounce';
import Toast from './Toast/Toast.vue';
export default {
    props: {
        userMeta: {
            type: [Object, Boolean],
            required: false,
            default: null
        },
        mails: {
          type: [Array, Object],
          required: true,
          default: () => {}
        },
        scroll: {
          type: Boolean,
          default: true
        },
        gun: {
            type: [Object, Boolean],
            required: false,
            default: null
        },
        configuration: {
            type: Object,
            required: false,
            default: () => {
                return {
                    message: {
                        showAvatar: true 
                    }
                }
            }
        }
    },
    emits: ['can-auto-scroll', 'mail-click'],
    components: {
        Toast
    },
    data () {
      return {
        scrollWatcher: debounce(this.watchScroll, 1000),
        canAutoScroll: true,
        lastScrollTop: 0,
        expandedMail: false
      }
    },
    watch: {
      scroll (newVal) {
        if (newVal) {
          this.scrollToBottom()
        }
      },
      canAutoScroll (newVal) {
        this.$emit('can-auto-scroll', newVal)
      }
    },
    methods: {
      watchScroll(e) {
        this.canAutoScroll = (e.target.scrollTop || Infinity) > this.lastScrollTop;
        this.lastScrollTop = e.target.scrollTop;
      },
      scrollToBottom () {
        setTimeout(() => this.$refs.scrollBottom?.scrollIntoView({ behavior: 'auto' }), 50)
      },
      scrollTo (soul) {
        setTimeout(() => document.getElementById(soul)?.scrollIntoView({ behavior: 'auto' }), 50)
      },
      mailClicked (mail) {
        this.$emit('mail-click', mail)
        if (this.expandedMail === mail.idx) {
          this.expandedMail = false
        } else {
          this.expandedMail = mail.idx
        }
      },
      formatMessage (text) {
        return text.replaceAll('\\n', '\n\r')
      },
      formatTime (ts) {
        let now = new Date()
        let tsDate = new Date(ts)

        if (now.getDate() == tsDate.getDate() && now.getMonth() == tsDate.getMonth() && now.getFullYear() == tsDate.getFullYear()) {
          return tsDate.toLocaleString(
            undefined,{
              hour: 'numeric',
              minute: 'numeric',
              second: 'numeric'
            })
        }
        return tsDate.toLocaleString(
          undefined,{
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
          })
      },
    }
}
</script>

<style>
  .panel-main {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

 .main {
    height: 100%;
    overflow-y: scroll;
    display: flex;
    flex-direction: column;
    /* background-color: rgba(220, 219, 226, 0.897); */
  }

  .main::-webkit-scrollbar {
    width: 0.25rem;
  }
  
  .main::-webkit-scrollbar-track {
    /* background: #1e1e24; */
    background: rgb(55, 65, 81);
  }
  
  .main::-webkit-scrollbar-thumb {
    /* background: #444; */
    background: rgb(209, 213, 219);
  }
  .scroll-bottom {
    margin-top: 1em;
  }

  .message {
    display: flex;
    /* align-items: self-start; */
    margin: 0;
    word-wrap: break-word;
  }
</style>