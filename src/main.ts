import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import './style.css'
import App from './App.vue'
import router from './router'
import VueApexCharts from 'vue3-apexcharts'

import ServiceGenerate from './utils/request'
import { setHttpClientFactory } from './repositories/base'
setHttpClientFactory(() => ServiceGenerate())

import { actions } from './store'

const app = createApp(App)

// Initialize store
actions.initialize()

app.use(ElementPlus)
app.use(router)
app.use(VueApexCharts)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')
