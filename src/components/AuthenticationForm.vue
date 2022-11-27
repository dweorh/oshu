<template>
    <div>
        <div v-if="!sent">{{$t('UI.chat.authentication.form_title')}}</div>
        <div v-if="error">{{$t('UI.chat.errors.something_went_wrong')}}<br />{{$t('UI.chat.registration.no_authority')}}</div>
        <div v-if="!error && !sent">
            <div class="mx-1 mt-2">
                <div class="flex mb-1">
                    <input 
                        type="password" 
                        class="border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm mt-1 block w-full placeholder-text-sm placeholder-italic px-1 py-1"
                        :placeholder="$t('UI.chat.registration.password')"
                        :title="$t('UI.chat.registration.password')"
                        v-model="form.password"
                        tabindex="3"
                    />
                </div>
                <div class="flex w-100 justify-end mx-1 mt-1">
                    <button
                        type="button"
                        :disabled="!valid"
                        class="text-base border-gray-500 focus:border-indigo-400 rounded-md shadow-sm px-2 py-1 hover:bg-opacity-40 focus:bg-opacity-40"
                        :class="{'hover:bg-green-500 focus:bg-green-500': valid, 'hover:bg-red-500 focus:bg-red-500': !valid}"
                        :title="$t('UI.chat.authentication.submit')"
                        @click="send"
                    >
                        {{$t('UI.chat.authentication.submit')}}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
/* global SEA */
export default {
    props: {
        gun: {
            type: [Object, Boolean],
            required: false,
            default: null
        },
        configuration: {
            type: Object,
            required: false,
            default: () => {
                return {}
            }
        }
    },
    emits: ['login'],
    data () {
        return {
            error: false,
            sent: false,
            form: {
                password: '',
            },
            encrypted: false
        }
    },
    computed: {
        valid () {
            return this.form.password.length >=8
        }
    },
    created () {
        this.gun.get('~' + this.configuration.loginAccountPub).get('login').once(async (data) => {
            if (!data) {
                this.error = true
                return
            }
            this.encrypted = data
        })
    },
    methods: {
        async send () {
            if (this.valid) {
                const decrypted = await SEA.decrypt(this.encrypted, this.form.password)
                if (decrypted) {
                    this.$emit('login', decrypted)
                } else {
                    this.error = true
                }
            }
        }
    }
}
</script>

<style>
.chat-window.loggedout.registration {
    max-height: 19em;
}
</style>