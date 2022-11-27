<template>
    <div class="chat-form" ref="chatForm"> 
        <div v-if="priv_to" class="priv-to bg-gray-300 text-gray-700">{{$t('UI.chat.priv_to')}}: @{{priv_to.alias || priv_to.who}}</div>
        <div v-if="reply_to" class="reply-to bg-gray-300 text-gray-700">@{{reply_to.who}}: {{reply_to.document.msg}}</div>
        <div>
            <div 
                class="mt-4 flex flex-row flex-wrap"
                :class="{'animate-pulse': sending || loadingFiles !== 0}"
                v-if="filelist.length"
                v-cloak
            >
                <div class="text-sm p-1" v-for="(file, idx) in filelist" :key="idx">
                    <!-- <div :style="{'background-image': 'url(' + file.base64v2 + ')'}" class="uploaded-thumbnail inline-block" :title="file.name" /> -->
                    <div class="relative w-24 h-24">
                        <div v-if="isFileImage(file)" :style="{'background-image': 'url(' + file.base64 + ')'}" class="w-24 h-24 uploaded-thumbnail inline-block" :title="file.name" />
                        <file-icon v-if="!isFileImage(file)" :file="file" class="w-24 h-24"/>
                        <!-- <div class="inline-block" v-else>{{file.name}}</div> -->
                        <remove-icon
                            v-if="!sending"
                            class="absolute top-1 right-1 w-h h-4 p-0.5 bg-gray-300"
                            @click="remove(filelist.indexOf(file))"
                        />
                        <!-- <button class="absolute top-1 right-1" type="button" @click="remove(filelist.indexOf(file))" title="Remove file">remove</button> -->
                    </div>
                </div>
            </div>
            <form @submit.prevent="sendMessage" class="rounded-bottom-md" :class="{'animate-pulse': sending || loadingFiles !== 0}">
                <input
                    type="file"
                    multiple
                    name="fields[assetsFieldHandle][]"
                    id="assetsFieldHandle" 
                    class="w-px h-px opacity-0 overflow-hidden absolute"
                    @change="onChange"
                    ref="file"
                    accept="*/*"
                    :disabled="!chatRoom || sending || loadingFiles !== 0"
                />
            
                <label
                    for="assetsFieldHandle"
                >
                    <upload-icon
                        class="h-8 px-2 upload-file-icon"
                        @dragover="dragover"
                        @dragleave="dragleave"
                        @drop="drop"
                        tabindex="2"
                    />
                </label>
            
                <input 
                    type="text" 
                    class="border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm mt-1 block w-full placeholder-text-sm placeholder-italic"
                    :placeholder="$t('UI.chat.type_message_or_drop_file')"
                    :title="$t('UI.chat.type_message_or_drop_file')"
                    v-model="newMessage"
                    :readonly="!chatRoom || sending || loadingFiles !== 0"
                    ref="typeMessageBox"
                    tabindex="1"
                    @dragover="dragover"
                    @dragleave="dragleave"
                    @drop="drop"
                    />
                <button
                    type="submit"
                    tabindex="3"
                    :disabled="(!newMessage && filelist.length === 0) || !chatRoom || sending || loadingFiles !== 0"
                    :title="$t('UI.chat.send_message')"
                >
                    <samolocik class="img-send-message" />
                </button>
            </form>
        </div>
    </div>
</template>

<script>
// import { ref } from 'vue'
import '../libs/gun/sea';
import ChatHelpers from './mixins/chat-helpers.mixin.js'
import Samolocik from '../icons/SamolocikIcon.vue'
import UploadIcon from '../icons/UploadIcon.vue'
import RemoveIcon from '../icons/RemoveIcon.vue';
import FileIcon from '../icons/FileIcon.vue';
/* global SEA */
export default {
    props: {
        userMeta: {
            type: [Object, Boolean],
            required: false,
            default: null
        },
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
        configuration: {
            type: Object,
            required: false,
            default: () => {
                return {
                    // if storageStoreUrl is not provided sending files will not work
                }
            }
        }
    },
    mixins: [ ChatHelpers ],
    components: {
        Samolocik, UploadIcon,
        RemoveIcon, FileIcon
    },
    // setup () {
    //     return { newMessage: ref('') }
    // },
    data () {
        return {
            sending: false,
            loadingFiles: 0,
            newMessage: '',
            filelist: [], // Store our uploaded files
            fileStats: {} // some stats about processing files
        }
    },
    emits: ['message-sent'],
    created () {
        this.$root.$on('typeMessageFocus', () => {
            if (this.$refs.typeMessageBox) {
                this.$nextTick(() => this.$refs.typeMessageBox.focus())
            }
        })
    },
    mounted () {
        this.$nextTick(() => this.$refs.typeMessageBox.focus())
    },
    methods: {
        toast (title, message, type) {
            this.$root.$emit('toast', { title, message, type })
        },
        async sendMessage() {
            this.sending = true
            const to = this.priv_to ? { pub: this.priv_to.to, epub: this.priv_to.epub } : false
            const reply_to = this.reply_to ? this.reply_to['#'] : false
            const msg = this.priv_to ? await SEA.encrypt(this.newMessage, await SEA.secret(this.priv_to.epub, this.userMeta.credentials)) : this.newMessage
            const files = {}

            this.filelist.forEach(file => {
                files[file.uuid] = {
                    chunks: file.encrypted.chunksOrder,
                    enc: {
                        iv: file.encrypted.iv,
                        key: file.encrypted.key
                    },
                    name: file.name,
                    size: file.size,
                    type: file.type
                }
            })

            const secret = await SEA.encrypt({ 
                msg,
                to,
                reply_to,
                sender: {
                    epub: this.userMeta?.credentials.epub,
                    pub: this.userMeta?.credentials.pub,
                    alias: this.userMeta.name
                },
                files: JSON.stringify(files)
                // uuid: this.uuidv4()
            }, this.chatRoomKeys);
            const message = this.gun.user().get('all').set({ document: secret });
            const index = new Date().toISOString();

            this.sendFiles(this.filelist)
                .then(() => {
                    this.chatRoom
                        .get(index).put(message, null, { opt: { cert: this.chatRoomCert } });
        
                    this.newMessage = ''
                    this.sending = false
                    this.loadingFiles = 0

                    for (let i in this.filelist) {
                        delete this.filelist[i]
                    }
                    this.filelist = []

                    this.$emit('message-sent', message)
                })
                .catch(() => {
                    this.toast(
                        this.$t('UI.chat.errors.title'),
                        this.$t('UI.chat.errors.something_went_wrong'),
                        'error'
                    )
                    this.sending = false
                })
        },
        sendFiles(files) {
            const req = []
            if (files.length === 0 || !this.configuration.storageStoreUrl) {
                req.push(new Promise((resolve) => resolve()))
            } else {
                files.forEach(file => {
                    const chunks = {}
                    for (let key in file.encrypted.chunks) {
                        chunks[key] = this.ab2str(file.encrypted.chunks[key])
                    }
                    const stats = this.fileStats[file.uuid]
                    this.$emit('file-sent', {
                        size: Math.round(file.size / 1024),
                        type: file.type,
                        batch_size: files.length,
                        times: {
                            loading: stats.load - stats.start,
                            chop: stats.chop - stats.load,
                            encrypt: stats.encrypt - stats.chop
                        }
                    })
                    req.push(
                        fetch(this.configuration.storageStoreUrl,
                        {
                            method: 'POST',
                            // mode: 'no-cors',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ chunks: chunks })
                        })
                    )
                })
            }
            return Promise.all(req)
        },
        onChange() {
            const files = [...this.$refs.file.files];
            const maxFileSize = 6 * 1024 * 1024
            // console.log('[files]', ...this.$refs.file.files)
            for (let i in this.filelist) {
                delete this.filelist[i]
            }

            this.filelist = []
            
            files.forEach(file => {
                const reader = new FileReader()
                const uuid = this.uuidv4()
                this.loadingFiles++
                this.fileStats[uuid] = {
                    start: Date.now(),
                    load: Date.now(),
                    chop: Date.now(),
                    encrypt: Date.now()
                }
                reader.onload = async (event) => {
                    this.fileStats[uuid].load = Date.now()
                    if (file.size > maxFileSize) {
                        this.toast(
                            this.$t('UI.chat.errors.title'),
                            this.$t('UI.chat.errors.file_too_big', {size: Math.round( maxFileSize / 1024 / 1024 )}),
                            'error'
                        )
                        return false
                    }
                    
                    if (!this.configuration.storageStoreUrl){
                        this.toast(
                            this.$t('UI.chat.errors.title'),
                            this.$t('UI.chat.errors.file_no_storage'),
                            'error'
                        )
                        return false
                    }
                    
                    const data = {
                        uuid: uuid,
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        base64: event.target.result
                    }
                    const chunks = this.chopFile(data)
                    this.fileStats[uuid].chop = Date.now()

                    data.encrypted = await this.encryptChunks(chunks)
                    this.fileStats[uuid].encrypt = Date.now()

                    this.filelist.push(data)
                    this.loadingFiles--
                }
                reader.readAsDataURL(file)
            })
        },
        chopFile(file) {
            const chunkSize = 50 * 1024
            const chunks = []
            let data = file.base64.replace('data:' + file.type + ';base64,', '')
            // data = atob(data)
            let piece = ''
            do {
                piece = data.substr( chunks.length * chunkSize, chunkSize)
                chunks.push(piece)
            } while (piece.length == chunkSize)
            return chunks
        },
        async encryptChunks(chunks) {
            const enc = {}
            const chunksOrder = []
            const key = await window.crypto.subtle.generateKey(
                {
                    name: "AES-GCM",
                    length: 256, //can be  128, 192, or 256
                },
                true, //whether the key is extractable (i.e. can be used in exportKey)
                ["encrypt", "decrypt"] //can "encrypt", "decrypt", "wrapKey", or "unwrapKey"
            )
            const keyExported = await window.crypto.subtle.exportKey(
                "jwk", //can be "jwk" or "raw"
                key //extractable must be true
            )
            const iv = window.crypto.getRandomValues(new Uint8Array(12))
            // chunks.forEach(async chunk => {
            for( let i in chunks) {
                let chunk = chunks[i]
                let encrypted = await window.crypto.subtle.encrypt({
                        name: "AES-GCM",

                        //Don't re-use initialization vectors!
                        //Always generate a new iv every time your encrypt!
                        //Recommended to use 12 bytes length
                        iv: iv,

                        //Additional authentication data (optional)
                        // additionalData: ArrayBuffer,

                        //Tag length (optional)
                        tagLength: 128, //can be 32, 64, 96, 104, 112, 120 or 128 (default)
                    },
                    key, //from generateKey or importKey
                    this.str2ab(chunk) //ArrayBuffer of data you want to encrypt
                )
                // console.log('[encrypted]', encrypted)
                const uuid = this.uuidv4()
                chunksOrder.push(uuid)
                enc[uuid] = encrypted
            }
            const data = {
                key: keyExported,
                iv: iv.toString(),
                chunks: enc,
                chunksOrder
            }
            // console.log('[encrypted]', data, this.str2ab(chunks[0]))
            return data
        },
        str2ab(str) {
            return Uint8Array.from(atob(str), c => c.charCodeAt(0))
        },
        ab2str(buf) {
            return buf instanceof ArrayBuffer 
                ? btoa(String.fromCharCode.apply(null, new Uint8Array(buf)))
                : btoa(String.fromCharCode.apply(null, buf))
        },
        remove(i) {
            this.filelist.splice(i, 1);
        },
        dragover(event) {
            event.preventDefault();
            // Add some visual fluff to show the user can drop its files
            if (!event.currentTarget.classList.contains('bg-green-300')) {
                event.currentTarget.classList.remove('bg-gray-100');
                event.currentTarget.classList.add('bg-green-300');
            }
        },
        dragleave(event) {
            // Clean up
            // event.currentTarget.classList.add('bg-gray-100');
            event.currentTarget.classList.remove('bg-green-300');
        },
        drop(event) {
            event.preventDefault();
            // console.log('[event]', event)
            this.$refs.file.files = event.dataTransfer.files;
            this.onChange(); // Trigger the onChange event manually
            // Clean up
            // event.currentTarget.classList.add('bg-gray-100');
            event.currentTarget.classList.remove('bg-green-300');
        },
        isFileImage(file) {
            return file.type.match(/^image\//)
        }
    }
}
</script>

<style scoped>
.placeholder-text-sm::placeholder {
    font-size: 0.875rem;
}
.placeholder-italic::placeholder {
    font-style: italic;
}
/* overwrite the main style */
.chat-window label {
    margin: 0;
}

form {
    height: 2em;
    width: 100%;
    /* max-width: 728px; */
    display: flex;
    font-size: 1em;
}

input {
    line-height: 1.5;
    width: 100%;
    font-size: 1em;
    /* background: rgb(58, 58, 58); */
    /* color: white; */
    outline: none;
    /* border: none; */
    padding: 0 10px;
    margin: 4px;
    /* border-radius: 0 0 0 0.5rem; */
}

button {
    /* border-radius: 0 0 0.5em 0; */
    border: none;
    /* color: white; */
    padding: 0.25em 0.5em;
    /* text-align: center;
    text-decoration: none; */
    display: inline-block;
    cursor: pointer;
    margin: 0;
}
.img-send-message {
    width: 2em;
    height: auto;
}

.img-send-message:hover {
    fill: green;
}

button:disabled > .img-send-message:hover {
    fill: red;
}

.priv-to, .reply-to {
    /* margin-right: 0.25rem; */
    line-height: 1.5;
    padding: 0.25em;
    text-align: left;
    /* color: #ccc; */
    font-size: 0.75em;
    font-style: italic;
    /* background-color: rgb(40, 37, 53); */
}
.uploaded-thumbnail {
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
}

.upload-file-icon {
    max-width: 3rem;
}
</style>