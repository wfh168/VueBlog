# 用户管理页面
<template>
  <div class="user-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" @click="handleAdd">新增用户</el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="搜索用户名" clearable />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="searchForm.role" placeholder="选择角色" clearable>
            <el-option label="管理员" value="admin" />
            <el-option label="编辑" value="editor" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- PC端表格显示 -->
      <el-table 
        v-if="!isMobile" 
        :data="users" 
        style="width: 100%" 
        v-loading="loading"
      >
        <el-table-column label="用户信息" min-width="200">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="32" :src="row.avatar" />
              <div class="user-detail">
                <div class="username">{{ row.username }}</div>
                <div class="email">{{ row.email }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="role" label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="getRoleType(row.role)">{{ getRoleText(row.role) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-space :size="8">
              <el-button type="primary" size="small" @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button 
                :type="row.status === 'active' ? 'warning' : 'success'" 
                size="small" 
                @click="handleToggleStatus(row)"
              >
                {{ row.status === 'active' ? '禁用' : '启用' }}
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(row)">
                删除
              </el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>

      <!-- 移动端卡片显示 -->
      <div v-else class="mobile-user-list">
        <el-card 
          v-for="item in users" 
          :key="item.id" 
          class="mobile-user-card"
          shadow="hover"
        >
          <div class="mobile-user-header">
            <div class="user-info">
              <el-avatar :size="40" :src="item.avatar" />
              <div class="user-detail">
                <div class="username">{{ item.username }}</div>
                <div class="email">{{ item.email }}</div>
              </div>
            </div>
          </div>
          <div class="mobile-user-content">
            <div class="info-item">
              <span class="label">角色：</span>
              <el-tag :type="getRoleType(item.role)" size="small">
                {{ getRoleText(item.role) }}
              </el-tag>
            </div>
            <div class="info-item">
              <span class="label">状态：</span>
              <el-tag :type="item.status === 'active' ? 'success' : 'danger'" size="small">
                {{ item.status === 'active' ? '正常' : '禁用' }}
              </el-tag>
            </div>
            <div class="info-item">
              <span class="label">创建时间：</span>
              <span class="time">
                <el-icon><Clock /></el-icon>
                {{ formatDate(item.created_at).split(' ')[0] }}
              </span>
            </div>
          </div>
          <div class="mobile-user-actions">
            <el-button type="primary" size="small" @click="handleEdit(item)">
              编辑
            </el-button>
            <el-button 
              :type="item.status === 'active' ? 'warning' : 'success'" 
              size="small" 
              @click="handleToggleStatus(item)"
            >
              {{ item.status === 'active' ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(item)">
              删除
            </el-button>
          </div>
        </el-card>
      </div>

      <!-- 分页 -->
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

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增用户' : '编辑用户'"
      :width="isMobile ? '95%' : '500px'"
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
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色">
            <el-option label="管理员" value="admin" />
            <el-option label="编辑" value="editor" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="dialogType === 'add'" label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" />
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import dayjs from 'dayjs'
import { Clock } from '@element-plus/icons-vue'

interface User {
  id: number
  username: string
  email: string
  avatar: string
  role: string
  status: string
  created_at: string
}

interface UserForm {
  username: string
  email: string
  role: string
  password?: string
}

interface SearchForm {
  username: string
  role: string
}

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const formRef = ref<FormInstance>()
const editingId = ref<number>()

const form = ref<UserForm>({
  username: '',
  email: '',
  role: '',
  password: ''
})

const searchForm = ref<SearchForm>({
  username: '',
  role: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

// 模拟数据
const users = ref<User[]>([
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    role: 'admin',
    status: 'active',
    created_at: '2024-03-20 10:00:00'
  },
  {
    id: 2,
    username: 'editor',
    email: 'editor@example.com',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    role: 'editor',
    status: 'active',
    created_at: '2024-03-19 15:30:00'
  }
])

const formatDate = (date: string) => {
  return isMobile.value ? 
    dayjs(date).format('YYYY-MM-DD') : 
    dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const getRoleType = (role: string) => {
  const types: Record<string, string> = {
    admin: 'danger',
    editor: 'warning',
    user: 'info'
  }
  return types[role] || 'info'
}

const getRoleText = (role: string) => {
  const texts: Record<string, string> = {
    admin: '管理员',
    editor: '编辑',
    user: '普通用户'
  }
  return texts[role] || role
}

const resetForm = () => {
  form.value = {
    username: '',
    email: '',
    role: '',
    password: ''
  }
}

const handleAdd = () => {
  dialogType.value = 'add'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: User) => {
  dialogType.value = 'edit'
  editingId.value = row.id
  form.value = {
    username: row.username,
    email: row.email,
    role: row.role
  }
  dialogVisible.value = true
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
    ElMessage.success(`${action}成功`)
  })
}

const handleDelete = (row: User) => {
  ElMessageBox.confirm(
    `确定要删除用户 "${row.username}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 实现删除逻辑
    ElMessage.success('删除成功')
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

const handleSearch = () => {
  // 实现搜索逻辑
  currentPage.value = 1
}

const resetSearch = () => {
  searchForm.value = {
    username: '',
    role: ''
  }
  handleSearch()
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  // 重新加载数据
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  // 重新加载数据
}

// 添加移动端检测
const isMobile = ref(window.innerWidth <= 768)

// 监听窗口大小变化
const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.user-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.username {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.email {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.mobile-user-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mobile-user-card {
  margin-bottom: 0;
}

.mobile-user-header {
  margin-bottom: 12px;
}

.mobile-user-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.label {
  color: var(--el-text-color-secondary);
}

.time {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--el-text-color-secondary);
}

.mobile-user-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-top: 12px;
}

@media screen and (max-width: 768px) {
  .user-container {
    padding: 12px;
  }

  .card-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .card-header .el-button {
    width: 100%;
  }

  .search-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
  }

  :deep(.el-form--inline .el-form-item) {
    margin-right: 0;
    width: 100%;
    margin-bottom: 0;
  }

  :deep(.el-input),
  :deep(.el-select) {
    width: 100%;
  }

  :deep(.el-form-item__content) {
    display: flex;
    gap: 8px;
  }

  :deep(.el-form-item__content .el-button) {
    flex: 1;
    margin-left: 0;
  }

  .mobile-user-card {
    margin-bottom: 12px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 4px;
    overflow: hidden;
  }

  .mobile-user-header {
    padding: 12px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    background-color: var(--el-fill-color-light);
  }

  .user-info {
    gap: 8px;
  }

  .username {
    font-size: 14px;
  }

  .email {
    font-size: 12px;
  }

  .mobile-user-content {
    padding: 12px;
  }

  .info-item {
    font-size: 12px;
    padding: 4px 0;
  }

  .mobile-user-actions {
    padding: 12px;
    background-color: var(--el-fill-color-lighter);
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .mobile-user-actions .el-button {
    margin: 0;
    width: 100%;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pagination {
    margin-top: 16px;
  }

  :deep(.el-pagination) {
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
  }

  :deep(.el-pagination__sizes) {
    display: none !important;
  }

  :deep(.el-dialog) {
    width: 95% !important;
    margin: 10px auto !important;
  }

  :deep(.el-dialog__body) {
    padding: 12px !important;
  }

  :deep(.el-form-item) {
    margin-bottom: 12px;
  }

  :deep(.el-form-item__label) {
    padding-bottom: 4px;
  }
}
</style> 