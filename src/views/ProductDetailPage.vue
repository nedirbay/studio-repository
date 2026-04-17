<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getAllProducts } from '../data/products'
import { comments as initialComments } from '../data/comments'
import type { Product, Comment } from '../types'

const route = useRoute()
const productId = computed(() => Number(route.params.id))
const allProducts = ref<Product[]>(getAllProducts())

const product = computed(() => 
  allProducts.value.find(p => p.id === productId.value)
)

const comments = ref<Comment[]>(initialComments.filter(c => c.productId === productId.value))

// Active tab
const activeTab = ref<'specifications' | 'reviews'>('specifications')

// Image gallery
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

function nextImage() {
  modalImageIndex.value = modalImageIndex.value === images.value.length - 1 ? 0 : modalImageIndex.value + 1
}

// Quantity
const quantity = ref(1)

function increaseQuantity() {
  quantity.value++
}

function decreaseQuantity() {
  if (quantity.value > 1) quantity.value--
}

// Review form
const showReviewForm = ref(false)
const reviewForm = ref({
  rating: 5,
  title: '',
  content: ''
})

function submitReview() {
  if (!product.value) return
  
  const newComment: Comment = {
    id: Date.now(),
    productId: product.value.id,
    userId: 1,
    userName: 'Siz',
    rating: reviewForm.value.rating,
    title: reviewForm.value.title,
    content: reviewForm.value.content,
    createdAt: new Date().toISOString().split('T')[0],
    helpful: 0
  }
  
  comments.value.unshift(newComment)
  showReviewForm.value = false
  reviewForm.value = { rating: 5, title: '', content: '' }
}

// Helpful votes
function markHelpful(comment: Comment) {
  comment.helpful++
}

// Format date
function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}
</script>

<template>
  <main class="bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto px-4 py-6" v-if="product">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-sm mb-6">
        <router-link to="/" class="text-gray-500 hover:text-red-600">Baş sahypa</router-link>
        <span class="text-gray-400">/</span>
        <router-link to="/products" class="text-gray-500 hover:text-red-600">Harytlar</router-link>
        <span class="text-gray-400">/</span>
        <span class="text-gray-700">{{ product.category }}</span>
        <span class="text-gray-400">/</span>
        <span class="text-gray-900 font-medium">{{ product.name }}</span>
      </nav>

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
                <span v-else-if="product.badge === 'hot'" class="badge-hot text-sm px-3 py-1">GYZGYN</span>
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
            
            <!-- Rating -->
            <div class="flex items-center gap-3">
              <el-rate :model-value="product.rating" disabled show-score text-color="#ff9900" />
              <span class="text-sm text-gray-500">({{ product.reviews }} syn)</span>
            </div>
          </div>

          <!-- Price -->
          <div class="flex items-baseline gap-3">
            <span class="text-3xl font-bold text-red-600">${{ product.price.toLocaleString() }}</span>
            <span v-if="product.originalPrice" class="text-xl text-gray-400 line-through">
              ${{ product.originalPrice.toLocaleString() }}
            </span>
            <span v-if="product.originalPrice" class="text-sm font-semibold text-green-600">
              Tygyşytlaň ${{ (product.originalPrice - product.price).toLocaleString() }}
            </span>
          </div>

          <!-- Description -->
          <div v-if="product.description" class="bg-white rounded-xl p-5 shadow-sm">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">Düşündiriş</h3>
            <p class="text-gray-600 leading-relaxed">{{ product.description }}</p>
          </div>

          <!-- Features -->
          <div v-if="product.features && product.features.length > 0" class="bg-white rounded-xl p-5 shadow-sm">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">Esasy aýratynlyklar</h3>
            <ul class="space-y-2">
              <li v-for="(feature, index) in product.features" :key="index" class="flex items-start gap-2">
                <el-icon class="text-green-600 mt-1"><CircleCheck /></el-icon>
                <span class="text-gray-600">{{ feature }}</span>
              </li>
            </ul>
          </div>

          <!-- Quantity & Add to Cart -->
          <div class="flex flex-col sm:flex-row gap-4">
            <div class="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button 
                @click="decreaseQuantity" 
                class="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
                :disabled="quantity <= 1"
              >
                <el-icon><Minus /></el-icon>
              </button>
              <span class="w-12 h-10 flex items-center justify-center font-semibold">{{ quantity }}</span>
              <button 
                @click="increaseQuantity" 
                class="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <el-icon><Plus /></el-icon>
              </button>
            </div>
            
            <button
              :disabled="!product.inStock"
              :class="[
                'flex-1 flex items-center justify-center gap-2 font-semibold py-2.5 rounded-lg transition-colors',
                product.inStock 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              ]"
            >
              <el-icon><ShoppingCart /></el-icon>
              Sebede goş
            </button>
            
            <button class="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:border-red-600 hover:text-red-600 transition-colors">
              <el-icon><Star /></el-icon>
            </button>
          </div>

          <!-- Availability -->
          <div class="flex items-center gap-2">
            <el-icon :class="product.inStock ? 'text-green-600' : 'text-red-600'">
              <CircleCheck v-if="product.inStock" />
              <CircleClose v-else />
            </el-icon>
            <span :class="product.inStock ? 'text-green-600' : 'text-red-600'" class="font-medium">
              {{ product.inStock ? 'Ammarda bar' : 'Ammarda ýok' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Tabs Section -->
      <div class="bg-white rounded-xl shadow-sm mb-8">
        <!-- Tab Headers -->
        <div class="flex border-b border-gray-200">
          <button
            @click="activeTab = 'specifications'"
            :class="[
              'flex-1 py-4 px-6 text-center font-semibold transition-colors relative',
              activeTab === 'specifications' 
                ? 'text-red-600' 
                : 'text-gray-500 hover:text-gray-700'
            ]"
          >
            Tehniki aýratynlyklar
            <span 
              v-if="activeTab === 'specifications'" 
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"
            ></span>
          </button>
          <button
            @click="activeTab = 'reviews'"
            :class="[
              'flex-1 py-4 px-6 text-center font-semibold transition-colors relative',
              activeTab === 'reviews' 
                ? 'text-red-600' 
                : 'text-gray-500 hover:text-gray-700'
            ]"
          >
            Müşderi synlary
            <span class="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{{ comments.length }}</span>
            <span 
              v-if="activeTab === 'reviews'" 
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"
            ></span>
          </button>
        </div>

        <!-- Tab Content -->
        <div class="p-6">
          <!-- Specifications Tab -->
          <div v-if="activeTab === 'specifications'">
            <div v-if="product.specifications" class="space-y-3">
              <div 
                v-for="(value, key) in product.specifications" 
                :key="key" 
                class="flex justify-between py-3 border-b border-gray-100 last:border-0"
              >
                <dt class="text-gray-500 font-medium">{{ key }}</dt>
                <dd class="text-gray-900 font-semibold">{{ value }}</dd>
              </div>
            </div>
            <div v-else class="text-center py-8">
              <el-icon class="text-5xl text-gray-300 mb-3"><Document /></el-icon>
              <p class="text-gray-500">Bu haryt üçin tehniki aýratynlyklar elýeterli däl.</p>
            </div>
          </div>

          <!-- Reviews Tab -->
          <div v-if="activeTab === 'reviews'">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-3">
                <div class="text-3xl font-bold text-gray-900">{{ product.rating }}</div>
                <div>
                  <el-rate :model-value="product.rating" disabled size="large" />
                  <div class="text-sm text-gray-500">{{ product.reviews }} syn</div>
                </div>
              </div>
              <button 
                @click="showReviewForm = true" 
                class="btn-primary text-sm"
              >
                Syn ýaz
              </button>
            </div>

            <!-- Review Form Modal -->
            <el-dialog v-model="showReviewForm" title="Syn ýazyň" width="500px">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Reýting</label>
                  <el-rate v-model="reviewForm.rating" size="large" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Sözbaşy</label>
                  <el-input v-model="reviewForm.title" placeholder="Synyňyzy gysgaça beýan ediň" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Syn</label>
                  <el-input 
                    v-model="reviewForm.content" 
                    type="textarea" 
                    :rows="4" 
                    placeholder="Bu haryt baradaky tejribäňiz bilen paýlaşyň" 
                  />
                </div>
              </div>
              <template #footer>
                <el-button @click="showReviewForm = false">Goýbolsun et</el-button>
                <el-button type="primary" @click="submitReview">Syny ugrat</el-button>
              </template>
            </el-dialog>

            <!-- Comments List -->
            <div v-if="comments.length === 0" class="text-center py-8">
              <el-icon class="text-5xl text-gray-300 mb-3"><ChatDotRound /></el-icon>
              <p class="text-gray-500 mb-4">Entek syn ýok. Bu haryt üçin ilkinji syny ýazyň!</p>
              <button @click="showReviewForm = true" class="btn-primary">Syn ýaz</button>
            </div>

            <div v-else class="space-y-6">
              <div 
                v-for="comment in comments" 
                :key="comment.id" 
                class="border-b border-gray-100 pb-6 last:border-0 last:pb-0"
              >
                <div class="flex items-start gap-4">
                  <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-semibold shrink-0">
                    {{ comment.userName.charAt(0).toUpperCase() }}
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <span class="font-semibold text-gray-900">{{ comment.userName }}</span>
                      <el-rate :model-value="comment.rating" disabled size="small" />
                    </div>
                    <h4 class="font-medium text-gray-800 mb-1">{{ comment.title }}</h4>
                    <p class="text-gray-600 text-sm mb-3">{{ comment.content }}</p>
                    <div class="flex items-center gap-4 text-sm">
                      <span class="text-gray-400">{{ formatDate(comment.createdAt) }}</span>
                      <button 
                        @click="markHelpful(comment)" 
                        class="flex items-center gap-1 text-gray-500 hover:text-red-600 transition-colors"
                      >
                        <el-icon><ThumbUp /></el-icon>
                        Peýdaly ({{ comment.helpful }})
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
            class="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-14 h-14 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <el-icon class="text-3xl"><ArrowLeft /></el-icon>
          </button>

          <!-- Next Button -->
          <button 
            @click.stop="nextImage" 
            class="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-14 h-14 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
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
</style>
