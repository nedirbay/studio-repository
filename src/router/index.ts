import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import ProductsPage from '../views/ProductsPage.vue'
import ProductDetailPage from '../views/ProductDetailPage.vue'
import DealsPage from '../views/DealsPage.vue'
import NewArrivalsPage from '../views/NewArrivalsPage.vue'
import SupportPage from '../views/SupportPage.vue'

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
  },
  {
    path: '/deals',
    name: 'Deals',
    component: DealsPage
  },
  {
    path: '/new-arrivals',
    name: 'NewArrivals',
    component: NewArrivalsPage
  },
  {
    path: '/support',
    name: 'Support',
    component: SupportPage
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginPage.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterPage.vue')
  },
  {
    path: '/admin',
    component: () => import('../components/layout/AdminLayout.vue'),
    redirect: '/admin/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('../views/admin/AdminDashboard.vue')
      },
      {
        path: 'categories',
        name: 'AdminCategories',
        component: () => import('../views/admin/AdminCategories.vue')
      },
      {
        path: 'products',
        name: 'AdminProducts',
        component: () => import('../views/admin/AdminProducts.vue')
      },
      {
        path: 'orders',
        name: 'AdminOrders',
        component: () => import('../views/admin/AdminOrders.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
