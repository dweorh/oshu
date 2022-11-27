<template>
    <div class="main h5 my-1 text-sm truncate text-left">
        {{$t('UI.chat.registration.admin_title')}}
        <div v-if="tooltip" class="copy-to-clipboard-tooltip ease-in-out">{{tooltip}}</div>
        <div v-for="(entry, index) in recentRegistrations" :key="index"
            class="hover:bg-gray-300 cursor-pointer"
            :class="{'bg-gray-200 border-2': index === selected}"
            :title="entry.personalData.email"
        >
            <span @click="selectRegistration(index)">{{entry.personalData.name}}</span>
            <div v-if="index === selected" class="flex flex-col ml-1" @click="() => { copyPersonalDataToClipboard(entry); showTooltip(); }">
                <div>{{entry.personalData.phone}}</div>
                <div>{{entry.personalData.email}}</div>
                <div>{{userLoginUrl(entry.loginAccount)}}</div>
            </div>
        </div>
        <div v-for="(entry, index) in pendingRegistrations" :key="index"
            class="hover:bg-gray-300 cursor-pointer italic"
            :class="{'bg-gray-200 border-2': index === selected}"
            @click="selectRegistration(index)"
            :title="entry.data.form.email"
        >
            {{entry.data.form.name}}
            <div v-if="index === selected" class="flex flex-col ml-1">
                <div>{{entry.data.form.phone}}</div>
                <div>{{entry.data.form.email}}</div>
            </div>
            <div v-if="index === selected" class="flex flex-row ml-1 mt-2 justify-around">
                <button
                    @click="$emit('register', index)"
                    :title="$t('UI.chat.registration.register')"
                    class="border-2 border-green-500 rounded-md shadow-sm px-2 py-1 hover:bg-opacity-40 focus:bg-opacity-40 hover:bg-green-500 focus:bg-green-500"
                >
                    {{$t('UI.chat.registration.register')}}
                </button>
                <button
                    @click="$emit('reject', index)"
                    :title="$t('UI.chat.registration.reject')"
                    class="border-2 border-red-500 rounded-md shadow-sm px-2 py-1 hover:bg-opacity-40 focus:bg-opacity-40 hover:bg-red-500 focus:bg-red-500"
                >
                    {{$t('UI.chat.registration.reject')}}
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import ChatHelpersMixin from './mixins/chat-helpers.mixin.js'
export default {
    props: {
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
        configuration: {
            type: Object,
            required: false,
            default: () => {}
        }
    },
    mixins: [ChatHelpersMixin],
    data () {
        return {
            selected: false,
            tooltip: ''
        }
    },
    emits: ['register', 'reject'],
    methods: {
        showTooltip (message) {
            this.tooltip = message || this.$t('UI.chat.copied_to_clipboard')
            setTimeout(() => this.tooltip = '', 850)
        },
        userLoginUrl(login) {
            return this.configuration.invitationDomain + '/login/' + login.pub
        },
        selectRegistration(index) {
            if (this.selected === index) {
                this.selected = false
                return
            }
            this.selected = index
        },
        copyPersonalDataToClipboard(data) {
            const message = data.personalData.name + "\n" + data.personalData.email + "\n" + data.personalData.phone + "\n" + this.userLoginUrl(data.loginAccount)

            this.copyToClipboard(message)
        }
    }

}
</script>

<style lang="scss" scoped>

</style>