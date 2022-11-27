<template>
    <div
        :class="{'expanded': expanded}"
        class="panel-left bg-white border-r-2 border-gray-300 p-1"
    >
        <button
            @click="expanded = !expanded"
            :title="expanded ? $t('UI.chat.colapse') : $t('UI.chat.expand')"
            class="panel-button inline-flex items-center px-2 py-1 bg-gray-500 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 active:bg-gray-900 focus:outline-none focus:border-gray-900 focus:ring focus:ring-gray-300 disabled:opacity-25 transition toggle-panel-button"
        >
            <span v-if="expanded">&ll;</span><span v-else>&gg;</span>
        </button>
        <!-- <div class="divider w-full flex">
            <span class="truncate font-semibold">{{$t('UI.chat.rooms')}}</span>
        </div> -->
        <div class="main">
            <div v-for="(group, gIdx) in groups" :key="gIdx">
                <div v-if="groups.length > 1">{{group.name}}</div>
                <div v-for="(room, idx) in group.rooms" :key="idx"
                    @click="$emit('goto-room', idx)"
                    class="h5 my-1 text-sm truncate overflow-hidden text-left hover:bg-gray-300 cursor-pointer"
                    :class="{'bg-gray-200 border-2': idx === chatRoomId && boardType === 'chat'}"
                    >
                    {{idx === defaultRoomId ? $t('UI.chat.default_room') : room}}
                </div>
            </div>
        </div>
        <div v-if="Object.keys(pickedUpCalls).length > 0" class="divider w-full flex">
            <span class="truncate font-semibold">{{$t('UI.chat.calls')}}</span>
        </div>
        <div v-if="Object.keys(pickedUpCalls).length > 0" class="main">
            <div v-for="(call, idx) in pickedUpCalls" :key="idx" 
                class="h5 my-1 text-sm truncate text-left hover:bg-gray-300 cursor-pointer"
                :class="{'bg-gray-200 border-2': call.callId === chatRoomId && boardType === 'chat'}"
                @click="$emit('goto-call', call)"
            >
                {{call.message.alias}}
            </div>
        </div>
        <div v-if="Object.keys(pendingCalls).length > 0" class="divider w-full flex">
            <span class="truncate font-semibold text-sm">{{$t('UI.chat.pending')}}</span>
        </div>
        <div v-if="Object.keys(pendingCalls).length > 0" class="main">
            <div v-for="(call, idx) in pendingCalls" :key="idx" 
                class="h5 my-1 text-sm truncate overflow-hidden text-left hover:bg-gray-300 cursor-pointer"
                :class="{'bg-gray-200 border-2': call.callId === chatRoomId && boardType === 'chat'}"
                @click="$emit('pickup-call', call)"
            >
                {{call.message.alias}}
            </div>
        </div>
        <div class="divider w-full flex" v-if="configuration.mailPeers">
            <span class="truncate font-semibold text-sm">{{$t('UI.chat.pobox')}}</span>
            <button 
                v-if="!mailRequestInProgress && !noMoreMailSlots"
                @click="() => $refs.poboxcontent.requestNewPOBox()"
                :title="$t('UI.chat.request_new_pobox')"
                class="font-semibold text-sm">+
            </button>
        </div>
        <panel-p-o-box
            v-if="configuration.mailPeers"
            class="main"
            ref="poboxcontent"
            :expanded="expanded"
            :configuration="configuration"
            :userMeta="userMeta"
            :gun="gun"
            :gunMail="gunMail"
            :boardActive="boardType === 'pobox'"
            @mail-request="mailRequestInProgress = $event"
            @no-more-slots="noMoreMailSlots = true"
            @goto-pobox="$emit('goto-pobox', $event)"
            @pobox-added="$emit('pobox-added', $event)"
        />
        <panel-registration
            v-show="Object.keys(pendingRegistrations).length + Object.keys(recentRegistrations).length > 0"
            :pendingRegistrations="pendingRegistrations"
            :recentRegistrations="recentRegistrations"
            :configuration="configuration"
            @register="$emit('register-user', $event)"
            @reject="$emit('reject-user', $event)"
        />
    </div>
</template>

<script>
import PanelPOBox from './PanelPOBox.vue'
import PanelRegistration from './PanelRegistration.vue'
/* global SEA */
/* global GUN */
// import { reactive, computed } from 'vue'
export default {
    components: { PanelPOBox, PanelRegistration },
    props: {
        userMeta: {
            type: [Object, Boolean],
            required: false,
            default: null
        },
        operator: {
            type: [Object, Boolean],
            required: false,
            default: null
        },
        gun: {
            type: [Object, Boolean],
            required: false,
            default: null
        },
        gunMail: {
            type: [Object, Boolean],
            required: false,
            default: null
        },
        publicCalls: {
            type: [Object, Boolean],
            required: true,
            default: false
        },
        invalidPublicCalls: {
            type: [Object, Boolean],
            required: true,
            default: false
        },
        managedCalls: {
            type: [Object, Boolean],
            required: true,
            default: false
        },
        pendingRegistrations: {
            type: [Object, Boolean],
            required: true,
            default: false
        },
        recentRegistrations: {
            type: [Object, Boolean],
            required: true,
            default: false
        },
        // roomsList: {
        //     type: [Object, Boolean],
        //     required: true,
        //     default: false
        // },
        chatRoomId: {
            type: [String, Boolean],
            required: false,
            default: false
        },
        configuration: {
            type: Object,
            required: false,
            default: () => {
                return {
                    mailPeers: false
                }
            }
        },
        boardType: {
          type: String,
          required: false,
          default: 'chat', // chat, pobox
          validator: function (value) {
            return ['chat', 'pobox'].includes(value)
          }
        }
    },
    emits: ['pickup-call', 'goto-call', 'goto-pobox', 'pobox-added'],
    data () {
        return {
            // defaultRoomId: false,
            calls: {},
            callsProcessing: {},
            callsExpired: {},
            expanded: false,
            mailRequestInProgress: false,
            noMoreMailSlots: false
        }
    },
    computed: {
        pickedUpCalls () {
            let picked = {}
            Object.keys(this.calls).forEach(key => {
                let callId = 'call-' + key + '-' + this.calls[key].when
                if (typeof this.managedCalls[callId] != 'undefined'  && !this.invalidPublicCalls[callId]) {
                    picked[key] = this.calls[key]
                    picked[key].callId = callId
                }
            })
            Object.keys(this.managedCalls).forEach(key => {
                let call = this.managedCalls[key]
                if (typeof call.callKey !== 'undefined' && !picked[call.callKey]) {
                    call.message = {
                        alias: call.alias,
                        nodeCert: call.certificate
                    }
                    picked[call.callKey] = call
                }
            })
            return picked
        },
        // callExpired () {
        //     let now = (new Date()).getTime()
        //     return GUN.state.is(this.call, 'document') + 7200000 < now // valid for 2h
        // },
        pendingCalls () {
            let pending = {}
            Object.keys(this.calls).forEach(key => {
                let callId = 'call-' + key + '-' + this.calls[key].when
                if (typeof this.managedCalls[callId] == 'undefined' && !this.invalidPublicCalls[callId]) {
                    pending[key] = this.calls[key]
                    pending[key].callId = callId
                }
            })
            return pending
        },
        groups () {
            let list = {}
            Object.keys(this.userMeta.access.groups).forEach( key => {
                if (key === 'default') return
                let rooms = {}
                Object.keys(this.userMeta.access.groups[key].rooms).forEach( rkey => {
                    if (rkey === 'default') return
                    rooms[rkey] = this.userMeta.access.groups[key].rooms[rkey]
                })
                list[key] = {
                    name: this.userMeta.access.groups[key].name,
                    keys: this.userMeta.access.groups[key].keys,
                    rooms: rooms
                }
            })
            return list
        },
        rooms () {
            let list = {}
            Object.keys(this.userMeta.access.groups).forEach( key => {
                if (key === 'default') {
                    return
                }
                Object.keys(this.userMeta.access.groups[key].rooms).forEach( rkey => {
                    if (rkey !== 'default') {
                        list[rkey] = this.userMeta.access.groups[key].rooms[rkey]
                    }
                })
            })
            return list
        },
        defaultRoomId () {
            let gId = this.userMeta.access.groups.default
            return this.userMeta.access.groups[gId].rooms.default
        }
    },
    created () {
        /* if (this.roomsList?.default) {
            this.defaultRoomId = this.roomsList.default
        } */
        this.publicCalls.map((data, key) => {
            if (!data || typeof data.document === 'undefined' || this.callsProcessing[key] || this.callsExpired[key] || this.calls[key] || key === '__init__' || key === '_') {
                return undefined
            }
            let senderPub = data._['#'].match(/^~([a-zA-Z0-9._-]{20,})/)
            if (!senderPub)
                return {}
            // if (this.callExpired) {
            //     this.callsExpired[key] = true
            //     return undefined
            // }
            return { data, key, senderPub: senderPub[1] }
        }).on(({ data, key, senderPub }) => {
            if (!key || !senderPub || !data || !data.document) {
                return undefined
            }
            this.gun.user(senderPub).on(sender => {
                if (sender && sender.epub) {
                    this.gun.user(senderPub).off()
                    SEA.secret(sender.epub, this.userMeta.access.keys.calls, secret => {
                        SEA.decrypt(data.document, secret, decoded => {
                            this.$set(this.calls, key, {
                                message: decoded,
                                pub: key,
                                epub: sender.epub,
                                when: GUN.state.is(data, 'document')
                            })
                        })
                    })
                }
            })
        })
    }
}
</script>

<style lang="scss" scoped>
.panel-left {
    display: flex;
    height: 100%;
    align-items: flex-start;
    flex-direction: column;
}

.panel-left > * {
    align-self: start;
}

.panel-button {
    font-size: 0.8em;
    color: white;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    cursor: pointer;
    width: 5em;
}

.main {
    height: 100%;
    width: 100%;
    overflow-y: scroll;
    display: flex;
    flex-direction: column;
    margin-top: 0.125em;
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

</style>