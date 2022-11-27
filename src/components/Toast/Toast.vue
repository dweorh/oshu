<template>
<div :class="'z-50 absolute flex flex-col justify-' + positionX + ' w-full overflow-hidden max-h-48'">
    <transition-group name="fade" tag="div" mode="in-out">
        <component 
            v-for="toast in filteredToasts" 
            :key="toast.id"
            :is="types[toast.type].component"
            v-bind="types[toast.type].styles"
            :title="toast.title"
            :message="toast.message"
        />
    </transition-group>
</div>
</template>

<script>
import DefaultToast from './templates/DefaultToast.vue'

export default {
    components: { DefaultToast },
    props: {
        positionX: {
            type: String,
            default: "center",
            required: false
        }
    },
    data () {
        return {
            toasts: [],
            types: {
                default: {
                    component: DefaultToast,
                    styles: {
                        fontColor: 'gray',
                        fontTone: 600,
                        shape: 'rounded',
                        bg: 'bg-gray-100 bg-opacity-90',
                        icon: ''
                    }
                },
                success: {
                    component: DefaultToast,
                    styles: {
                        fontColor: 'gray',
                        fontTone: 600,
                        shape: 'rounded',
                        bg: 'bg-green-100 bg-opacity-90',
                        icon: ''
                    }
                },
                warning: {
                    component: DefaultToast,
                    styles: {
                        fontColor: 'gray',
                        fontTone: 600,
                        shape: 'rounded',
                        bg: 'bg-yellow-100 bg-opacity-90',
                        icon: ''
                    }
                },
                error: {
                    component: DefaultToast,
                    styles: {
                        fontColor: 'gray',
                        fontTone: 600,
                        shape: 'rounded',
                        bg: 'bg-red-100 bg-opacity-90',
                        icon: ''
                    }
                }
            }
        }
    },
    computed: {
        filteredToasts () {
            return this.toasts.slice(0, 4)
        }
    },
    created () {
        this.$root.$on('toast', data => this.createToast(data))
    },
    methods: {
        createToast (data) {
            const toast = { id: Math.random(), type: 'default', ...data }
            this.toasts.push(toast)
            setTimeout(() => this.removeToast(toast), 3500)
        },
        removeToast(toast) {
            const idx = this.toasts.findIndex( el => el.id === toast.id)
            if (idx > -1) {
                this.toasts.splice(idx, 1)
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.fade-enter-active, .fade-leave-active {
  transition: all 1s;
}
.fade-enter, .fade-leave-to /* .list-leave-active below version 2.1.8 */ {
  opacity: 0;
  transform: translateY(30px);
}
</style>