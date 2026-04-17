<script setup lang="ts">
import logo from '../../assets/branding/logo.png'
</script>

<template>
  <footer class="bg-gray-900 text-gray-300">
    <!-- Main Footer -->
    <div class="max-w-7xl mx-auto px-4 py-12">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <!-- Brand -->
        <div class="lg:col-span-1">
          <div class="flex items-center gap-2 mb-4">
            <img :src="logo" alt="Doganlar foto merkezi" class="h-10 w-auto" />
            <div class="leading-tight">
              <div class="text-lg font-bold text-white">Doganlar</div>
              <div class="text-xs text-red-500 font-semibold -mt-0.5 tracking-widest uppercase">foto merkezi</div>
            </div>
          </div>
          <p class="text-sm text-gray-400 leading-relaxed mb-4">
            Aşgabatda we Türkmenistanda siziň ynamly tehnologiýa hyzmatdaşyňyz. Biz iň soňky kompýuterleri, noutbuklary, komponentleri we periferiýa enjamlaryny hödürleýäris.
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
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Çalt baglanyşyklar</h4>
          <ul class="space-y-2">
            <li v-for="link in [
              { label: 'Baş sahypa', href: '/' },
              { label: 'Noutbuklar', href: '/products/laptops' },
              { label: 'Desktop PK', href: '/products/desktops' },
              { label: 'Komponentler', href: '/products/components' },
              { label: 'Monitorlar', href: '/products/monitors' },
              { label: 'Aksessuarlar', href: '/products/accessories' },
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
              { label: 'Meniň hasabym', href: '/account' },
              { label: 'Sargydy yzarla', href: '/track' },
              { label: 'Yzyna gaýtarmak düzgüni', href: '/returns' },
              { label: 'Kepillik barada maglumat', href: '/warranty' },
              { label: 'Köp soralýan soraglar', href: '/faq' },
              { label: 'Biz bilen habarlaşyň', href: '/support' },
              { label: 'Hyzmat merkezi', href: '/service' }
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
              <span class="text-sm text-gray-400">Aşgabat ş., Türkmenistan, Şäher merkezi</span>
            </li>
            <li class="flex items-center gap-3">
              <el-icon class="text-red-500 shrink-0"><Phone /></el-icon>
              <div class="text-sm text-gray-400">
                <div>+993 (12) 49-23-43</div>
                <div>+993 (12) 26-13-69</div>
                <div>+993 (62) 70-80-45</div>
              </div>
            </li>
            <li class="flex items-center gap-3">
              <el-icon class="text-red-500 shrink-0"><Message /></el-icon>
              <span class="text-sm text-gray-400">sumbar.computer@gmail.com</span>
            </li>
            <li class="flex items-center gap-3">
              <el-icon class="text-red-500 shrink-0"><Clock /></el-icon>
              <span class="text-sm text-gray-400">Duş – Şen: 9:00 – 18:00</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="border-t border-gray-800">
      <div class="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p class="text-xs text-gray-500">
          © 2024 Doganlar foto merkezi. Ähli hukuklar goralan.
        </p>
        <div class="flex items-center gap-4 text-xs text-gray-500">
          <a href="#" class="hover:text-gray-300 transition-colors">Gizlinlik syýasaty</a>
          <a href="#" class="hover:text-gray-300 transition-colors">Ulanyş şertleri</a>
          <a href="#" class="hover:text-gray-300 transition-colors">Saýt kartasy</a>
        </div>
      </div>
    </div>
  </footer>
</template>
