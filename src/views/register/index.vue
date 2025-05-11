<template>
  <div class="register-wrapper">
    <div class="register-container">
      <div class="register-left">
        <div class="register-left__header">
          <img src="@/assets/logo.svg" class="logo" alt="Logo">
          <h2>WFH Blog Admin</h2>
        </div>
        <div class="register-left__content">
          <h3>开箱即用的中后台管理系统</h3>
          <p>基于 Vue3 + TypeScript + Element Plus + Vite</p>
        </div>
        <div class="register-left__footer">
          <p>Copyright © 2024 WFH Blog Admin</p>
        </div>
      </div>
      <div class="register-right">
        <div class="register-right__header">
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
        <div class="register-right__content">
          <div class="register-form">
            <h2>创建账号 🎉</h2>
            <p class="sub-title">请填写以下信息完成注册</p>
            <el-form
              ref="formRef"
              :model="registerForm"
              :rules="registerRules"
              size="large"
            >
              <el-form-item prop="username">
                <el-input
                  v-model="registerForm.username"
                  placeholder="请输入用户名"
                  :prefix-icon="User"
                />
              </el-form-item>

              <el-form-item prop="email">
                <el-input
                  v-model="registerForm.email"
                  placeholder="请输入邮箱"
                  :prefix-icon="Message"
                />
              </el-form-item>

              <el-form-item prop="password">
                <el-input
                  v-model="registerForm.password"
                  type="password"
                  placeholder="请输入密码"
                  :prefix-icon="Lock"
                  show-password
                />
              </el-form-item>

              <el-form-item prop="confirmPassword">
                <el-input
                  v-model="registerForm.confirmPassword"
                  type="password"
                  placeholder="请确认密码"
                  :prefix-icon="Lock"
                  show-password
                />
              </el-form-item>

              <el-form-item prop="captcha">
                <div class="captcha-container">
                  <el-input
                    v-model="registerForm.captcha"
                    placeholder="请输入验证码"
                    :prefix-icon="Key"
                  />
                  <div class="captcha-img" @click="refreshCaptcha">
                    <img :src="captchaUrl" alt="验证码">
                  </div>
                </div>
              </el-form-item>

              <div class="form-footer">
                <el-checkbox v-model="agreeTerms">我已阅读并同意<a href="#" class="terms-link">服务条款</a>和<a href="#" class="terms-link">隐私政策</a></el-checkbox>
              </div>

              <el-button
                type="primary"
                class="submit-btn"
                :loading="loading"
                :disabled="!agreeTerms"
                @click="handleRegister"
              >
                {{ loading ? '注册中...' : '注册' }}
              </el-button>

              <div class="register-footer">
                <p>已有账号？<router-link to="/login" class="login-link">立即登录</router-link></p>
              </div>
            </el-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  User, Lock, Key, Link, Document, Message
} from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import { useDark, useToggle } from '@vueuse/core'
import { getCaptcha, register as registerApi } from '@/api/user'
import { debounce } from 'lodash-es'

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)
const agreeTerms = ref(false)
const isDark = useDark()
const toggleDark = useToggle(isDark)
const captchaIdRef = ref('')
const captchaUrl = ref('')

const registerForm = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  captcha: ''
})

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 4, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value !== registerForm.value.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 4, max: 6, message: '验证码长度不正确', trigger: 'blur' }
  ]
}

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

const savedUsername = localStorage.getItem('savedUsername');

onMounted(() => {
  getCaptchaImg();
  if (savedUsername) {
    registerForm.value.username = savedUsername;
  }
});

const refreshCaptcha = () => {
  getCaptchaImg();
};

const handleError = (error: any) => {
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
        ElMessage.error('操作过于频繁，请稍后再试');
        break;
      default:
        ElMessage.error(`注册失败（${status}），请重试`);
    }
  } else if (error && error.message) {
    if (error.message.includes('Network Error')) {
      ElMessage.error('网络错误，无法连接到服务器');
    } else if (error.message.includes('timeout')) {
      ElMessage.error('请求超时，请检查网络');
    } else {
      ElMessage.error(`请求失败：${error.message}`);
    }
    console.error('请求异常:', error);
  } else {
    ElMessage.error('未知错误，请检查网络或联系管理员');
    console.error('未知错误:', error);
  }
  getCaptchaImg();
};

const handleRegister = debounce(async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    loading.value = true;
    const registerParams = {
      username: registerForm.value.username,
      password: registerForm.value.password,
      confirmPassword: registerForm.value.confirmPassword,
      email: registerForm.value.email,
      captchaId: captchaIdRef.value,
      captcha: registerForm.value.captcha
    };
    const res = await registerApi(registerParams);
    if ((res.code === 0 || res.code === 200)) {
      ElMessage.success('注册成功，请登录');
      router.push('/login');
    } else {
      handleError(res);
    }
  } catch (error) {
    handleError(error);
  } finally {
    loading.value = false;
  }
}, 300);

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
    getCaptchaImg();
  }
};
</script>

<style scoped>
.register-wrapper {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: var(--el-bg-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.register-container {
  width: 100%;
  height: 100%;
  display: flex;
  background-color: var(--el-bg-color);
}

.register-left {
  width: 500px;
  height: 100%;
  background: linear-gradient(180deg, var(--el-color-primary) 0%, var(--el-color-primary-light-3) 100%);
  padding: 40px;
  display: flex;
  flex-direction: column;
  color: #fff;
}

.register-left__header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.register-left__header .logo {
  width: 48px;
  height: 48px;
}

.register-left__header h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.register-left__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.register-left__content h3 {
  font-size: 36px;
  font-weight: 600;
  margin: 0 0 16px 0;
  line-height: 1.4;
}

.register-left__content p {
  font-size: 16px;
  margin: 0;
  opacity: 0.8;
}

.register-left__footer p {
  margin: 0;
  font-size: 14px;
  opacity: 0.8;
}

.register-right {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.register-right__header {
  height: 60px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 40px;
}

.register-right__header .actions {
  display: flex;
  gap: 12px;
}

.register-right__header .action-item {
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

.register-right__header .action-item:hover {
  color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}

.register-right__content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.register-form {
  width: 400px;
}

.register-form h2 {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: var(--el-text-color-primary);
}

.register-form .sub-title {
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
  margin: 0 0 24px 0;
}

.terms-link {
  color: var(--el-color-primary);
  text-decoration: none;
}

.terms-link:hover {
  text-decoration: underline;
}

.submit-btn {
  width: 100%;
  height: 40px;
  font-size: 16px;
  font-weight: 500;
}

.register-footer {
  margin-top: 24px;
  text-align: center;
  color: var(--el-text-color-regular);
}

.login-link {
  color: var(--el-color-primary);
  text-decoration: none;
  font-weight: 500;
}

.login-link:hover {
  text-decoration: underline;
}

@media (max-width: 992px) {
  .register-left {
    display: none;
  }
}

@media (max-width: 640px) {
  .register-form {
    width: 90%;
    padding: 20px;
  }

  .register-right__header {
    padding: 0 20px;
  }
}
</style> 