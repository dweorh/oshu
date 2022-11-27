<template>
    <div class="header rounded-tl-md rounded-tr-md bg-gray-500 text-white gradient">
        <div v-if="!minimalized" class="chat-open">
            <dymek class="p-0.5 mx-2 fill-white"
                :title="userMeta && userMeta.name ? $t('UI.chat.hello') + ' ' + userMeta.name : ''"/>
            <div class="user-bio">
                <span v-if="userMeta && userMeta.name  && configuration.header.showNick">{{$t('UI.chat.hello')}} <span class="user-name">{{prepUserName(userMeta.name)}}</span></span>
                <!-- <img :src="'https://avatars.dicebear.com/api/initials/' + username + '.svg'" alt="avatar" />  -->
            </div>
            <div class="flex flex-row">
                <settings-icon v-if="userMeta && userMeta.access" class="p-0.5 mx-1" @click="settingsExpanded = !settingsExpanded"/>
                <logout-icon  v-if="configuration.header.canSignOut" class="p-0.5 mx-1" @click="$emit('signout')" />
                <minimalize-icon v-if="configuration.header.canMinimalize" class="p-0.5 mx-1" @click="$emit('minimalize')" />
                <button
                    v-if="configuration.header.canCloseChat"
                    @click="$emit('close')"
                    title="close"
                    class="window-button close-button inline-flex items-center px-1.5 py-0.5 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-900 active:bg-gray-900 focus:outline-none focus:border-gray-900 focus:ring focus:ring-gray-300 disabled:opacity-25 transition chat-header-button"
                >
                    &times;
                </button>
            </div>
        </div>
        <div v-else class="chat-minimalized">
            <dymek @click="$emit('maximalize')" class="cursor-pointer mx-2 p-0.5" />
            <!-- <button class="window-button maximalize-button inline-flex items-center px-2 py-1 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 active:bg-gray-900 focus:outline-none focus:border-gray-900 focus:ring focus:ring-gray-300 disabled:opacity-25 transition" @click="$emit('maximalize')">&nwnear;</button> -->
        </div>
        <panel-settings v-if="!minimalized && settingsExpanded && userMeta && userMeta.name"
            :userMeta="userMeta"
            :expanded="settingsExpanded"
            :configuration="configuration"
        />
    </div>
</template>

<script>
import Dymek from '../icons/DymekIcon.vue'
import LogoutIcon from '../icons/LogoutIcon.vue'
import MinimalizeIcon from '../icons/MinimalizeIcon.vue'
import SettingsIcon from '../icons/SettingsIcon.vue'
import PanelSettings from './PanelSettings.vue'
// let Dymek = () => require('./icons/dymek.vue')

export default {
    props: {
        userMeta: {
            type: [Object, Boolean],
            required: false,
            default: null
        },
        minimalized: {
            type: Boolean,
            required: false,
            default: false
        },
        configuration: {
            type: Object,
            required: false,
            default: () => {
                return {
                    header: {
                        showNick: true,
                        canSignOut: true,
                        canCloseChat: false,
                        canMinimalize: true
                    }
                }
            }
        }
    },
    emits: ['signout', 'minimalize', 'close', 'maximalize'],
    components: {
        Dymek, PanelSettings,
        SettingsIcon,
        MinimalizeIcon,
        LogoutIcon
    },
    watch: {
        userMeta: {
            handler (data) {
                if (!data || !data.mainKeys) {
                    this.settingsExpanded = false
                }
            },
            deep: true
        }
    },
    data () {
        return {
            settingsExpanded: false
        }
    },
    methods: {
        prepUserName (name) {
            return name.length > 20 ? name.substring(0,20) + '...' : name
        }
    }
}
</script>

<style lang="scss">
.signout-button {
    font-size: 0.8em;
    // padding: 0.25em 0.5em;
    // background-color: #282c34; 
    border: none;
    color: white;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    cursor: pointer;
}
.window-button {
    font-size: 0.8em;
    color: white;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    cursor: pointer;
}

.user-bio {
  display: flex;
  align-items: center;
  min-width: fit-content;
}

.user-name {
    font-weight: 600;
}
  
.header, .chat-open, .chat-minimalized {
	// color: white;
	display: flex;
	align-items: center;
	justify-content: space-between;
	z-index: 201;
	// padding: 0.25em;
	box-sizing: border-box;
    width: 100%;
}
.header {
    position: relative;
}

.fill-white {
    fill: white;
}
</style>