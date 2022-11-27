<template>
<div class="action-icon cursor-pointer relative" @click="$emit('click', $event)" :title="file.name">
   <svg
      viewBox="0 0 50.292 64.854676"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:svg="http://www.w3.org/2000/svg">
      <!-- This work is licensed under a <a rel="license" href="https://creativecommons.org/licenses/by-nc/4.0/legalcode">Creative Commons Attribution-NonCommercial 4.0 International Public License</a>. -->
   <path
      d="M 0,32.427335 V 0 h 15.79033 15.79034 v 6.180663 6.180672 h 9.35567 9.35566 v 26.24667 26.24667 H 25.146 0 Z m 48.9585,30.96684 -0.0212,-0.0635 V 38.523335 13.716005 H 39.58163 30.22596 V 7.535335 1.354667 H 15.79033 1.35466 v 31.072818 31.07282 l 23.81251,-0.0213 23.8125,-0.0213 z"/>
   </svg>
   <div v-if="filename" class="truncate text-xs">{{file.name}}</div>
   <div class="absolute top-0 left-0 flex w-full h-full items-center content-center justify-center">
      <span :class="variants[variant]">{{type}}</span>
   </div>
</div>
</template>

<script>
export default {
   props: {
      file: {
         type: Object,
         required: true
      },
      variant: {
         type: String,
         required: false,
         default: 'standard',
         validator: function (value) {
            return ['standard', 'small'].indexOf(value) !== -1
         }
      },
      filename: {
         type: Boolean,
         required: false,
         default: false
      }
   },
   data () {
      return {
         variants: {
            standard: 'text-lg font-semibold',
            small: 'text-sm font-semibold'
         }
      }
   },
   computed: {
      type () {
         let res = /.*?\.([a-zA-Z0-9]+)$/.exec(this.file.name)
         res = res || /.*?\/([a-zA-Z0-9]+)$/.exec(this.file.type)
         return res ? res[1] : this.file.type
      }
   }
}
</script>

<style lang="scss" scoped>

</style>