<template>
  <div class="login-wrapper">
    <div class="login-container">
      <div class="login-left">
        <div class="login-left__header">
          <img src="@/assets/logo.svg" class="logo" alt="Logo">
          <h2>Vue Blog Admin</h2>
        </div>
        <div class="login-left__content">
          <h3>开箱即用的中后台管理系统</h3>
          <p>基于 Vue3 + TypeScript + Element Plus + Vite</p>
        </div>
        <div class="login-left__footer">
          <p>Copyright © 2024 Vue Blog Admin</p>
        </div>
      </div>
      <div class="login-right">
        <div class="login-right__header">
          <div class="actions">
            <el-tooltip content="切换主题" placement="bottom">
              <div class="action-item" @click="toggleDark()">
                <el-icon><component :is="isDark ? 'Sunny' : 'Moon'" /></el-icon>
              </div>
            </el-tooltip>
            <el-tooltip content="文档" placement="bottom">
              <div class="action-item">
                <el-icon><Document /></el-icon>
              </div>
            </el-tooltip>
            <el-tooltip content="Github" placement="bottom">
              <div class="action-item">
                <el-icon><Link /></el-icon>
              </div>
            </el-tooltip>
          </div>
        </div>
        <div class="login-right__content">
          <div class="login-form">
            <h2>欢迎回来 👋</h2>
            <p class="sub-title">请输入您的账户信息以开始管理您的项目</p>
            <el-form
              ref="formRef"
              :model="loginForm"
              :rules="loginRules"
              size="large"
            >
              <el-tabs v-model="activeTab" class="login-tabs">
                <el-tab-pane label="账号登录" name="account">
                  <el-form-item prop="username">
                    <el-input
                      v-model="loginForm.username"
                      placeholder="请输入用户名"
                      :prefix-icon="User"
                    />
                  </el-form-item>

                  <el-form-item prop="password">
                    <el-input
                      v-model="loginForm.password"
                      type="password"
                      placeholder="请输入密码"
                      :prefix-icon="Lock"
                      show-password
                      @keyup.enter="handleLogin"
                    />
                  </el-form-item>
                </el-tab-pane>

                <el-tab-pane label="手机号登录" name="phone">
                  <el-form-item prop="phone">
                    <el-input
                      v-model="loginForm.phone"
                      placeholder="请输入手机号"
                      :prefix-icon="Iphone"
                      maxlength="11"
                    />
                  </el-form-item>

                  <el-form-item prop="smsCode">
                    <div class="sms-code-container">
                      <el-input
                        v-model="loginForm.smsCode"
                        placeholder="请输入验证码"
                        :prefix-icon="Message"
                        maxlength="6"
                      />
                      <el-button 
                        type="primary" 
                        class="send-code-btn"
                        :disabled="!!timer"
                        @click="handleSendCode"
                      >
                        {{ timer ? `${countdown}s后重新获取` : '获取验证码' }}
                      </el-button>
                    </div>
                  </el-form-item>
                </el-tab-pane>
              </el-tabs>

              <el-form-item prop="captcha">
                <div class="captcha-container">
                  <el-input
                    v-model="loginForm.captcha"
                    placeholder="请输入验证码"
                    :prefix-icon="Key"
                    @keyup.enter="handleLogin"
                  />
                  <div class="captcha-img" @click="refreshCaptcha">
                    <img :src="captchaUrl" alt="验证码">
                  </div>
                </div>
              </el-form-item>

              <div class="form-footer">
                <el-checkbox v-model="rememberMe">记住账号</el-checkbox>
                <el-link type="primary" :underline="false">忘记密码？</el-link>
              </div>

              <el-button
                type="primary"
                class="submit-btn"
                :loading="loading"
                @click="handleLogin"
              >
                {{ loading ? '登录中...' : '登录' }}
              </el-button>

              <div class="other-login">
                <div class="divider">
                  <span>其他登录方式</span>
                </div>
                <div class="social-list">
                  <div class="social-item" v-for="item in socialIcons" :key="item.icon">
                    <el-tooltip :content="item.title" placement="top">
                      <el-icon>
                        <component :is="item.icon" />
                      </el-icon>
                    </el-tooltip>
                  </div>
                </div>
              </div>
            </el-form>
          </div>
        </div>
        <div class="login-right__footer">
          <p>还没有账号？<el-link type="primary" :underline="false">立即注册</el-link></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Key, Link, Document, Iphone, Message } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import { useDark, useToggle } from '@vueuse/core'

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)
const rememberMe = ref(false)
const isDark = useDark()
const toggleDark = useToggle(isDark)
const captchaUrl = ref('https://api.example.com/captcha')
const activeTab = ref('account')
const timer = ref<number | null>(null)
const countdown = ref(60)

const loginForm = ref({
  username: '',
  password: '',
  phone: '',
  smsCode: '',
  captcha: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^[0-9]{11}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  smsCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { pattern: /^[0-9]{6}$/, message: '请输入6位数字验证码', trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 4, max: 6, message: '验证码长度不正确', trigger: 'blur' }
  ]
}

const socialIcons = [
  { icon: 'GithubFilled', title: 'Github登录' },
  { icon: 'Wechat', title: '微信登录' },
  { icon: 'AlipayCircleFilled', title: '支付宝登录' },
  { icon: 'GoogleCircleFilled', title: 'Google登录' }
]

const refreshCaptcha = () => {
  captchaUrl.value = `https://api.example.com/captcha?t=${Date.now()}`
}

const handleLogin = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    // 模拟登录请求
    setTimeout(() => {
      loading.value = false
      ElMessage.success('登录成功')
      router.push('/')
    }, 1500)
    
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 处理发送验证码
const handleSendCode = async () => {
  try {
    await formRef.value?.validateField('phone')
    // 开始倒计时
    countdown.value = 60
    timer.value = window.setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        if (timer.value) {
          clearInterval(timer.value)
          timer.value = null
        }
      }
    }, 1000)
    
    // 这里应该调用发送验证码的接口
    ElMessage.success('验证码已发送')
  } catch (error) {
    // 手机号验证失败
    console.error('手机号验证失败:', error)
  }
}

// 在组件卸载时清除定时器
onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
})
</script>

<style scoped>
.login-wrapper {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: var(--el-bg-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-container {
  width: 100%;
  height: 100%;
  display: flex;
  background-color: var(--el-bg-color);
}

.login-left {
  width: 500px;
  height: 100%;
  background: linear-gradient(180deg, var(--el-color-primary) 0%, var(--el-color-primary-light-3) 100%);
  padding: 40px;
  display: flex;
  flex-direction: column;
  color: #fff;
}

.login-left__header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.login-left__header .logo {
  width: 48px;
  height: 48px;
}

.login-left__header h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.login-left__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-left__content h3 {
  font-size: 36px;
  font-weight: 600;
  margin: 0 0 16px 0;
  line-height: 1.4;
}

.login-left__content p {
  font-size: 16px;
  margin: 0;
  opacity: 0.8;
}

.login-left__footer p {
  margin: 0;
  font-size: 14px;
  opacity: 0.8;
}

.login-right {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.login-right__header {
  height: 60px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 40px;
}

.login-right__header .actions {
  display: flex;
  gap: 12px;
}

.login-right__header .action-item {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--el-text-color-regular);
  transition: all 0.3s;
}

.login-right__header .action-item:hover {
  color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}

.login-right__content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-right__footer {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-regular);
}

.login-right__footer p {
  margin: 0;
  font-size: 14px;
}

.login-form {
  width: 400px;
}

.login-form h2 {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: var(--el-text-color-primary);
}

.login-form .sub-title {
  font-size: 16px;
  color: var(--el-text-color-secondary);
  margin: 0 0 40px 0;
}

:deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--el-border-color) !important;
  height: 44px;
  padding: 0 16px;
}

:deep(.el-input__wrapper:hover),
:deep(.el-input__wrapper:focus-within) {
  box-shadow: 0 0 0 1px var(--el-color-primary) !important;
}

:deep(.el-input__inner) {
  font-size: 14px;
}

:deep(.el-input__prefix-inner) {
  margin-right: 8px;
}

.captcha-container {
  display: flex;
  gap: 12px;
}

.captcha-container .el-input {
  flex: 1;
}

.captcha-container .captcha-img {
  width: 120px;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid var(--el-border-color);
  transition: all 0.3s;
}

.captcha-container .captcha-img:hover {
  border-color: var(--el-color-primary);
}

.captcha-container .captcha-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 0 24px 0;
}

.submit-btn {
  width: 100%;
  height: 40px;
  font-size: 16px;
  font-weight: 500;
}

.other-login {
  margin-top: 40px;
  text-align: center;
}

.other-login .divider {
  position: relative;
  margin: 24px 0;
}

.other-login .divider::before,
.other-login .divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: calc(50% - 80px);
  height: 1px;
  background-color: var(--el-border-color);
}

.other-login .divider::before {
  left: 0;
}

.other-login .divider::after {
  right: 0;
}

.other-login .divider span {
  color: var(--el-text-color-secondary);
  font-size: 14px;
  padding: 0 16px;
  background-color: var(--el-bg-color);
}

.other-login .social-list {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.other-login .social-item {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--el-fill-color-light);
  cursor: pointer;
  transition: all 0.3s;
}

.other-login .social-item:hover {
  transform: translateY(-2px);
  background-color: var(--el-color-primary-light-9);
}

.other-login .social-item:hover .el-icon {
  color: var(--el-color-primary);
}

.other-login .social-item .el-icon {
  font-size: 20px;
  color: var(--el-text-color-regular);
  transition: all 0.3s;
}

@media (max-width: 992px) {
  .login-left {
    display: none;
  }
}

@media (max-width: 640px) {
  .login-form {
    width: 90%;
    padding: 20px;
  }

  .login-right__header {
    padding: 0 20px;
  }
}

.login-tabs {
  margin-bottom: 20px;
}

:deep(.el-tabs__nav) {
  width: 100%;
  display: flex;
}

:deep(.el-tabs__item) {
  flex: 1;
  text-align: center;
  font-size: 16px;
}

.sms-code-container {
  display: flex;
  gap: 12px;
}

.sms-code-container .el-input {
  flex: 1;
}

.send-code-btn {
  width: 120px;
  white-space: nowrap;
}
</style> 