export default {
    data () {
        return {
           showSlot: false
        }
    },
    methods: {
        clicked ($event) {
            this.showSlot = true
            setTimeout(() => this.showSlot = false, 750)
            this.$emit('click', $event)
        }
    }
}