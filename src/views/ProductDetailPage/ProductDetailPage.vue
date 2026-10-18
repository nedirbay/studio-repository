<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { store, actions, formatPrice } from '../../store'
import ProductCard from '../../components/shared/ProductCard.vue'
import { 
  ZoomIn, 
  CircleCheck, 
  CircleClose, 
  Document, 
  Warning, 
  Close, 
  ArrowLeft, 
  ArrowRight,
  ShoppingCart,
  Plus,
  Minus,
  Check
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const productSlug = computed(() => route.params.slug as string)

const product = ref<any>(null)
const loadingProduct = ref(false)
const errorProduct = ref(false)

// Image gallery
const quantity = ref(1)
function increaseQuantity() { quantity.value++ }
function decreaseQuantity() { if (quantity.value > 1) quantity.value-- }

const selectedImage = ref(0)
const showImageModal = ref(false)
const modalImageIndex = ref(0)

const images = computed(() => {
  if (!product.value) return []
  if (product.value.images && product.value.images.length > 0) {
    return product.value.images
  }
  return [product.value.image]
})

function selectImage(index: number) {
  selectedImage.value = index
}

function openImageModal(index: number) {
  modalImageIndex.value = index
  showImageModal.value = true
  document.body.style.overflow = 'hidden'
}

function closeImageModal() {
  showImageModal.value = false
  document.body.style.overflow = ''
}

function prevImage() {
  modalImageIndex.value = modalImageIndex.value === 0 ? images.value.length - 1 : modalImageIndex.value - 1
}

// Next Image
function nextImage() {
  modalImageIndex.value = modalImageIndex.value === images.value.length - 1 ? 0 : modalImageIndex.value + 1
}

// Related products from the same category
const relatedProducts = computed(() => {
  if (!product.value) return []
  const catId = product.value.category_id || product.value.category?.id
  const currentId = product.value.id
  let list = store.products.filter(p => p.id !== currentId && (p.category_id === catId || (product.value.category_name && p.category === product.value.category_name)))
  if (list.length < 4) {
    const others = store.products.filter(p => p.id !== currentId && !list.some(item => item.id === p.id))
    list = [...list, ...others]
  }
  return list.slice(0, 4)
})

// Fetch product details
async function loadProductDetail() {
  if (!productSlug.value) return
  loadingProduct.value = true
  errorProduct.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
  try {
    const fetchedProduct = await actions.fetchProductBySlug(productSlug.value)
    product.value = fetchedProduct
    if (store.products.length === 0) {
      actions.fetchProductCatalogue()
    }
  } catch (error) {
    console.error('Failed to load product detail:', error)
    errorProduct.value = true
    product.value = null
  } finally {
    loadingProduct.value = false
  }
}

onMounted(loadProductDetail)
watch(productSlug, loadProductDetail)

</script>

<template>
  <main class="bg-gray-50 min-h-screen">
    <!-- Loading State -->
    <div v-if="loadingProduct" class="max-w-7xl mx-auto px-4 py-12 text-center">
      <el-skeleton :rows="10" animated />
    </div>

    <div class="max-w-7xl mx-auto px-4 py-6" v-else-if="product">
      <button
        type="button"
        class="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
        @click="router.back()"
      >
        <el-icon><ArrowLeft /></el-icon>
        Yza
      </button>

      <!-- Breadcrumb -->
      <!-- <nav class="flex items-center gap-2 text-sm mb-6">
        <router-link to="/" class="text-gray-500 hover:text-red-600">Baş sahypa</router-link>
        <span class="text-gray-400">/</span>
        <router-link to="/products" class="text-gray-500 hover:text-red-600">Harytlar</router-link>
        <span class="text-gray-400">/</span>
        <span class="text-gray-700">{{ product.category }}</span>
        <span class="text-gray-400">/</span>
        <span class="text-gray-900 font-medium">{{ product.name }}</span>
      </nav> -->

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <!-- Image Gallery -->
        <div class="space-y-4">
          <!-- Main Image -->
          <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <div class="relative aspect-square cursor-zoom-in" @click="openImageModal(selectedImage)">
              <img
                :src="images[selectedImage]"
                :alt="product.name"
                class="w-full h-full object-cover transition-transform hover:scale-105"
              />
              <div class="absolute top-3 left-3 flex flex-col gap-2">
                <span v-if="product.badge === 'new'" class="badge-new text-sm px-3 py-1">TÄZE</span>
                <span v-else-if="product.badge === 'sale'" class="badge-sale text-sm px-3 py-1">
                  -{{ Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100) }}%
                </span>
                <span v-else-if="product.badge === 'hot'" class="badge-hot text-sm px-3 py-1">Meşhur</span>
              </div>
              <div v-if="!product.inStock" class="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span class="text-white font-semibold bg-gray-800 px-4 py-2 rounded">Ammarda ýok</span>
              </div>
              <!-- Zoom icon overlay -->
              <div class="absolute bottom-3 right-3 bg-black/50 rounded-full p-2 text-white">
                <el-icon class="text-xl"><ZoomIn /></el-icon>
              </div>
            </div>
          </div>

          <!-- Thumbnail Gallery -->
          <div class="flex gap-3 overflow-x-auto pb-2">
            <button
              v-for="(img, index) in images"
              :key="index"
              @click="selectImage(index)"
              :class="[
                'w-20 h-20 rounded-lg overflow-hidden border-2 transition-all shrink-0',
                selectedImage === index ? 'border-red-600 ring-2 ring-red-200' : 'border-gray-200 hover:border-gray-400'
              ]"
            >
              <img :src="img" :alt="`${product.name} view ${index + 1}`" class="w-full h-full object-cover" />
            </button>
          </div>
        </div>

        <!-- Product Info -->
        <div class="space-y-6">
          <div>
            <div class="text-sm text-gray-500 mb-1">{{ product.brand }} · {{ product.category }}</div>
            <h1 class="text-3xl font-bold text-gray-900 mb-3">{{ product.name }}</h1>
            
          </div>

          <!-- Price -->
          <div class="flex items-baseline gap-3">
            <span class="text-3xl font-bold text-red-600">{{ formatPrice(product.price) }}</span>
            <span v-if="product.originalPrice" class="text-xl text-gray-400 line-through">
              {{ formatPrice(product.originalPrice) }}
            </span>
            <span v-if="product.originalPrice" class="text-sm font-semibold text-green-600">
              Tygyşytlaň {{ formatPrice(product.originalPrice - product.price) }}
            </span>
          </div>

          <!-- Availability & Stock -->
          <div class="flex items-center gap-2">
            <span 
              :class="product.inStock ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'"
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
            >
              <el-icon><component :is="product.inStock ? Check : Close" /></el-icon>
              {{ product.inStock ? 'Ammarda bar' : 'Ammarda ýok' }}
            </span>
          </div>

          <!-- Quantity and Add to Cart -->
          <div class="flex items-center gap-4 pt-2">
            <div class="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-white shadow-sm">
              <button 
                type="button"
                @click="decreaseQuantity" 
                class="px-3.5 py-2.5 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <el-icon><Minus /></el-icon>
              </button>
              <input 
                type="text" 
                :value="quantity" 
                readonly 
                class="w-12 text-center text-sm font-bold text-gray-800 focus:outline-none"
              />
              <button 
                type="button"
                @click="increaseQuantity" 
                class="px-3.5 py-2.5 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <el-icon><Plus /></el-icon>
              </button>
            </div>

            <button
              type="button"
              :disabled="!product.inStock"
              @click="actions.addToCart(product, quantity)"
              :class="[
                'flex-1 flex items-center justify-center gap-2 font-bold py-3 px-6 rounded-xl transition-all shadow-sm cursor-pointer',
                product.inStock 
                  ? 'bg-red-600 text-white hover:bg-red-700 hover:shadow-md active:scale-[0.99]' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              ]"
            >
              <el-icon class="text-xl"><ShoppingCart /></el-icon>
              Sebede goş
            </button>
          </div>

          <!-- Description -->
          <div v-if="product.description" class="bg-white rounded-xl p-5 shadow-sm">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">Düşündiriş</h3>
            <p class="text-gray-600 leading-relaxed">{{ product.description }}</p>
          </div>

          <div class="bg-white rounded-xl p-5 shadow-sm">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Tehniki aýratynlyklar</h2>
            <div v-if="product.specifications" class="space-y-3">
              <div
                v-for="(value, key) in product.specifications"
                :key="key"
                class="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0"
              >
                <dt class="flex-1 text-gray-500 font-medium">{{ key }}</dt>
                <span class="h-5 border-l border-gray-300" aria-hidden="true"></span>
                <dd class="flex-1 text-right text-gray-900 font-semibold">{{ value }}</dd>
              </div>
            </div>
            <div v-else class="text-center py-8">
              <el-icon class="text-5xl text-gray-300 mb-3"><Document /></el-icon>
              <p class="text-gray-500">Bu haryt üçin tehniki aýratynlyklar elýeterli däl.</p>
            </div>
          </div>

          <!-- Availability -->
          <!-- <div class="flex items-center gap-2">
            <el-icon :class="product.inStock ? 'text-green-600' : 'text-red-600'">
              <CircleCheck v-if="product.inStock" />
              <CircleClose v-else />
            </el-icon>
            <span :class="product.inStock ? 'text-green-600' : 'text-red-600'" class="font-medium">
              {{ product.inStock ? 'Ammarda bar' : 'Ammarda ýok' }}
            </span>
          </div> -->
        </div>
      </div>

      <!-- Meňzeş Harytlar (Related Products) -->
      <section v-if="relatedProducts.length > 0" class="mt-14 border-t border-gray-200 pt-10">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-xl font-bold text-gray-900">Meňzeş Harytlar</h2>
            <p class="text-sm text-gray-500 mt-1">Bu kategoriýadaky beýleki harytlar</p>
          </div>
          <router-link 
            :to="product.category_name ? `/products?category=${encodeURIComponent(product.category_name)}` : '/products'" 
            class="text-sm font-semibold text-red-600 hover:text-red-700 hover:underline"
          >
            Ählisini gör &rarr;
          </router-link>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <ProductCard
            v-for="p in relatedProducts"
            :key="p.id"
            :product="p"
          />
        </div>
      </section>

    </div>

    <!-- Product Not Found -->
    <div v-else class="max-w-7xl mx-auto px-4 py-12 text-center">
      <el-icon class="text-6xl text-gray-300 mb-4"><Warning /></el-icon>
      <h2 class="text-xl font-semibold text-gray-700 mb-2">Haryt tapylmady</h2>
      <p class="text-gray-500 mb-4">Gözleýän harydyňyz ýok ýa-da öçürilipdir.</p>
      <router-link to="/products" class="btn-primary">Harytlara seret</router-link>
    </div>

    <!-- Fullscreen Image Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div 
          v-if="showImageModal" 
          class="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
        >
          <!-- Close Button -->
          <button 
            @click="closeImageModal" 
            class="absolute top-4 right-4 z-10 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <el-icon class="text-3xl"><Close /></el-icon>
          </button>

          <!-- Previous Button -->
          <button 
            @click.stop="prevImage" 
            aria-label="Öňki surat"
            class="image-modal-nav image-modal-prev absolute left-4 top-1/2 -translate-y-1/2 z-20 w-14 h-14 flex items-center justify-center rounded-full text-white transition-colors"
          >
            <el-icon class="text-3xl"><ArrowLeft /></el-icon>
          </button>

          <!-- Next Button -->
          <button 
            @click.stop="nextImage" 
            aria-label="Indiki surat"
            class="image-modal-nav image-modal-next absolute right-4 top-1/2 -translate-y-1/2 z-20 w-14 h-14 flex items-center justify-center rounded-full text-white transition-colors"
          >
            <el-icon class="text-3xl"><ArrowRight /></el-icon>
          </button>

          <!-- Image Counter -->
          <div class="absolute top-4 left-4 z-10 bg-white/10 px-4 py-2 rounded-full text-white text-lg font-medium">
            {{ modalImageIndex + 1 }} / {{ images.length }}
          </div>

          <!-- Main Image - Fullscreen -->
          <img 
            :src="images[modalImageIndex]" 
            :alt="product?.name"
            class="w-full h-full object-contain"
          />

          <!-- Thumbnail Strip -->
          <div class="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 bg-black/80 p-3 rounded-xl">
            <button
              v-for="(img, index) in images"
              :key="index"
              @click.stop="modalImageIndex = index"
              :class="[
                'w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
                modalImageIndex === index ? 'border-red-600 ring-2 ring-red-600/50' : 'border-white/30 opacity-60 hover:opacity-100'
              ]"
            >
              <img :src="img" :alt="`Thumbnail ${index + 1}`" class="w-full h-full object-cover" />
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

  </main>
</template>

<style scoped>
.btn-primary {
  background-color: #dc2626;
  color: white;
  padding: 0.625rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 600;
  transition: background-color 0.2s;
  cursor: pointer;
  display: inline-block;
}
.btn-primary:hover {
  background-color: #b91c1c;
}

.badge-new {
  background-color: #22c55e;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
}

.badge-sale {
  background-color: #dc2626;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
}

.badge-hot {
  background-color: #f97316;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
}

/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.image-modal-nav {
  background: rgb(0 0 0 / 65%);
  border: 1px solid rgb(255 255 255 / 75%);
  box-shadow: 0 2px 12px rgb(0 0 0 / 55%);
  -webkit-tap-highlight-color: transparent;
}

.image-modal-nav:hover {
  background: rgb(0 0 0 / 85%);
}

@media (max-width: 640px) {
  .image-modal-nav {
    width: 48px;
    height: 48px;
  }

  .image-modal-prev {
    left: max(8px, env(safe-area-inset-left));
  }

  .image-modal-next {
    right: max(8px, env(safe-area-inset-right));
  }
}
</style>
