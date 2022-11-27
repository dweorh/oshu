<template>
    <div
        :class="{'expanded': expanded}"
        class="panel-right bg-white border-l-2 border-gray-300 p-1"
    >
        <button
            @click="expanded = !expanded"
            :title="expanded ? $t('UI.chat.colapse') : $t('UI.chat.expand')"
            class="panel-button inline-flex items-center px-2 py-1 bg-gray-500 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 active:bg-gray-900 focus:outline-none focus:border-gray-900 focus:ring focus:ring-gray-300 disabled:opacity-25 transition toggle-panel-button"
        >
            <span v-if="expanded">&gg;</span><span v-else>&ll;</span>
        </button>
        <div class="main">
            <div v-for="(user, idx) in userList" :key="idx" class="text-left user hover:bg-gray-300 flex items-center">
                <avatar-icon
                    @click="$emit('user-click', { user, idx })"
                    :name="displayName(user)"
                    :title="displayName(user)"
                    class="cursor-pointer"
                    alt="avatar"
                    />
                <div class="truncate user-alias cursor-pointer self-center">{{ displayName(user) }}</div>
            </div>
        </div>
    </div>
</template>

<script>
/* global SEA */
// import { reactive } from 'vue'
import AvatarIcon from "../icons/AvatarIcon.vue"
import ChatHelpers from './mixins/chat-helpers.mixin.js'
export default {
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
        }
    },
    components: { AvatarIcon },
    mixins: [ChatHelpers],
    created () {
        this.operator
            .get('private-users')
            .on(data => {
                if (!data._) return
                let nodes = data._['>']
                Object.keys(nodes).forEach(_key => {
                    let ts = nodes[_key]
                    if (this.userList[_key] && this.userList[_key]._ts <= ts) return
                    this.operator
                        .get('private-users')
                        .get(_key).once(async n_data => {
                            let decrypted = await SEA.decrypt(n_data, this.userMeta.access.keys.users[this.monthTsKey(0, ts)])
                            this.$set(this.userList, _key, { ...decrypted, _ts: ts })
                        })
                })
            })
        // this.operator
        //     .get('private-users')
        //     .map(async (value, key) => {
        //         let decrypted = await SEA.decrypt(value, this.userMeta.access.keys.users[this.monthTsKey()])
        //         this.$set(this.userList, key, decrypted)
        //         return decrypted
        //     })   
    },
    data() {
        return {
            userList: {},
            expanded: false
        }
    },
    methods: {
        displayName(user) {
            return user?.alias || 'Anonymous'
        }
    }
}
</script>

<style lang="scss" scoped>
.panel-right {
    display: flex;
    height: 100%;
    align-items: flex-start;
    flex-direction: column;
}

.panel-right > * {
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
.three-panels .expanded {
    grid-column: 3/6;
}

.user {
    // display: flex;
    // align-items: self-start;
    margin: 0;
    word-wrap: break-word;
}

// .avatar {
//     display: inline-block;
// }

// img {
//     width: 2em;
//     height: 2em;
//     border-radius: 50%;
//     margin: 0.25em 5px;
// }

.user-alias {
    display: none;
}

.truncate {
  width: 4em;
  margin-left: 0.5em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.expanded {
    .user-alias {
        display: inline-block;
        text-align: left;
        // margin-top: auto;
    }
    
    .truncate {
        width: 11em;
    }

    // img {
    //     width: 1.5em;
    //     height: 1.5em;
    //     margin: 2px 5px;
    // }
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