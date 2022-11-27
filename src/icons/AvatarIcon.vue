<template>
    <div class="avatar flex justify-items-center justify-center">
        <span class="self-center avatar-alias">{{shortName}}</span>
    </div>
</template>

<script>
export default {
    props: {
        name: {
            type: String,
            required: true
        }
    },
    computed: {
        shortName() {
            const words = this.name.split(' ')
            return (words.length > 1 ? words[0].substring(0,1) + words[1].substring(0,1) : words[0].substring(0,2)).toUpperCase()
        }
    }
}
</script>

<style lang="scss">
.avatar {
    background-color: #037196;
    height: 2em;
    aspect-ratio: 1;
    border-radius: 50%;
}
.avatar-alias {
    font-size: 0.9em;
    color: #d2e997;
}
</style>