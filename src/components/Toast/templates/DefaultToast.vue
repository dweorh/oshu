<template>
    <div :class="'text-' + fontColor + '-' + fontTone + ' p-1 border-1 ' + shape + ' mx-1 my-0.5 ' + bg">
      <!-- <span class="text-xl inline-block mr-5 align-middle">
        <i :class="icon"></i>
      </span> -->
      <span class="inline-block align-middle">
        <b class="title">{{title}}</b> {{message}}
      </span>
    </div>
</template>

<script>
export default {
    props: {
        fontColor: {
            type: String,
            default: 'grey',
            required: false
        },
        fontTone: {
            type: Number,
            default: 600,
            required: false
        },
        shape: {
            type: String,
            default: 'rounded',
            required: false
        },
        bg: {
            type: String,
            default: '',
            required: false
        },
        // icon: {
        //     type: String,
        //     default: '',
        //     required: false
        // },
        title: {
            type: String,
            default: '',
            required: false
        },
        message: {
            type: String,
            default: '',
            required: false
        }
    }
}
</script>

<style lang="scss" scoped>

</style>