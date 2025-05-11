import axios from 'axios'
import router from '@/router'

const request = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 登出方法
export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('tokenExpire')
  router.push('/login')
}

// 请求拦截器，自动加 token 并判断过期
request.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  const tokenExpire = Number(localStorage.getItem('tokenExpire'))
  if (token && tokenExpire && Date.now() < tokenExpire) {
    config.headers['Authorization'] = `Bearer ${token}`
  } else if (token) {
    // token 过期，清除并跳转登录
    logout()
    return Promise.reject(new Error('token expired'))
  }
  return config
})

// 响应拦截器，401跳转登录
request.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response && error.response.status === 401) {
      logout()
    }
    return Promise.reject(error)
  }
)

export default request 