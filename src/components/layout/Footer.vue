<script setup lang="ts">
import logo from '../../assets/logo1.png'
</script>

<template>
  <footer class="bg-gray-900 text-gray-300">
    <!-- Main Footer -->
    <div class="max-w-7xl mx-auto px-4 py-12">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <!-- Brand -->
        <div class="lg:col-span-1">
          <div class="flex items-center gap-3 mb-6">
            <img :src="logo" alt="Doganlar" class="w-10 h-10 object-contain shrink-0" />
            <div class="leading-tight">
              <div class="text-xl font-black text-white tracking-tight">Doganlar</div>
              <div class="text-[10px] text-red-500 font-bold -mt-0.5 tracking-[0.2em] uppercase">foto merkezi</div>
            </div>
          </div>
          <p class="text-sm text-gray-400 leading-relaxed mb-4">
            Doganlar foto merkezi Mary şäherinde ýerleşip, foto söýüjiler we professional fotograflar üçin ähli amatlyklary döredýär. Biz diňe bir haryt satman, eýsem siziň durmuşyňyzyň iň dury pursatlaryny bakylyga öwürmekde ýakyndan ýardam berýäris.
          </p>
          <div class="flex gap-3">
            <a href="#" class="w-8 h-8 bg-gray-700 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors">
              <span class="text-xs font-bold">f</span>
            </a>
            <a href="#" class="w-8 h-8 bg-gray-700 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors">
              <span class="text-xs font-bold">in</span>
            </a>
            <a href="#" class="w-8 h-8 bg-gray-700 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors">
              <el-icon class="text-xs"><VideoCamera /></el-icon>
            </a>
            <!-- tiktok akkaunta baglanyşdyrmak -->
            <a href="https://www.tiktok.com/@doganlar.studio" class="w-8 h-8 bg-gray-700 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors">
              <span class="text-xs font-bold">tk</span>
            </a>          
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Çalt baglanyşyklar</h4>
          <ul class="space-y-2">
            <li v-for="link in [
              { label: 'Baş sahypa', href: '/' },
              { label: 'Harytlar', href: '/products' },
              { label: 'Arzanladyşlar we Teklipler', href: '/deals' }
            ]" :key="link.label">
              <router-link :to="link.href" class="text-sm text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1">
                <el-icon class="text-xs"><ArrowRight /></el-icon>
                {{ link.label }}
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Customer Service -->
        <div>
          <h4 class="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Müşderi hyzmaty</h4>
          <ul class="space-y-2">
            <li v-for="link in [
              { label: 'Meniň hasabym', href: '/profile' },
              { label: 'Habarlar', href: '/blog' },
            ]" :key="link.label">
              <router-link :to="link.href" class="text-sm text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1">
                <el-icon class="text-xs"><ArrowRight /></el-icon>
                {{ link.label }}
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Contact -->
        <div>
          <h4 class="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Biz bilen habarlaşyň</h4>
          <ul class="space-y-3">
            <li class="flex items-start gap-3">
              <el-icon class="text-red-500 mt-0.5 shrink-0"><Location /></el-icon>
              <span class="text-sm text-gray-400">Mary şäheri, Mollanepes köçesi</span>
            </li>
            <li class="flex items-center gap-3">
              <el-icon class="text-red-500 shrink-0"><Phone /></el-icon>
              <div class="text-sm text-gray-400">
                <div>+993 64 30-12-57</div>
                <div>+993 61 24-69-37</div>
              </div>
            </li>
            <li class="flex items-center gap-3">
              <el-icon class="text-red-500 shrink-0"><Message /></el-icon>
              <span class="text-sm text-gray-400">doganlarfoto@gmail.com</span>
            </li>
            <li class="flex items-center gap-3">
              <el-icon class="text-red-500 shrink-0"><Clock /></el-icon>
              <span class="text-sm text-gray-400">Iş wagty: 8:00 – 19:00</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="border-t border-gray-800">
      <div class="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p class="text-xs text-gray-500">
          © {{ new Date().getFullYear() }} Doganlar foto merkezi. Ähli hukuklar goralan.
        </p>
      </div>
    </div>
  </footer>
</template>
