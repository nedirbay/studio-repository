import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import './style.css'
import App from './App.vue'
import router from './router'
import VueApexCharts from 'vue3-apexcharts'

import ServiceGenerate from './utils/request'
import { setHttpClientFactory as setRepoFactory } from './repositories/base'
import { setHttpClientFactory as setHttpFactory } from './utils/http'
setRepoFactory(() => ServiceGenerate())
setHttpFactory(() => ServiceGenerate())

const app = createApp(App)

app.use(ElementPlus)
app.use(router)
app.use(VueApexCharts)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')
