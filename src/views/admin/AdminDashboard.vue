<script setup lang="ts">
import { computed } from 'vue'
import { store } from '../../store'
import { 
  Box, 
  Files, 
  TrendCharts, 
  Warning,
  Plus
} from '@element-plus/icons-vue'

const totalProducts = computed(() => store.products.length)
const totalCategories = computed(() => store.categories.length)
const outOfStock = computed(() => store.products.filter(p => !p.inStock).length)
const averageRating = computed(() => {
  const sum = store.products.reduce((acc, p) => acc + (p.rating || 0), 0)
  return (sum / store.products.length).toFixed(1)
})

const stats = computed(() => [
  { label: 'Ähli harytlar', value: totalProducts.value, icon: Box, color: 'blue' },
  { label: 'Kategoriýalar', value: totalCategories.value, icon: Files, color: 'purple' },
  { label: 'Galyndy ýok', value: outOfStock.value, icon: Warning, color: 'orange' },
  { label: 'Ortaça reýting', value: averageRating.value, icon: TrendCharts, color: 'green' },
])

const recentProducts = computed(() => [...store.products].slice(-5).reverse())

// ApexCharts Data
const chartCategories = computed(() => store.categories.map(c => c.name))
const chartCounts = computed(() => store.categories.map(c => c.count))

const barChartOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    fontFamily: 'Inter, sans-serif'
  },
  plotOptions: {
    bar: {
      borderRadius: 8,
      distributed: true,
      horizontal: false,
      columnWidth: '55%',
    }
  },
  dataLabels: { enabled: false },
  colors: ['#dc2626', '#0f172a', '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#6366f1', '#ec4899'],
  xaxis: {
    categories: chartCategories.value,
    labels: { style: { fontWeight: 600, fontSize: '10px' } }
  },
  yaxis: {
    labels: { style: { fontWeight: 600 } }
  },
  grid: {
    borderColor: '#f1f5f9',
    strokeDashArray: 4
  },
  tooltip: { theme: 'light' },
  legend: { show: false }
}))

const donutChartOptions = computed(() => ({
  chart: {
    type: 'donut',
    fontFamily: 'Inter, sans-serif'
  },
  labels: chartCategories.value,
  colors: ['#dc2626', '#0f172a', '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#6366f1', '#ec4899'],
  stroke: { show: false },
  dataLabels: { enabled: false },
  legend: {
    position: 'bottom',
    fontSize: '12px',
    fontWeight: 600,
    markers: { radius: 12 }
  },
  plotOptions: {
    pie: {
      donut: {
        size: '75%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Jemi',
            formatter: () => totalProducts.value
          }
        }
      }
    }
  }
}))

const barChartSeries = computed(() => [{
  name: 'Haryt sany',
  data: chartCounts.value
}])

const donutChartSeries = computed(() => chartCounts.value)
</script>

<template>
  <div class="space-y-10 pb-20 animate-fade-in">
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div 
        v-for="stat in stats" 
        :key="stat.label"
        class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 group overflow-hidden relative"
      >
        <div class="relative z-10 flex items-center justify-between">
          <div>
            <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 group-hover:text-gray-500 transition-colors">
              {{ stat.label }}
            </p>
            <h3 class="text-3xl font-black text-slate-900 tracking-tight">{{ stat.value }}</h3>
          </div>
          <div 
            class="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg"
            :class="{
              'bg-blue-50 text-blue-600 shadow-blue-500/10': stat.color === 'blue',
              'bg-purple-50 text-purple-600 shadow-purple-500/10': stat.color === 'purple',
              'bg-orange-50 text-orange-600 shadow-orange-500/10': stat.color === 'orange',
              'bg-green-50 text-green-600 shadow-green-500/10': stat.color === 'green',
            }"
          >
            <el-icon class="text-2xl"><component :is="stat.icon" /></el-icon>
          </div>
        </div>
        
        <!-- Background Decoration -->
        <div 
          class="absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-[0.03] group-hover:scale-150 transition-transform duration-700"
          :class="{
            'bg-blue-600': stat.color === 'blue',
            'bg-purple-600': stat.color === 'purple',
            'bg-orange-600': stat.color === 'orange',
            'bg-green-600': stat.color === 'green',
          }"
        ></div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Main Chart Area -->
      <div class="lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h3 class="text-lg font-black text-slate-900 tracking-tight">Kategoriýalar boýunça harytlar</h3>
            <p class="text-xs text-gray-400 font-bold mt-1">Harytlaryň kategoriýalar arasyna paýlanyşy</p>
          </div>
        </div>
        
        <div class="h-[300px]">
          <apexchart
            type="bar"
            height="100%"
            :options="barChartOptions"
            :series="barChartSeries"
          />
        </div>
      </div>

      <!-- Distribution Area -->
      <div class="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden flex flex-col">
        <div class="mb-8">
          <h3 class="text-lg font-black text-slate-900 tracking-tight">Paýlanyş</h3>
          <p class="text-xs text-gray-400 font-bold mt-1">Görünüş boýunça paýlar</p>
        </div>
        
        <div class="flex-1 flex items-center justify-center">
          <apexchart
            type="donut"
            width="100%"
            :options="donutChartOptions"
            :series="donutChartSeries"
          />
        </div>
      </div>

      <!-- Quick Actions / Notifications -->
      <div class="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
        <div class="bg-slate-900 text-white rounded-3xl p-8 shadow-xl shadow-slate-900/20 relative overflow-hidden h-fit">
          <h3 class="text-lg font-black tracking-tight mb-4 relative z-10">Täze mümkinçilikler</h3>
          <p class="text-sm text-gray-400 mb-6 relative z-10">Müdirlik paneli arkaly siz dükanyňyzyň ähli harytlaryny we kategoriýalaryny dolandyryp bilersiňiz.</p>
          <router-link 
            to="/admin/products"
            class="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-red-700 transition-all no-underline shadow-lg shadow-red-600/30 active:scale-95"
          >
            <el-icon><Plus /></el-icon>
            Haryt goş
          </router-link>
          <el-icon class="absolute -bottom-10 -right-10 text-[180px] text-white/5 -rotate-12"><TrendCharts /></el-icon>
        </div>

        <div class="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm h-fit">
          <h4 class="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 border-b border-gray-50 pb-4">Soňky goşulanlar</h4>
          <div class="space-y-5">
            <div v-for="product in recentProducts" :key="product.id" class="flex gap-4 items-center">
              <div class="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0 shadow-sm p-1">
                <img :src="product.image" class="w-full h-full object-cover rounded-xl" />
              </div>
              <div class="min-w-0">
                <p class="text-sm font-black text-slate-900 truncate leading-tight">{{ product.name }}</p>
                <p class="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">{{ product.category }}</p>
              </div>
              <div class="ml-auto text-right">
                <p class="text-sm font-black text-red-600">${{ product.price }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
