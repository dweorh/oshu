<template>
    <div
        :class="{'expanded': expanded}"
        class="panel-settings text-black bg-white bg-opacity-95 border-gray-300 p-1 flex flex-col items-end"
    >
        <div class="flex">
            <!-- <add-contact-icon class="px-2 relative" @click="addContact">
                <div v-if="makeCallTooltip" class="copy-to-clipboard-tooltip ease-in-out">{{makeCallTooltip}}</div>
            </add-contact-icon> -->
            <make-call v-if="configuration.header.canMakeCalls" class="px-2 relative" @click="makeCall">
                <div v-if="makeCallTooltip" class="copy-to-clipboard-tooltip ease-in-out">{{makeCallTooltip}}</div>
            </make-call>
            <!-- <add-contact-icon class="px-2 relative" @click="addContact">
                <div v-if="addContactTooltip" class="copy-to-clipboard-tooltip ease-in-out">{{addContactTooltip}}</div>
            </add-contact-icon> -->
            <!-- <export-contacts-icon class="px-2" />
            <import-contacts-icon class="px-2" /> -->
            <change-user-icon v-if="configuration.header.canSwitchUser" class="px-2" @click="switchUser"/>
            <copy-id-icon class="px-2 relative"
                @click="() => { copyId(); showTooltip() }"
            >
                <div v-if="tooltip" class="copy-to-clipboard-tooltip ease-in-out">{{tooltip}}</div>
            </copy-id-icon>
            <!-- <span v-if="configuration.header.showOpExport" @click="toggleOpDetails()" class="cursor-pointer">OP </span> -->
            <span v-if="configuration.invitationAdmin" @click="toggleInvitationLink()" class="cursor-pointer">Inv </span>
            <export-credentials-icon class="px-2 relative"
                @click="() => { copyCredentials(); showTooltip() }">
                <div v-if="tooltip" class="copy-to-clipboard-tooltip ease-in-out">{{tooltip}}</div>
            </export-credentials-icon>
        </div>
        <div v-if="forms.userCredentials" class="w-full">
            <input type="text" ref="userCredentials" class="border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm mt-1 px-1 block w-full" v-model="newCredentials" :placeholder="$t('UI.chat.paste_credentials')" />
        </div>
        <div v-if="forms.makeCall" class="w-full">
            <input type="text" ref="calleeId" class="border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm mt-1 px-1 block w-full" v-model="calleeId" :placeholder="$t('UI.chat.paste_contact_id')" />
        </div>
        <div v-if="forms.showOpExport" class="w-full">
            {{opDetails}}
        </div>
        <div v-if="forms.showInvitationLink" class="w-full">
            <div
                class="text-left break-words break-all"
                :title="$t('UI.chat.click_to_copy')"
                @click="() => { copyToClipboard(invitationUrl); showTooltip()}"
            >
                {{$t('UI.chat.registration_link')}}
            </div>
            <div v-if="tooltip" class="copy-to-clipboard-tooltip ease-in-out">{{tooltip}}</div>
        </div>
        <!-- <div v-if="forms.addContact">
            <input type="text" ref="contactId" class="border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm mt-1 px-1 block w-full" v-model="newContact.id" :placeholder="$t('UI.chat.paste_contact_id')" />
        </div> -->
    </div>
</template>

<script>
// import AddContactIcon from '../icons/AddContactIcon.vue'
import ChangeUserIcon from '../icons/ChangeUserIcon.vue'
import CopyIdIcon from '../icons/CopyIdIcon.vue'
// import ExportContactsIcon from '../icons/ExportContactsIcon.vue'
import ExportCredentialsIcon from '../icons/ExportCredentialsIcon.vue'
import MakeCall from '../icons/MakeCall.vue'
// import ImportContactsIcon from '../icons/ImportContactsIcon.vue'

import ChatHelpersMixin from './mixins/chat-helpers.mixin.js'
import CredentialsMixin from './mixins/credentials.mixin.js'
export default {
    components: { 
        ChangeUserIcon,
        CopyIdIcon,
        // AddContactIcon, 
        // ExportContactsIcon,
        ExportCredentialsIcon, 
        MakeCall
        // ImportContactsIcon
    },
    mixins: [ ChatHelpersMixin, CredentialsMixin ],
    props: {
        userMeta: {
            type: [Object, Boolean],
            required: false,
            default: null
        },
        expanded: {
            type: Boolean,
            required: false,
            default: true
        },
        configuration: {
            type: Object,
            required: false,
            default: () => {}
        }
    },
    data () {
        return {
            // addContactTooltip: '',
            makeCallTooltip: '',
            tooltip: '',
            forms: {
                userCredentials: false,
                makeCall: false,
                showOpExport: false,
                showInvitationLink: false
                // addContact: false,
            },
            newCredentials: '',
            calleeId: '',
            opDetails: ''
            // newContact: {
            //     id: '',
            //     alias: ''
            // }
        }
    },
    computed: {
        invitationUrl() {
            return this.configuration.invitationDomain + '/registration/' + this.configuration.invitationId
        }
    },
    watch: {
        // newContact: {
        //     handler (val) {
        //         if (val.id && val.id.length === 87) {
        //             this.$root.$emit('addContact', { ...val })
        //             this.newContact = { id: '', alias: '' }
        //             this.hideForms()
        //             this.addContactTooltip = this.$t('UI.chat.add_contact_invitation_sent')
        //             setTimeout(() => this.addContactTooltip = '', 850)
        //         }
        //     },
        //     deep: true
        // },
        calleeId (val) {
            if (val.length === 87) {
                this.hideForms()
                this.calleeId = ''
                this.$root.$emit('makeCall', val)
                this.makeCallTooltip = this.$t('UI.chat.call_initialized')
                setTimeout(() => this.makeCallTooltip = '', 850)
            }
        },
        async newCredentials (val) {
            if (val) {
                try {
                    const dec = this.importCredentials(val)
                    this.$root.$emit('switchUser', dec)
                    this.newCredentials = ''
                    this.hideForms()
                } catch (error) {
                    console.log('[credentials error]', error)
                }
            }
        }
    },
    methods: {
        showTooltip (message) {
            this.tooltip = message || this.$t('UI.chat.copied_to_clipboard')
            setTimeout(() => this.tooltip = '', 850)
        },
        copyId () {
            // this.copyToClipboard(this.userMeta.credentials.pub)
            this.copyToClipboard(this.userMeta.operatorPubKey)
        },
        hideForms (exceptFor) {
            Object.keys(this.forms).forEach(key => { if (key !== exceptFor) this.forms[key] = false } )
        },
        switchUser () {
            this.hideForms('userCredentials')
            this.forms.userCredentials = !this.forms.userCredentials
            if (this.forms.userCredentials) {
                this.$nextTick(() => this.$refs.userCredentials.focus())
            }
        },
        // addContact () {
        //     this.hideForms('addContact')
        //     this.forms.addContact = !this.forms.addContact
        //     if (this.forms.addContact) {
        //         this.$nextTick(() => this.$refs.contactId.focus())
        //     }
        // },
        makeCall () {
            this.hideForms('makeCall')
            this.forms.makeCall = !this.forms.makeCall
            if (this.forms.makeCall) {
                this.$nextTick(() => this.$refs.calleeId.focus())
            }
        },
        toggleOpDetails () {
            if (this.forms.showOpExport) {
                this.opDetails = ''
                this.forms.showOpExport = false
            } else {
                this.opDetails = {
                    pubKey: this.userMeta.operatorPubKey,
                    keys: this.userMeta.mainKeys
                }
                this.forms.showOpExport = true
            }
        },
        toggleInvitationLink () {
            this.forms.showInvitationLink = !this.forms.showInvitationLink
        }
    }
}
</script>

<style lang="scss" scoped>
.panel-settings {
    position: absolute;
    top: 2em;
    width: 100%;
}
.panel-settings .action-icon {
    display: inline-block;
    height: 1.25em;
}

input {
	line-height: 1.5;
	font-size: 1em;
	outline: none;
}
</style>