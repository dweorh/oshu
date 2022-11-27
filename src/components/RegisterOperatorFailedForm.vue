<template>
<div class="login-form">
    <div class="text-2xl mx-2 my-4">{{$t('UI.chat.errors.something_went_wrong')}}</div>
    <button
            class="login my-1 inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 active:bg-gray-900 focus:outline-none focus:border-gray-900 focus:ring focus:ring-gray-300 disabled:opacity-25 transition"
            @click="$emit('sign-up-operator', {})">{{$t('UI.chat.create_account')}}</button>
</div>
</template>

<script>
    export default {
        emits: ['sign-up-operator'],
    }
</script>

<style lang="scss" scoped>
input, button, select, textarea {
	font-family: inherit;
	font-size: inherit;
	-webkit-padding: 0.4em 0;
	padding: 0.4em;
	box-sizing: border-box;
	border: 1px solid #ccc;
}
</style>