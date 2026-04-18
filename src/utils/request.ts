import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from 'axios'
import { logoutApp } from '../helper'
import { ElMessage } from 'element-plus'
import router from '../router'

export const baseURL = 'http://localhost:8000/api'
export const baseMediaURL = 'http://localhost:8000'

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
        // Only redirect if it's not the verify endpoint, or if we want to force it
        // For debugging, let's see why it fails first
        console.warn('401 Unauthorized detected')

        if (!error.config.url?.includes('/auth/verify')) {
          ElMessage({
            message: 'Täzeden ulgama giriň',
            type: 'error',
            duration: 5 * 1000,
          })
          logoutApp()
          router.push('/login')
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
