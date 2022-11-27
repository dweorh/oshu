<template>
  <div class="panel-main bg-white relative">
    <toast />
    <div @scroll="scrollWatcher" class="main">
        <div>
          <chat-message
            v-for="msg in messages" :key="msg.when"
            :sender="msg.who === userMeta.credentials.pub"
            :message="msg"
            :reply-to-message="findReplyToMessage(msg.document.reply_to)"
            :showAvatars="isOperator && configuration.message.showAvatar"
            :configuration="configuration"
            @avatar-click="$emit('avatar-click', $event)"
            @message-click="$emit('message-click', $event)"
            @reply-to-message-click="scrollTo($event)"
          />
        </div>
        <div class="scroll-bottom" ref="scrollBottom" />
    </div>
    <chat-form
      :userMeta="userMeta"
      :chatRoom="chatRoom"
      :chatRoomCert="chatRoomCert"
      :chatRoomKeys="chatRoomKeys"
      :chatRoomAllKeys="chatRoomAllKeys"
      :priv_to="priv_to"
      :reply_to="reply_to"
      :gun="gun"
      :configuration="configuration"
      @message-sent="$emit('message-sent', $event)"
      @file-sent="$emit('file-sent', $event)"
    />
  </div>
</template>

<script>
import debounce from 'lodash.debounce';
import ChatMessage from './ChatMessage.vue';
import ChatForm from './ChatForm.vue';
import Toast from './Toast/Toast.vue';
export default {
    props: {
        userMeta: {
            type: [Object, Boolean],
            required: false,
            default: null
        },
        messages: {
          type: [Array, Boolean],
          required: true
        },
        scroll: {
          type: Boolean,
          default: true
        },
        // chat form
        chatRoom: {
            type: [Object, Boolean],
            required: true
        },
        chatRoomKeys: {
            type: Object,
            required: true
        },
        chatRoomAllKeys: {
            type: Object,
            required: true
        },
        chatRoomCert: {
            type: [String, Boolean],
            required: true
        },
        priv_to: {
            type: [Object, Boolean],
            required: false,
            default: false
        },
        reply_to: {
            type: [Object, Boolean],
            required: false,
            default: false
        },
        gun: {
            type: [Object, Boolean],
            required: false,
            default: null
        },
        isOperator: {
            type: [Boolean],
            required: false,
            default: false
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
    emits: ['avatar-click', 'message-click', 'can-auto-scroll', 'message-sent', 'file-sent'],
    components: {
        ChatMessage, ChatForm,
        Toast
    },
    data () {
      return {
        scrollWatcher: debounce(this.watchScroll, 1000),
        canAutoScroll: true,
        lastScrollTop: 0
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
      findReplyToMessage(soul) {
        if (!soul) {
          return false
        }

        const idx = this.messages.findIndex(el => el['#'] === soul)
        if (idx >= 0) {
          return this.messages[idx]
        }
        return false
      },
      scrollTo (soul) {
        setTimeout(() => document.getElementById(soul)?.scrollIntoView({ behavior: 'auto' }), 50)
      }
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
</style>