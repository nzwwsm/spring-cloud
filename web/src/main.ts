import '@unocss/reset/tailwind.css'//真实存在的
import 'virtual:uno.css'//virtual 代表虚拟的

import "element-plus/dist/index.css"

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import './assets/framework/font-awesome/css/font-awesome.min.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.mount('#app')
