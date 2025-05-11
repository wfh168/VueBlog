import request from './request'

// 获取验证码
export function getCaptcha(type = 'char') {
  return request.get('/captcha/image', { params: { type } })
}



// 注册
export async function register(data: {
  username: string
  password: string
  confirmPassword: string
  email: string
  captchaId: string
  captcha: string
}) {
  const res = await request.post('/users/register', data)
  // 注册成功后不自动登录
  return res
}

// 登录
export async function login(data: {
  username: string
  password: string
  captchaId: string
  captcha: string
  rememberMe?: boolean
}) {
  const res = await request.post('/users/login', data)
  // 登录成功时存储token和过期时间
  if (res && res.data && res.data.token && res.data.expiresIn) {
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('tokenExpire', (Date.now() + res.data.expiresIn * 1000).toString())
  }
  return res
} 