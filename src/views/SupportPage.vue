<script setup lang="ts">
import { ref } from 'vue'

const warrantySerial = ref('')
const searchFAQ = ref('')

const faqs = [
  { q: 'Kompýuterime nädip draýwer gurnamaly?', a: 'Draýwerler üçin öndürijiniň resmi saýtyna (Asus, HP, Dell) girip, seriýa belgiňiz arkaly iň soňky wersiýalaryny alyp bilersiňiz.' },
  { q: 'Garantiýa hyzmaty nämeleri öz içine alýar?', a: 'Garantiýa zawod defektlerini we enjamlaýyn näsazlyklary öz içine alýar. Programma dökülmegi ýa-da fiziki zeper ýetmegi garantiýa girmeýär.' },
  { q: 'Harydy yzyna gaýtaryp bolýamy?', a: 'Harytda zawod näsazlygy bar bolsa 24 sagadyň dowamynda yzyna gaýtaryp ýa-da çalşyp bilersiňiz.' },
  { q: 'Windows gurnap berýärsiňizmi?', a: 'Hawa, biz lisenziýaly Windows we gerekli programma üpjünçiligini gurnap berýäris.' }
]

function checkWarranty() {
  if (!warrantySerial.value) return
  // Mock logic
  alert('Garantiýa maglumaty gözlenilýär: ' + warrantySerial.value)
}


</script>

<template>
  <main class="bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="bg-slate-900 py-24 text-white relative overflow-hidden">
      <!-- Background Pattern/Image -->
      <div class="absolute inset-0 opacity-20">
        <img 
          src="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1200" 
          class="w-full h-full object-cover"
        />
      </div>
      <div class="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-900"></div>

      <div class="max-w-7xl mx-auto px-4 text-center relative z-10">
        <span class="inline-block bg-blue-600/20 text-blue-400 text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest border border-blue-500/30">
          Goldaw merkezi
        </span>
        <h1 class="text-4xl md:text-6xl font-black mb-6 tracking-tight">Size nähili kömek edip bileris?</h1>
        <p class="text-slate-400 max-w-2xl mx-auto mb-10 text-lg leading-relaxed">
          Tehniki goldaw we garantiýa hyzmatlary barada ähli maglumatlar şu ýerde. Biz size her ädimde kömek etmäge taýýar.
        </p>
        <div class="max-w-xl mx-auto">
          <el-input 
            v-model="searchFAQ" 
            placeholder="Soragyňyzy ýazyň..." 
            size="large"
            class="support-search-hero"
          >
            <template #prefix>
              <el-icon class="text-blue-500"><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 -mt-12 pb-20 relative z-20">
      <!-- Quick Actions Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div class="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <el-icon class="text-2xl"><Setting /></el-icon>
          </div>
          <h3 class="font-bold text-gray-900 mb-2">Draýwerler</h3>
          <p class="text-xs text-gray-500 mb-4">Enjamlaryňyz üçin iň soňky programma üpjünçiligi.</p>
          <el-button link type="primary">Programmalary al</el-button>
        </div>
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div class="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4">
            <el-icon class="text-2xl"><DocumentChecked /></el-icon>
          </div>
          <h3 class="font-bold text-gray-900 mb-2">Garantiýa</h3>
          <p class="text-xs text-gray-500 mb-4">Harydyňyzyň garantiýa möhletini barlaň.</p>
          <el-button link type="primary">Ýagdaýy barla</el-button>
        </div>
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div class="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
            <el-icon class="text-2xl"><ChatDotRound /></el-icon>
          </div>
          <h3 class="font-bold text-gray-900 mb-2">Canly Söhbet</h3>
          <p class="text-xs text-gray-500 mb-4">Hünärmenlerimiz bilen göni habarlaşyň.</p>
          <el-button link type="primary">Biz bilen gepleşiň</el-button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Forms Section -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Warranty Check -->
          <div class="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
              <el-icon class="text-red-500"><DocumentChecked /></el-icon>
              Garantiýany Barlamak
            </h2>
            <div class="flex flex-col sm:flex-row gap-4">
              <el-input 
                v-model="warrantySerial" 
                placeholder="Seriýa belgisini (SN) ýazyň" 
                size="large"
                class="flex-1"
              />
              <el-button type="primary" size="large" @click="checkWarranty" class="!px-8">Barlamak</el-button>
            </div>
            <p class="text-xs text-gray-400 mt-4">Belgi harydyň korpusynda ýa-da gutyda ýazylyp goýulýar.</p>
          </div>



          <!-- FAQ SECTION -->
          <div class="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 class="text-xl font-bold mb-6">Köp Sorapdyrylýan Soraglar</h2>
            <el-collapse accordion>
              <el-collapse-item v-for="(faq, index) in faqs" :key="index" :title="faq.q" :name="index">
                <div class="text-gray-600 py-2 leading-relaxed text-sm">
                  {{ faq.a }}
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>

        <!-- Contact Info -->
        <div class="space-y-6">
          <div class="bg-gray-900 rounded-3xl p-8 text-white relative overflow-hidden">
            <h2 class="text-xl font-bold mb-6 relative z-10">Habarlaşmak üçin</h2>
            <div class="space-y-6 relative z-10">
              <div class="flex gap-4">
                <el-icon class="text-red-500 text-xl mt-1"><Location /></el-icon>
                <div>
                  <h4 class="font-bold text-sm">Dükanymyz</h4>
                  <p class="text-xs text-gray-400 mt-1">Aşgabat ş., Parahat 4, Sumbar köçesi, 12-nji jaý</p>
                </div>
              </div>
              <div class="flex gap-4">
                <el-icon class="text-red-500 text-xl mt-1"><Phone /></el-icon>
                <div>
                  <h4 class="font-bold text-sm">Telefonlar</h4>
                  <p class="text-xs text-gray-400 mt-1">+993 12 12-34-56<br />+993 61 23-45-67</p>
                </div>
              </div>
              <div class="flex gap-4">
                <el-icon class="text-red-500 text-xl mt-1"><Message /></el-icon>
                <div>
                  <h4 class="font-bold text-sm">Email</h4>
                  <p class="text-xs text-gray-400 mt-1">support@doganlar.com.tm</p>
                </div>
              </div>
            </div>
            <!-- Decorative Icon -->
            <el-icon class="absolute -bottom-10 -right-10 text-[160px] text-white/5"><Service /></el-icon>
          </div>

          <div class="bg-red-50 rounded-3xl p-8 border border-red-100">
            <h3 class="font-bold text-red-900 mb-2">Tizlikli Hyzmat</h3>
            <p class="text-xs text-red-700 leading-relaxed">Habarlaşyp, öýiňizden harydy aldyryp we garantiýa hyzmatyndan peýdalanyp bilersiňiz.</p>
            <el-button type="danger" class="w-full mt-4 !rounded-xl">Şindiz jaň et</el-button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.support-search-hero :deep(.el-input__wrapper) {
  border-radius: 1rem !important;
  height: 4rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: none;
  font-size: 1.125rem;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
.support-search-hero :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
  transform: scale(1.02);
}
:deep(.el-collapse) {
  border: none;
}
:deep(.el-collapse-item__header) {
  font-weight: 700;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
  height: 3.5rem;
  font-size: 0.875rem;
}
:deep(.el-collapse-item__content) {
  padding-bottom: 1rem;
}
</style>
