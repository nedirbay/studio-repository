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
    component: () => import('../views/LoginPage.vue'),
    meta: { hideLayout: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterPage.vue'),
    meta: { hideLayout: true }
  },
  {
    path: '/admin',
    component: () => import('../components/layout/AdminLayout.vue'),
    meta: { requiresAuth: true },
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

// Navigation Guard
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  let user = {}
  try {
    const rawUser = localStorage.getItem('user')
    user = rawUser ? JSON.parse(rawUser) : {}
  } catch (err) {
    console.error('Failed to parse user from localStorage', err)
    user = {}
  }
  
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  
  // Check if it's an admin route
  const isAdminRoute = to.path.startsWith('/admin')

  if (requiresAuth && !token) {
    next('/login')
  } else if (isAdminRoute) {
    // Basic RBAC check
    if (user.role_name === 'Admin' || user.is_superuser) {
      next()
    } else {
      ElMessage.warning('Bu sahypa diňe administratorlar üçin')
      next('/')
    }
  } else if (to.path === '/login' && token) {
    // Redirect already logged in users to appropriate page
    if (user.role_name === 'Admin' || user.is_superuser) {
      next('/admin/dashboard')
    } else {
      next('/')
    }
  } else {
    next()
  }
})

export default router
