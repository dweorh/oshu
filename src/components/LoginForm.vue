<template>
    <div class="login-form static">
        <input class="my-2 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm mt-1 block w-full"
            v-model="user.name" minlength="3" maxlength="16" :placeholder="$t('UI.chat.username')"/>
        <input
            class="my-1 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm mt-1 block w-full"
            v-model="user.credentials" type="text" :placeholder="$t('UI.chat.credentials')"/>
        <input
            class="my-1 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm mt-1 block w-full"
            v-model="user.operator_pub_key" type="text" :placeholder="$t('UI.chat.operators_pub')"/>
        <!-- <input
            class="my-1 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm mt-1 block w-full"
            v-model="user.main_keys" type="text" :placeholder="$t('UI.chat.operators_enc_keys')"/> -->
        <!-- <input
            class="my-1 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm mt-1 block w-full"
            name="password" v-model="user.password" type="password" placeholder="Password"/> -->
        <div v-if="loginError" class="message-error">{{loginError}}</div>
        <div class="absolute bottom-1 content-center">
            <button
                class="mx-2 my-1 inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 active:bg-gray-900 focus:outline-none focus:border-gray-900 focus:ring focus:ring-gray-300 disabled:opacity-25 transition"
                @click="$emit('login', user)">{{$t('UI.chat.login')}}</button>
            <button
                class="mx-2 my-1 inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 active:bg-gray-900 focus:outline-none focus:border-gray-900 focus:ring focus:ring-gray-300 disabled:opacity-25 transition"
                @click="$emit('sign-up', user)">{{$t('UI.chat.sign_up')}}</button>
            <button
                class="mx-2 my-1 inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 active:bg-gray-900 focus:outline-none focus:border-gray-900 focus:ring focus:ring-gray-300 disabled:opacity-25 transition"
                @click="$emit('sign-up-operator', user)">{{$t('UI.chat.sign_up_operator')}}</button>
        </div>
    </div>
</template>

<script>
// import { reactive } from 'vue'
export default {
    props: {
        loginError: {
            type: String,
            default: ''
        }
    },
    emits: ['login', 'sign-up', 'sign-up-operator'],
    data () {
        return {
            user: {
                name: '',
                credentials: '',
                operator_pub_key: ''
                // main_keys: ''
            }
        }
    }
}
</script>

<style>

.login-form > input, .login-form > button, .login-form > select, .login-form > textarea {
	font-family: inherit;
	font-size: inherit;
	-webkit-padding: 0.4em 0;
	padding: 0.4em;
	box-sizing: border-box;
	border: 1px solid #ccc;
}

.login-form > input {
	line-height: 1.2;
	width: 100%;
	font-size: 1.125em;
	outline: none;
	padding: 0.2em 0.2em;
}
</style>