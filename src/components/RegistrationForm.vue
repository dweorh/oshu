<template>
    <div>
        <div v-if="!sent">{{$t('UI.chat.registration.form_title')}}</div>
        <div v-if="error">{{$t('UI.chat.errors.something_went_wrong')}}<br />{{$t('UI.chat.registration.no_authority')}}</div>
        <div v-if="!error && !sent">
            <form class="mx-1 mt-2">
                <div class="flex mb-1">
                    <input 
                        type="text" 
                        class="border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm mt-1 block w-full placeholder-text-sm placeholder-italic px-1 py-1"
                        :placeholder="$t('UI.chat.registration.name')"
                        :title="$t('UI.chat.registration.name')"
                        v-model="form.name"
                        tabindex="1"
                        ref="regNameField"
                    />
                </div>
                <div class="flex mb-1">
                    <input 
                        type="text" 
                        class="border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm mt-1 block w-full placeholder-text-sm placeholder-italic px-1 py-1"
                        :placeholder="$t('UI.chat.registration.phone')"
                        :title="$t('UI.chat.registration.phone')"
                        v-model="form.phone"
                        tabindex="2"
                    />
                </div>
                <div class="flex mb-1">
                    <input 
                        type="text" 
                        class="border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm mt-1 block w-full placeholder-text-sm placeholder-italic px-1 py-1"
                        :placeholder="$t('UI.chat.registration.email')"
                        :title="$t('UI.chat.registration.email')"
                        v-model="form.email"
                        tabindex="3"
                    />
                </div>
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
                <div class="flex mb-1">
                    <input 
                        type="password" 
                        class="border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm mt-1 block w-full placeholder-text-sm placeholder-italic px-1 py-1"
                        :placeholder="$t('UI.chat.registration.password_confirm')"
                        :title="$t('UI.chat.registration.password_confirm')"
                        v-model="form.password_confirmation"
                        tabindex="3"
                    />
                </div>
                <div class="flex w-100 justify-end mx-1 mt-1">
                    <button
                        type="button"
                        :disabled="!valid"
                        class="text-base border-gray-500 focus:border-indigo-400 rounded-md shadow-sm px-2 py-1 hover:bg-opacity-40 focus:bg-opacity-40"
                        :class="{'hover:bg-green-500 focus:bg-green-500': valid, 'hover:bg-red-500 focus:bg-red-500': !valid}"
                        :title="$t('UI.chat.registration.submit')"
                        @click="send"
                    >
                        {{$t('UI.chat.registration.submit')}}
                    </button>
                </div>
            </form>
        </div>
        <div v-if="!error && sent">{{$t('UI.chat.thank_you')}}<br />{{$t('UI.chat.registration.form_sent')}}</div>
    </div>
</template>

<script>
import { OshuCryptoFactory } from '@dweorh/oshu-crypto'
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
    data () {
        return {
            authority: false,
            error: false,
            sent: false,
            form: {
                name: '',
                email: '',
                phone: '',
                password: '',
                password_confirmation: ''
            },
            public: {
                cert: false,
                enc: false
            },
            user: false
        }
    },
    computed: {
        valid () {
            return this.form.name.length > 5 && this.form.email.length > 5 && this.form.phone.length > 5 && this.form.password.length >=8 && this.form.password == this.form.password_confirmation
        }
    },
    created () {
        this.gun.get('~' + this.configuration.registrationAuthority).once(async (data) => {
            if (!data) {
                this.error = true
                return
            }
            this.user = await SEA.pair()
            this.gun.user().auth(this.user, ack => {
                if (ack.err) {
                    this.error = true
                    return
                }
                this.$refs.regNameField.focus()
                this.gun.get('~' + this.configuration.registrationAuthority).get('public-certs').once(certs => {
                    this.public.cert = certs.registration
                })
                this.gun.get('~' + this.configuration.registrationAuthority).get('public-enc').once(enc => {
                    this.public.enc = enc.registration
                })
            })
            // console.log('[registration authority]', data)
        })
    },
    methods: {
        async send () {
            if (this.valid) {
                this.sent = true
                let oshuCrypto = await OshuCryptoFactory.create(true)
                await oshuCrypto.importKey(this.public.enc)
                let passphrase = this.user.epub
                let form = this.form
                delete form.password_confirmation
                let data = {
                    user: this.user,
                    form: form
                }
                let message = {
                    data: await SEA.encrypt(data, passphrase),
                    passphrase: await oshuCrypto.encrypt(passphrase, 'ascii')
                }
                this.gun.get('~' + this.configuration.registrationAuthority).get('public-registration')
                    .get(this.user.pub)
                    .put(message, (ack) => console.log('[put]', ack), { opt: { cert: this.public.cert } })
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