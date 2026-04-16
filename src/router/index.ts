import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import ProductsPage from '../views/ProductsPage.vue'
import ProductDetailPage from '../views/ProductDetailPage.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/products',
    name: 'Products',
    component: ProductsPage
  },
  {
    path: '/products/:category',
    name: 'ProductsByCategory',
    component: ProductsPage
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: ProductDetailPage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
