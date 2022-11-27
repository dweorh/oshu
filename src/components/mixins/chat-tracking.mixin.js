const mixin = {
    emit: ['tracking'],
    data () {
        return {
            trackId: false
        }
    },
    created () {
        this.trackId = this.uuidv4()
    },
    /* eslint-disable vue/no-deprecated-destroyed-lifecycle */
    beforeDestroy () {
        this.track('destroy')
    },
    methods: {
        track (name, details = {}) {
            let data = {
                trackId: this.trackId,
                name,
                details,
                time: Date.now()
            }
            this.$emit('tracking', data)
        }
    }
}

export default mixin