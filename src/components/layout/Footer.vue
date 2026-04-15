<script setup lang="ts">
</script>

<template>
  <footer class="bg-gray-900 text-gray-300">
    <!-- Main Footer -->
    <div class="max-w-7xl mx-auto px-4 py-12">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <!-- Brand -->
        <div class="lg:col-span-1">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center">
              <el-icon class="text-white text-lg"><Monitor /></el-icon>
            </div>
            <div class="leading-tight">
              <div class="text-lg font-bold text-white">Sumbar</div>
              <div class="text-xs text-red-500 font-semibold -mt-0.5 tracking-widest uppercase">Computer</div>
            </div>
          </div>
          <p class="text-sm text-gray-400 leading-relaxed mb-4">
            Your trusted technology partner in Ashgabat, Turkmenistan. We offer the latest computers, laptops, components and peripherals.
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
          <h4 class="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
          <ul class="space-y-2">
            <li v-for="link in ['Home', 'Laptops', 'Desktop PCs', 'Components', 'Monitors', 'Accessories', 'Deals & Offers']" :key="link">
              <a href="#" class="text-sm text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1">
                <el-icon class="text-xs"><ArrowRight /></el-icon>
                {{ link }}
              </a>
            </li>
          </ul>
        </div>

        <!-- Customer Service -->
        <div>
          <h4 class="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Customer Service</h4>
          <ul class="space-y-2">
            <li v-for="link in ['My Account', 'Order Tracking', 'Return Policy', 'Warranty Info', 'FAQ', 'Contact Us', 'Service Center']" :key="link">
              <a href="#" class="text-sm text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1">
                <el-icon class="text-xs"><ArrowRight /></el-icon>
                {{ link }}
              </a>
            </li>
          </ul>
        </div>

        <!-- Contact -->
        <div>
          <h4 class="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact Us</h4>
          <ul class="space-y-3">
            <li class="flex items-start gap-3">
              <el-icon class="text-red-500 mt-0.5 shrink-0"><Location /></el-icon>
              <span class="text-sm text-gray-400">Ashgabat, Turkmenistan, City Center</span>
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
              <span class="text-sm text-gray-400">Mon – Sat: 9:00 – 18:00</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="border-t border-gray-800">
      <div class="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p class="text-xs text-gray-500">
          © 2024 Sumbar Computer. All rights reserved.
        </p>
        <div class="flex items-center gap-4 text-xs text-gray-500">
          <a href="#" class="hover:text-gray-300 transition-colors">Privacy Policy</a>
          <a href="#" class="hover:text-gray-300 transition-colors">Terms of Service</a>
          <a href="#" class="hover:text-gray-300 transition-colors">Sitemap</a>
        </div>
      </div>
    </div>
  </footer>
</template>
