<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Location, 
  Phone, 
  Message, 
  Camera, 
  VideoCamera, 
  Picture, 
  CircleCheck, 
  StarFilled, 
  Timer, 
  Trophy,
  Cellphone,
  Setting,
  Download,
  Document,
  Connection,
  ShoppingBag,
  Present,
  ArrowRight
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { store } from '../../store'
import { MobileAppRepository, type MobileAppVersion } from '../../repositories/mobileAppRepository'

// Router
const router = useRouter()

// Repository instance
const mobileAppRepo = new MobileAppRepository()

// State
const activeApp = ref<MobileAppVersion | null>(null)
const loadingActive = ref(true)

// Auth checks
const isLoggedIn = computed(() => store.isAuthenticated)
const currentUser = computed(() => store.user)
const isAdmin = computed(() => {
  return currentUser.value?.role_name === 'Admin' || currentUser.value?.is_superuser
})

// Formatting helpers
const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('tk-TM', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Fetch APIs
const fetchActiveVersion = async () => {
  loadingActive.value = true
  try {
    const data = await mobileAppRepo.getActive()
    activeApp.value = data
  } catch (err) {
    console.error('Error fetching active mobile app:', err)
  } finally {
    loadingActive.value = false
  }
}

const handleDownload = () => {
  if (activeApp.value?.file_url) {
    window.open(activeApp.value.file_url, '_blank')
    ElMessage.success('Mobil goşundy ýüklenip başlandy...')
  } else {
    ElMessage.error('Ýüklemek üçin faýl tapylmady.')
  }
}

// Lifecycle
onMounted(async () => {
  await fetchActiveVersion()
})
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
          <p class="text-gray-500">Dünä belli brendleriň (Canon, Nikon, Sony) iň soňky modeldäki foto apparatlarynyň söwdasy.</p>
        </div>

        <div class="service-card group">
          <div class="icon-box">
            <el-icon><VideoCamera /></el-icon>
          </div>
          <h3 class="text-2xl font-bold mb-3">Gurluşlar we Enjamlar</h3>
          <p class="text-gray-500">Obýektiwler, ştatiwler, yşyklandyryş enjamlary we ähli görnüşli foto-aksessuarlar.</p>
        </div>

        <div class="service-card group">
          <div class="icon-box">
            <el-icon><Picture /></el-icon>
          </div>
          <h3 class="text-2xl font-bold mb-3">Surat hyzmatlary</h3>
          <p class="text-gray-500">Professional studio suratlary, toý-dabaralaryň we dürli ýatdan çykmajak pursatlaryň surata düşürilmegi.</p>
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
            Doganlar foto merkezi Mary şäherinde ýerleşip, foto söýüjiler we professional fotograflar üçin ähli amatlyklary döredýär. Biz diňe bir haryt satman, eýsem siziň durmuşyňyzyň iň ýatdan çykmajak pursatlaryny bakylyga öwürmekde ýakyndan ýardam berýäris.
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

      <!-- Mobile App Download Section -->
      <section class="mb-28">
        <div class="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-slate-950 via-gray-900 to-red-950 p-8 md:p-16 shadow-[0_30px_100px_rgba(220,38,38,0.15)] border border-white/5 backdrop-blur-xl">
          <!-- Background decorative glowing blobs -->
          <div class="absolute -top-40 -left-40 w-96 h-96 bg-red-600/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-red-800/10 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div class="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <!-- Left Side: Content & Action -->
            <div class="lg:col-span-7 space-y-6">
              <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/10 border border-red-600/20 text-red-500 text-xs font-bold uppercase tracking-[0.2em]">
                <el-icon><cellphone /></el-icon>
                Resmi Mobil Goşundy
              </div>
              
              <h2 class="text-3xl md:text-5xl font-black text-white leading-tight uppercase">
                Doganlar Foto <br class="hidden md:inline" /><span class="text-red-600">el telefonlaryňyzda</span>
              </h2>
              
              <p class="text-gray-300 text-base md:text-lg leading-relaxed font-light">
                Biz size amatlylyklary döretmegi dowam edýäris. Täze mobil goşundymyzy ýükläp alyp, söwda harytlarymyzy sargyt edip, sargytlaryňyzyň ýagdaýyny we toý-dabaralaryňyzyň wagt meýilnamalaryny yzarlap bilersiňiz.
              </p>
              
              <!-- Download Status & Details -->
              <div v-if="activeApp" class="space-y-4 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md max-w-xl">
                <div class="flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <div class="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Häzirki wersiýa</div>
                    <div class="text-lg font-bold text-white flex items-center gap-2">
                      w{{ activeApp.version_name }}
                      <span class="px-2 py-0.5 text-[10px] bg-green-500/20 text-green-400 rounded-full border border-green-500/30 font-bold flex items-center gap-1">
                        <span class="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping"></span> Işjeň
                      </span>
                    </div>
                  </div>
                  <div>
                    <div class="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Ýüklenen senesi</div>
                    <div class="text-sm font-bold text-gray-200">{{ formatDate(activeApp.created_at) }}</div>
                  </div>
                  <div>
                    <div class="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Format / Göwrüm</div>
                    <div class="text-sm font-bold text-gray-200">APK / ~15 MB</div>
                  </div>
                </div>
                
                <div v-if="activeApp.description" class="pt-3 border-t border-white/5">
                  <div class="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Wersiýa täzelikleri:</div>
                  <p class="text-xs text-gray-300 leading-relaxed font-light whitespace-pre-line">{{ activeApp.description }}</p>
                </div>
              </div>
              
              <div v-else class="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md max-w-xl text-center">
                <p class="text-gray-300 text-sm">Häzirki wagtda ýükläp almak üçin wersiýa elýeterli däl.</p>
              </div>

              <!-- Action Buttons -->
              <div class="flex flex-wrap gap-4 pt-2">
                <button 
                  v-if="activeApp"
                  @click="handleDownload"
                  class="flex items-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-base transition-all shadow-lg shadow-red-600/35 active:scale-95 hover:shadow-red-600/50 hover:-translate-y-0.5 group cursor-pointer"
                >
                  <el-icon class="text-xl group-hover:animate-bounce"><download /></el-icon>
                  Goşundyny ýükläp alyň
                </button>
                
                <button 
                  v-if="isAdmin"
                  @click="router.push('/admin/mobile-apps')"
                  class="flex items-center gap-3 px-6 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold text-sm transition-all border border-white/10 hover:border-white/20 active:scale-95 cursor-pointer"
                >
                  <el-icon class="text-lg"><setting /></el-icon>
                  Dolandyryş Paneli
                </button>
              </div>
            </div>
            
            <!-- Right Side: Phone Mockup -->
            <div class="lg:col-span-5 flex justify-center items-center">
              <div class="phone-mockup relative">
                <!-- Phone shadow & glow -->
                <div class="absolute inset-0 bg-red-600/20 rounded-[50px] blur-3xl transform -rotate-12 scale-105 pointer-events-none"></div>
                
                <div class="phone-frame w-[280px] h-[520px] bg-slate-50 border-[10px] border-slate-900 
                    rounded-[44px] shadow-2xl relative overflow-hidden flex flex-col justify-between p-4 
                    text-slate-900 select-none ring-1 ring-black/5">
                  <!-- Phone Notch -->
                  <div class="absolute top-0 left-1/2 transform -translate-x-1/2 w-28 h-5 bg-slate-900 rounded-b-2xl z-20 flex justify-center items-end pb-1">
                    <div class="w-10 h-0.5 bg-white/20 rounded-full"></div>
                  </div>
                  
                  <!-- Status Bar -->
                  <div class="flex justify-between items-center opacity-70 text-[9px] z-10 pt-0.5">
                    <span class="font-bold">09:41</span>
                    <div class="flex items-center gap-1">
                      <el-icon class="text-[9px]"><connection /></el-icon>
                      <span class="font-bold">5G</span>
                      <div class="w-4 h-2 border border-slate-900/60 rounded-sm p-0.5 flex items-center"><div class="bg-slate-900 h-full w-full rounded-sm"></div></div>
                    </div>
                  </div>
                  
                  <!-- App Home Screen Mockup -->
                  <div class="my-auto flex flex-col items-center text-center py-4 px-2">
                    <!-- App Logo -->
                    <div class="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-red-600/40 mb-4 border border-red-400/20 transform hover:scale-105 transition-transform duration-300">
                      D
                    </div>
                    <h4 class="text-sm font-black tracking-wider uppercase mb-0.5 text-slate-900">Doganlar Foto</h4>
                    <span class="text-[8px] px-2 py-0.5 bg-slate-200/60 rounded-full text-slate-700 border border-slate-300/30 mb-4 inline-block">Mary Şäheri</span>
                    
                    <!-- App Interface Mock Cards - Three Sections from EntryPage, White Background -->
                    <div class="w-full space-y-2 text-left pt-1">
                      <!-- Harytlar -->
                      <div class="bg-white p-2.5 rounded-xl flex items-center justify-between shadow-md hover:translate-y-[-1px] transition-all">
                        <div class="flex items-center gap-2">
                          <div class="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center text-red-600"><el-icon><shopping-bag /></el-icon></div>
                          <div>
                            <div class="text-[9px] font-extrabold text-slate-900">Harytlar</div>
                            <div class="text-[7px] text-slate-500">Foto enjamlaryň dükany</div>
                          </div>
                        </div>
                        <el-icon class="text-slate-400 text-[10px]"><arrow-right /></el-icon>
                      </div>
                      
                      <!-- FotoStudio -->
                      <div class="bg-white p-2.5 rounded-xl flex items-center justify-between shadow-md hover:translate-y-[-1px] transition-all">
                        <div class="flex items-center gap-2">
                          <div class="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900"><el-icon><video-camera /></el-icon></div>
                          <div>
                            <div class="text-[9px] font-extrabold text-slate-900">FotoStudio</div>
                            <div class="text-[7px] text-slate-500">Portfolio tomaşa et</div>
                          </div>
                        </div>
                        <el-icon class="text-slate-400 text-[10px]"><arrow-right /></el-icon>
                      </div>
 
                      <!-- Sowgatlar -->
                      <div class="bg-white p-2.5 rounded-xl flex items-center justify-between shadow-md hover:translate-y-[-1px] transition-all">
                        <div class="flex items-center gap-2">
                          <div class="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600"><el-icon><present /></el-icon></div>
                          <div>
                            <div class="text-[9px] font-extrabold text-slate-900">Sowgatlar</div>
                            <div class="text-[7px] text-slate-500">Aksiýalara we sowgatlara goşul</div>
                          </div>
                        </div>
                        <el-icon class="text-slate-400 text-[10px]"><arrow-right /></el-icon>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Navigation bar mock -->
                  <div class="flex justify-around items-center border-t border-slate-200/60 pt-1.5 pb-0.5 text-[7px] text-gray-500">
                    <div class="flex flex-col items-center gap-0.5 text-red-500"><el-icon class="text-xs"><cellphone /></el-icon><span>Baş sahypa</span></div>
                    <div class="flex flex-col items-center gap-0.5"><el-icon class="text-xs"><camera /></el-icon><span>Studio</span></div>
                    <div class="flex flex-col items-center gap-0.5"><el-icon class="text-xs"><trophy /></el-icon><span>Kompaniýa</span></div>
                  </div>
                  
                  <!-- Home indicator -->
                  <div class="w-20 h-0.5 bg-slate-300 rounded-full mx-auto mt-0.5 z-10"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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

/* Phone Mockup Styles */
.phone-mockup {
  perspective: 1000px;
}

.phone-frame {
  transform: rotateY(-10px) rotateX(10px) rotateZ(2px);
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.phone-mockup:hover .phone-frame {
  transform: rotateY(-2px) rotateX(2px) rotateZ(0deg) scale(1.02);
}
</style>
