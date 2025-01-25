<template>
  <div class="user-info-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>用户信息管理</span>
          <el-button type="primary" @click="handleAdd">新增用户</el-button>
        </div>
      </template>
      <el-table :data="users" style="width: 100%" v-loading="loading">
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="role" label="角色">
          <template #default="{ row }">
            <el-tag :type="getRoleType(row.role)">
              {{ getRoleLabel(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="注册时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="{ row }">
            <el-space>
              <el-button type="primary" size="small" @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button type="info" size="small" @click="handleViewProfile(row)">
                查看资料
              </el-button>
              <el-button 
                :type="row.status === 'active' ? 'danger' : 'success'"
                size="small" 
                @click="handleToggleStatus(row)"
              >
                {{ row.status === 'active' ? '禁用' : '启用' }}
              </el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 用户编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增用户' : '编辑用户'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="dialogType === 'add'">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色" class="w-full">
            <el-option label="管理员" value="admin" />
            <el-option label="作者" value="author" />
            <el-option label="读者" value="reader" />
          </el-select>
        </el-form-item>
        <el-form-item label="头像" prop="avatar_url">
          <el-upload
            class="avatar-uploader"
            action="/api/upload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="form.avatar_url" :src="form.avatar_url" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="简介" prop="bio">
          <el-input
            v-model="form.bio"
            type="textarea"
            :rows="3"
            placeholder="请输入用户简介"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 用户资料对话框 -->
    <el-dialog
      v-model="profileDialogVisible"
      title="用户资料"
      width="600px"
    >
      <div v-if="selectedUser" class="user-profile">
        <div class="profile-header">
          <el-avatar :size="80" :src="selectedUser.avatar_url" />
          <div class="profile-info">
            <h3>{{ selectedUser.username }}</h3>
            <p>{{ getRoleLabel(selectedUser.role) }}</p>
          </div>
        </div>
        <div class="profile-content">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="邮箱">{{ selectedUser.email }}</el-descriptions-item>
            <el-descriptions-item label="注册时间">{{ formatDate(selectedUser.created_at) }}</el-descriptions-item>
            <el-descriptions-item label="最后更新">{{ formatDate(selectedUser.updated_at) }}</el-descriptions-item>
            <el-descriptions-item label="简介">{{ selectedUser.bio || '暂无简介' }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, UploadProps } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

interface User {
  user_id: number
  username: string
  email: string
  avatar_url?: string
  bio?: string
  role: 'admin' | 'author' | 'reader'
  created_at: string
  updated_at: string
  status: 'active' | 'inactive'
}

interface UserForm {
  username: string
  email: string
  password?: string
  avatar_url?: string
  bio?: string
  role: 'admin' | 'author' | 'reader'
}

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const profileDialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const formRef = ref<FormInstance>()
const selectedUser = ref<User | null>(null)

const form = ref<UserForm>({
  username: '',
  email: '',
  password: '',
  avatar_url: '',
  bio: '',
  role: 'reader'
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于 6 个字符', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

// 模拟数据
const users = ref<User[]>([
  {
    user_id: 1,
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
    avatar_url: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    bio: '系统管理员',
    created_at: '2024-03-20 10:00:00',
    updated_at: '2024-03-20 10:00:00',
    status: 'active'
  },
  {
    user_id: 2,
    username: 'author',
    email: 'author@example.com',
    role: 'author',
    avatar_url: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    bio: '内容创作者',
    created_at: '2024-03-19 15:30:00',
    updated_at: '2024-03-19 15:30:00',
    status: 'active'
  }
])

const getRoleType = (role: string) => {
  const types: Record<string, string> = {
    admin: 'danger',
    author: 'warning',
    reader: 'info'
  }
  return types[role] || 'info'
}

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    admin: '管理员',
    author: '作者',
    reader: '读者'
  }
  return labels[role] || role
}

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const resetForm = () => {
  form.value = {
    username: '',
    email: '',
    password: '',
    avatar_url: '',
    bio: '',
    role: 'reader'
  }
}

const handleAdd = () => {
  dialogType.value = 'add'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: User) => {
  dialogType.value = 'edit'
  form.value = {
    username: row.username,
    email: row.email,
    avatar_url: row.avatar_url,
    bio: row.bio,
    role: row.role
  }
  dialogVisible.value = true
}

const handleViewProfile = (row: User) => {
  selectedUser.value = row
  profileDialogVisible.value = true
}

const handleToggleStatus = (row: User) => {
  const action = row.status === 'active' ? '禁用' : '启用'
  ElMessageBox.confirm(
    `确定要${action}用户 "${row.username}" 吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 实现状态切换逻辑
    row.status = row.status === 'active' ? 'inactive' : 'active'
    ElMessage.success(`${action}成功`)
  })
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitting.value = true
    // 实现提交逻辑
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
    dialogVisible.value = false
    // 重新加载用户列表
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    submitting.value = false
  }
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  // 重新加载数据
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  // 重新加载数据
}

const handleAvatarSuccess: UploadProps['onSuccess'] = (
  response,
  uploadFile
) => {
  form.value.avatar_url = URL.createObjectURL(uploadFile.raw!)
}

const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png') {
    ElMessage.error('头像只能是 JPG 或 PNG 格式!')
    return false
  }
  if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('头像大小不能超过 2MB!')
    return false
  }
  return true
}

onMounted(() => {
  // 加载用户列表
})
</script>

<style scoped>
.user-info-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.w-full {
  width: 100%;
}

.avatar-uploader {
  text-align: center;
}

.avatar-uploader .avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
  border-radius: 50%;
  background-color: var(--el-fill-color-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-profile {
  padding: 20px;
}

.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.profile-info {
  margin-left: 20px;
}

.profile-info h3 {
  margin: 0 0 8px 0;
  color: var(--el-text-color-primary);
}

.profile-info p {
  margin: 0;
  color: var(--el-text-color-secondary);
}

.profile-content {
  margin-top: 20px;
}

:deep(.el-descriptions__label) {
  width: 120px;
}
</style> 