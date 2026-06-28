import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'


export const baseURL = import.meta.env.PROD
  ? '/api'
  : 'http://127.0.0.1:8000/api'

export const baseMediaURL = import.meta.env.PROD
  ? ''
  : 'http://127.0.0.1:8000'

const ServiceGenerate = () => {
  const service = axios.create({
    baseURL,
    timeout: 0,
  })
  service.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data)
    return AuthConfig(config)
  }, ErrorHandler)
  service.interceptors.response.use(
    (response: AxiosResponse) => {
      console.log(`API Response: ${response.config.url}`, response.data)
      return response
    },
    async (error: any) => {
      console.error(`API Error: ${error.config?.url}`, error.response || error)
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors
        for (const key of Object.keys(errors)) {
          setTimeout(() => {
            ElMessage({
              message: errors[key][0],
              type: 'error',
              duration: 8000,
            })
          }, 0.5 * 1000)
        }
      } else if (error.response?.status === 403) {
        ElMessage({
          message: 'Bu sahyp rugsadyňyz ýok',
          type: 'error',
          duration: 5 * 1000,
        })
      } else if (error.response?.status === 401) {
        console.warn('401 Unauthorized detected')

        // Clear local storage tokens immediately so subsequent requests don't use them
        localStorage.removeItem('token')
        localStorage.removeItem('user')

        // Notify store to reset its reactive state (avoids circular dependency)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('unauthorized'))
        }

        // Check if the current route actually requires authentication
        const currentRoute = router.currentRoute.value
        const requiresAuth = currentRoute?.matched.some(record => record.meta.requiresAuth) || currentRoute?.path.startsWith('/admin')

        if (requiresAuth && !error.config.url?.includes('/auth/verify')) {
          ElMessage({
            message: 'Täzeden ulgama giriň',
            type: 'error',
            duration: 5 * 1000,
          })
          router.push({ path: '/login', query: { redirect: currentRoute.fullPath } })
        }
      } else if (!axios?.isCancel(error)) {
        ElMessage({
          message: error?.response?.data?.message
            ? error?.response?.data?.message
            : 'Ýalňyşlyk ýüze çykdy',
          type: 'error',
          duration: 5 * 1000,
        })
      }
      return Promise.reject(error)
    },
  )
  return service
}

const AuthConfig = (config: InternalAxiosRequestConfig) => {
  // Add X-Access-Token header to every request, you can add other custom headers here

  if (localStorage.getItem('token')) {
    config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`
  }

  // config!.headers!["language"] = `${localStorage.getItem("user-locale")}`;
  return config
}

const ErrorHandler = (error: any) => {
  Promise.reject(error)
}

export default ServiceGenerate

/* "build": "run-p type-check \"build-only {@}\" --", */
