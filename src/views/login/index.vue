<template>
  <div class="login-wrapper">
    <div class="login-container">
      <div class="login-left">
        <div class="login-left__header">
          <img src="@/assets/logo.svg" class="logo" alt="Logo">
          <h2>WFH Blog Admin</h2>
        </div>
        <div class="login-left__content">
          <h3>欢迎来到我的博客</h3>
          <p>基于 Vue3 + TypeScript + Element Plus + Vite</p>
        </div>
        <div class="login-left__footer">
          <p>Copyright © 2024 wfh Blog Admin</p>
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
                  <div
                      v-for="item in socialIcons"
                      :key="item.icon"
                      class="social-item"
                  >
                    <el-tooltip :content="item.title" placement="top">
                      <component :is="item.icon" />
                    </el-tooltip>
                  </div>
                </div>
              </div>
            </el-form>
          </div>
        </div>
        <div class="login-right__footer">
          <p>还没有账号？<router-link to="/register" class="register-link">立即注册</router-link></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  User, Lock, Key, Link, Document, Iphone, Message,
  GithubFilled, Wechat, AlipayCircleFilled, GoogleCircleFilled
} from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import { useDark, useToggle } from '@vueuse/core'
import { getCaptcha, login as loginApi } from '@/api/user'
import { debounce } from 'lodash-es'

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)
const rememberMe = ref(false)
const isDark = useDark()
const toggleDark = useToggle(isDark)
const captchaIdRef = ref('')
const captchaUrl = ref('')
const activeTab = ref('account')
const timer = ref<number | null>(null)
const countdown = ref(60)
const savedUsername = localStorage.getItem('savedUsername')

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
  phone: [],
  smsCode: [],
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

// 获取验证码图片
async function getCaptchaImg() {
  try {
    const response = await fetch('http://localhost:8080/api/captcha/image', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const captchaId = response.headers.get('X-Captcha-Id');
    console.log('获取到的验证码ID:', captchaId);
    const imageBlob = await response.blob();
    const imageUrl = URL.createObjectURL(imageBlob);
    captchaIdRef.value = captchaId || '';
    captchaUrl.value = imageUrl;
  } catch (error) {
    console.error('获取验证码失败:', error);
    ElMessage.error('获取验证码失败');
  }
}

const refreshCaptcha = () => {
  getCaptchaImg();
};

const handleError = (error: any) => {
  // 有 response 说明是后端返回的错误
  if (error && error.response) {
    const status = error.response.status;
    switch (status) {
      case 401:
        ElMessage.error('用户名或密码错误');
        break;
      case 403:
        ElMessage.error('验证码错误');
        break;
      case 429:
        ElMessage.error('登录尝试次数过多，请稍后再试');
        break;
      default:
        ElMessage.error(`登录失败（${status}），请重试`);
    }
  } else if (error && error.message) {
    // 网络错误或请求未发出
    if (error.message.includes('Network Error')) {
      ElMessage.error('网络错误，无法连接到服务器');
    } else if (error.message.includes('timeout')) {
      ElMessage.error('请求超时，请检查网络');
    } else {
      ElMessage.error(`请求失败：${error.message}`);
    }
    // 控制台输出详细错误
    console.error('请求异常:', error);
  } else {
    ElMessage.error('未知错误，请检查网络或联系管理员');
    console.error('未知错误:', error);
  }
  getCaptchaImg();
};

const handleLogin = debounce(async () => {
  if (!formRef.value) return;
  try {
    console.log('开始登录验证...');

    // 根据当前tab设置要验证的规则
    const rules = activeTab.value === 'account'
        ? {
          username: loginRules.username,
          password: loginRules.password,
          captcha: loginRules.captcha
        }
        : {
          phone: loginRules.phone,
          smsCode: loginRules.smsCode
        };

    // 临时设置验证规则
    formRef.value.rules = rules;

    // 执行验证
    await formRef.value.validate();
    console.log('表单验证通过');
    loading.value = true;

    // 只处理账号登录
    if (activeTab.value === 'account') {
      const loginParams = {
        username: loginForm.value.username,
        password: loginForm.value.password,
        captchaId: captchaIdRef.value,
        captcha: loginForm.value.captcha,
        rememberMe: rememberMe.value
      };
      console.log('登录参数:', { ...loginParams, password: '******' });
      console.log('发送登录请求...');
      const res = await loginApi(loginParams);
      console.log('登录响应:', res);
      if ((res.code === 0 || res.code === 200) && res.data?.token) {
        localStorage.setItem('userInfo', JSON.stringify(res.data));
        ElMessage.success('登录成功');
        router.push('/');
      } else {
        handleError(res);
      }
    } else {
      ElMessage.info('手机号登录功能暂未开放');
    }
  } catch (error) {
    console.error('登录错误:', error);
    handleError(error);
  } finally {
    loading.value = false;
    // 恢复原始验证规则
    formRef.value.rules = loginRules;
  }
}, 300);

// 记住账号
watch(rememberMe, (newVal) => {
  if (newVal) {
    localStorage.setItem('savedUsername', loginForm.value.username);
  } else {
    localStorage.removeItem('savedUsername');
  }
});

onMounted(() => {
  getCaptchaImg();
  if (savedUsername) {
    loginForm.value.username = savedUsername;
    rememberMe.value = true;
  }
});

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
    getCaptchaImg();
  }
};

// 处理发送验证码
const handleSendCode = () => {
  ElMessage.info('此功能未开发');
};

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