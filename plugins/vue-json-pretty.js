// plugins/vue-json-pretty.js
import { defineNuxtPlugin } from '#app'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css' // Import the default styles

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('VueJsonPretty', VueJsonPretty)
})
