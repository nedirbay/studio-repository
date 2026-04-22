<script setup lang="ts">
import { Location, Phone, Message, Camera, VideoCamera, Picture, CircleCheck, StarFilled, Timer, Trophy } from '@element-plus/icons-vue'
</script>

<template>
  <div class="about-page pb-20">
    <!-- Hero Section -->
    <section class="relative h-[500px] flex items-center justify-center overflow-hidden">
      <div class="absolute inset-0 z-0">
        <img 
          src="https://images.pexels.com/photos/1205033/pexels-photo-1205033.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
          alt="Photography Scene" 
          class="w-full h-full object-cover opacity-30"
        />
        <div class="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900/90 to-white"></div>
      </div>
      
      <div class="relative z-10 text-center px-4 max-w-4xl">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/10 border border-red-600/20 text-red-500 text-xs font-bold uppercase tracking-[0.2em] mb-6">
          <el-icon><Camera /></el-icon>
          Siziň durmuşyňyzyň dury pursatlary
        </div>
        <h1 class="text-4xl md:text-7xl font-black text-white mb-6 tracking-tight uppercase leading-none">
          Doganlar <span class="text-red-600">foto merkezi</span>
        </h1>
        <p class="text-xl text-gray-300 font-light leading-relaxed mb-8">
          Mary şäherinde ýokary hilli foto apparatlaryň söwdasy we professional surat hyzmatlaryny hödürleýän ýeke-täk merkez.
        </p>
      </div>
    </section>

    <div class="max-w-7xl mx-auto px-4 -mt-24 relative z-20">
      <!-- Core Services Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
        <div class="service-card group">
          <div class="icon-box">
            <el-icon><Camera /></el-icon>
          </div>
          <h3 class="text-2xl font-bold mb-3">Foto apparatlar</h3>
          <p class="text-gray-500">Dünýä belli brendleriň (Canon, Nikon, Sony) iň soňky modeldäki foto apparatlarynyň söwdasy.</p>
        </div>

        <div class="service-card group">
          <div class="icon-box">
            <el-icon><VideoCamera /></el-icon>
          </div>
          <h3 class="text-2xl font-bold mb-3">Gurluşlar we Enjamlar</h3>
          <p class="text-gray-500">Obýektiwler, ştiwitler, yşyklandyryş enjamlary we ähli görnüşli foto-aksessuarlar.</p>
        </div>

        <div class="service-card group">
          <div class="icon-box">
            <el-icon><Picture /></el-icon>
          </div>
          <h3 class="text-2xl font-bold mb-3">Surat hyzmatlary</h3>
          <p class="text-gray-500">Professional studio suratlary, dabaralaryň we dürli ýatdan çykmajak pursatlaryň surata düşürilmegi.</p>
        </div>
      </div>

      <!-- About Content -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-28">
        <div class="relative order-2 lg:order-1">
          <div class="image-stack">
            <img src="https://images.pexels.com/photos/593322/pexels-photo-593322.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Camera Gear" class="main-img" />
            <div class="floating-badge bg-red-600 text-white p-6 rounded-2xl shadow-xl">
              <div class="text-3xl font-black">10+</div>
              <div class="text-[10px] font-bold uppercase tracking-widest">Ýyllyk Tejribe</div>
            </div>
          </div>
        </div>

        <div class="space-y-8 order-1 lg:order-2" id="contact">
          <div>
            <h2 class="text-4xl font-black text-gray-900 leading-tight mb-4 lowercase first-letter:uppercase">
              Biz barada has <span class="text-red-600">giňişleýin</span>
            </h2>
            <div class="w-20 h-1.5 bg-red-600 rounded-full"></div>
          </div>
          
          <p class="text-lg text-gray-600 leading-relaxed">
            Doganlar foto merkezi Mary şäherinde ýerleşip, foto söýüjiler we professional fotograflar üçin ähli amatlyklary döredýär. Biz diňe bir haryt satman, eýsem siziň durmuşyňyzyň iň dury pursatlaryny bakylyga öwürmekde ýakyndan ýardam berýäris.
          </p>

          <div class="space-y-6">
            <div class="info-item">
              <div class="info-icon"><Location /></div>
              <div>
                <div class="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Biziň salgymyz</div>
                <div class="text-lg font-bold text-gray-900">Mary şäheri, Mollanepes kelte köçesi</div>
              </div>
            </div>
            <div class="info-item">
              <div class="info-icon"><Phone /></div>
              <div>
                <div class="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Habarlaşmak üçin</div>
                <div class="text-lg font-bold text-gray-900">+993 64 30-12-57</div>
                <div class="text-lg font-bold text-gray-900">+993 61 24-69-37</div>
              </div>
            </div>
            <div class="info-item">
              <div class="info-icon"><Message /></div>
              <div>
                <div class="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Email salgymyz</div>
                <div class="text-lg font-bold text-gray-900">doganlarfoto@gmail.com</div>
              </div>
            </div>
            <div class="info-item">
              <div class="info-icon"><Timer /></div>
              <div>
                <div class="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Iş wagtlarymyz</div>
                <div class="text-lg font-bold text-gray-900">Her gün: 08:00 - 19:00</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Why Us Section -->
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-5xl font-black text-gray-900 mb-4">Näme üçin bizi <span class="text-red-600">saýlamaly</span>?</h2>
        <p class="text-gray-500 max-w-2xl mx-auto">Biz her bir müşderiniň islegini professional derejede kanagatlandyrmaga çalyşýarys.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-28">
        <div v-for="(reason, index) in [
          { title: 'Original Harytlar', desc: 'Diňe dünýä belli brendleriň hakyky önümleri.', icon: StarFilled },
          { title: 'Amatly Baha', desc: 'Bazaryň iň amatly we elýeterli bahalary.', icon: Trophy },
          { title: 'Kepillik', desc: 'Satan ähli harytlarymyza doly kepillik berýäris.', icon: CircleCheck },
          { title: 'Professional Maslahat', desc: 'Enjam saýlamakda hünärmen kömegi.', icon: Message }
        ]" :key="index" class="p-8 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-red-100 group">
          <el-icon class="text-3xl text-red-600 mb-4 group-hover:scale-110 transition-transform"><component :is="reason.icon" /></el-icon>
          <h4 class="text-xl font-bold text-gray-900 mb-2">{{ reason.title }}</h4>
          <p class="text-sm text-gray-500 leading-relaxed">{{ reason.desc }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.about-page {
  animation: fadeIn 0.8s ease-out;
}

.service-card {
  @apply bg-white p-10 rounded-[32px] shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden relative;
}

.service-card::after {
  content: '';
  @apply absolute bottom-0 left-0 w-full h-1 bg-red-600 transform scale-x-0 transition-transform duration-500 origin-left;
}

.service-card:hover::after {
  @apply scale-x-100;
}

.icon-box {
  @apply w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-8 text-3xl text-red-600 transition-colors duration-500;
}

.service-card:hover .icon-box {
  @apply bg-red-600 text-white;
}

.image-stack {
  @apply relative inline-block;
}

.main-img {
  @apply rounded-[40px] shadow-2xl w-full max-w-[500px] object-cover aspect-square;
}

.floating-badge {
  @apply absolute -bottom-6 -right-6 text-center min-w-[140px] ring-8 ring-white;
}

.info-item {
  @apply flex items-center gap-5 p-4 rounded-2xl hover:bg-gray-50 transition-colors;
}

.info-icon {
  @apply w-12 h-12 bg-white shadow-md rounded-xl flex items-center justify-center text-xl text-red-600;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .floating-badge {
    @apply -bottom-4 -right-4 min-w-[100px] p-4;
  }
}
</style>
