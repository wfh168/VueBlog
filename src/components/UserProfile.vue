<template>
  <div class="user-profile-vertical-wrapper">
    <el-card class="user-profile-card">
      <div class="profile-header">
        <div class="avatar-upload-wrapper">
          <el-upload
            class="avatar-uploader"
            :show-file-list="false"
            :before-upload="beforeAvatarUpload"
            :on-change="handleAvatarChange"
            accept="image/*"
          >
            <el-avatar :size="80" :src="avatarPreview || info.avatar || defaultAvatar" class="avatar-clickable" />
          </el-upload>
        </div>
        <div class="profile-basic">
          <div class="profile-username">{{ info.username }}</div>
          <div class="profile-role">角色：{{ info.role }}</div>
          <div class="profile-email" v-if="info.email">邮箱：{{ info.email }}</div>
        </div>
      </div>
    </el-card>
    <el-card class="change-password-card">
      <div class="change-title">修改密码</div>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="90px" class="change-form">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="form.oldPassword" type="password" autocomplete="off" />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="form.newPassword" type="password" autocomplete="off" />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" autocomplete="off" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleChangePassword" style="width: 100%">修改密码</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElAvatar, ElCard, ElForm, ElFormItem, ElInput, ElButton, ElMessage, ElUpload } from 'element-plus'
const props = defineProps({
  userInfo: {
    type: Object,
    default: null
  }
})
const defaultAvatar = '/src/assets/avatar.png'
const info = computed(() => {
  if (props.userInfo) return props.userInfo
  const local = localStorage.getItem('userInfo')
  if (local) return JSON.parse(local)
  return { username: '未登录', avatar: defaultAvatar, role: '', email: '' }
})

const avatarPreview = ref('')
function beforeAvatarUpload(file: File) {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过2MB!')
    return false
  }
  return true
}
function handleAvatarChange(file: any) {
  if (file && file.raw) {
    avatarPreview.value = URL.createObjectURL(file.raw)
    // TODO: 这里可调用后端API上传头像，成功后刷新info.avatar
    ElMessage.success('头像已预览，实际保存请对接API')
  }
}

const formRef = ref()
const form = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const rules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '新密码至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: (rule: any, value: string, callback: any) => {
      if (value !== form.value.newPassword) {
        callback(new Error('两次输入的新密码不一致'))
      } else {
        callback()
      }
    }, trigger: 'blur' }
  ]
}
const handleChangePassword = () => {
  formRef.value.validate((valid: boolean) => {
    if (!valid) return
    // TODO: 调用后端API修改密码
    ElMessage.success('密码修改成功（示例，无实际请求）')
    form.value.oldPassword = ''
    form.value.newPassword = ''
    form.value.confirmPassword = ''
  })
}
</script>

<style scoped>
.user-profile-vertical-wrapper {
  margin: 60px auto;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
}
.user-profile-card,
.change-password-card {
  width: 100%;
  min-height: 220px;
  margin-bottom: 0;
  box-sizing: border-box;
  padding: 32px 0 28px 0;
}
.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
}
.avatar-upload-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.avatar-uploader {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.avatar-clickable {
  cursor: pointer;
  transition: box-shadow 0.2s, filter 0.2s;
}
.avatar-clickable:hover {
  box-shadow: 0 0 0 4px var(--el-color-primary-light-7);
  filter: brightness(1.10);
}
.profile-basic {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}
.profile-username {
  font-size: 26px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}
.profile-role {
  font-size: 17px;
  color: var(--el-color-primary);
}
.profile-email {
  font-size: 16px;
  color: var(--el-text-color-regular);
}
.change-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 24px;
  color: var(--el-text-color-primary);
  text-align: center;
}
.change-form {
  max-width: 400px;
  width: 100%;
  margin: 0 auto;
}
.el-avatar.avatar-clickable {
  width: 100px !important;
  height: 100px !important;
  font-size: 48px !important;
}
@media (max-width: 768px) {
  .user-profile-vertical-wrapper {
    margin: 16px 0 0 0;
    padding: 0 8px;
    max-width: 100%;
    gap: 18px;
  }
  .user-profile-card,
  .change-password-card {
    min-width: 0;
    width: 100%;
    box-sizing: border-box;
    padding: 18px 0 14px 0;
  }
  .profile-header {
    gap: 12px;
  }
  .profile-username {
    font-size: 20px;
  }
  .profile-role {
    font-size: 14px;
  }
  .profile-email {
    font-size: 13px;
  }
  .change-title {
    font-size: 17px;
    margin-bottom: 14px;
  }
  .change-form {
    max-width: 100%;
  }
  .el-avatar.avatar-clickable {
    width: 70px !important;
    height: 70px !important;
    font-size: 32px !important;
  }
}
</style> 