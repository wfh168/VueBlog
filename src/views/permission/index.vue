<template>
  <div class="role-container">
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button type="primary" @click="handleAdd" size="small">
          新增角色
        </el-button>
      </div>
      <div class="toolbar-right">
        <el-input
            v-model="searchForm.name"
            placeholder="搜索角色名称"
            class="search-input"
            clearable
            size="small"
        />
      </div>
    </div>

    <!-- 移动端卡片列表 -->
    <div v-if="isMobile" class="mobile-role-list">
      <div
          v-for="role in roles"
          :key="role.id"
          class="mobile-role-card"
      >
        <div class="mobile-role-header">
          <h3 class="role-name">{{ role.name }}</h3>
          <el-tag :type="role.status === '启用' ? 'success' : 'danger'" size="small">
            {{ role.status }}
          </el-tag>
        </div>
        <div class="mobile-role-meta">
          <span>角色标识：{{ role.code }}</span>
        </div>
        <div class="mobile-role-info">
          <span>描述：{{ role.description }}</span>
        </div>
        <div class="mobile-role-actions">
          <el-button type="primary" size="small" @click="handleEdit(role)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(role)">删除</el-button>
        </div>
      </div>
    </div>

    <!-- PC端表格 -->
    <el-table
        v-if="!isMobile"
        v-loading="loading"
        :data="roles"
        style="width: 100%"
        border
    >
      <el-table-column prop="name" label="角色名称" min-width="150" />
      <el-table-column prop="code" label="角色标识" min-width="150" />
      <el-table-column prop="description" label="描述" min-width="200" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === '启用' ? 'success' : 'danger'" size="small">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 编辑对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '新增角色' : '编辑角色'"
        :width="isMobile ? '95%' : '500px'"
    >
      <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="80px"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色名称" size="small" />
        </el-form-item>
        <el-form-item label="角色标识" prop="code">
          <el-input v-model="form.code" placeholder="请输入角色标识" size="small" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
              v-model="form.description"
              type="textarea"
              :rows="3"
              placeholder="请输入描述"
              size="small"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态" size="small">
            <el-option label="启用" value="启用" />
            <el-option label="禁用" value="禁用" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false" size="small">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit" size="small">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface Role {
  id: number
  name: string
  code: string
  description: string
  status: string
}

const form = ref({
  name: '',
  code: '',
  description: '',
  status: '启用'
})

const searchForm = ref({
  name: ''
})

const roles = ref<Role[]>([
  {
    id: 1,
    name: '超级管理员',
    code: 'SUPER_ADMIN',
    description: '系统最高权限',
    status: '启用'
  },
  {
    id: 2,
    name: '内容编辑',
    code: 'CONTENT_EDITOR',
    description: '管理文章和评论',
    status: '启用'
  }
])

const loading = ref(false)
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const submitting = ref(false)
const formRef = ref()
const editingId = ref<number>()

// 移动端检测
const isMobile = ref(window.innerWidth <= 768)

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const handleAdd = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
}

const handleEdit = (row: Role) => {
  dialogType.value = 'edit'
  editingId.value = row.id
  form.value = {
    name: row.name,
    code: row.code,
    description: row.description,
    status: row.status
  }
  dialogVisible.value = true
}

const handleDelete = (row: Role) => {
  ElMessageBox.confirm(
      `确定要删除角色 "${row.name}" 吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    ElMessage.success('删除成功')
  })
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
    dialogVisible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    submitting.value = false
  }
}
</script>


<style scoped>
.role-container {
  padding: 12px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.toolbar-left,
.toolbar-right {
  width: 100%;
}

.toolbar-left .el-button {
  width: 100%;
}

.search-input {
  width: 100%;
}

.mobile-role-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mobile-role-card {
  background-color: var(--el-bg-color);
  border-radius: 4px;
  padding: 12px;
  box-shadow: var(--el-box-shadow-lighter);
}

.mobile-role-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.role-name {
  font-size: 14px;
  font-weight: 500;
  margin: 0;
}

.mobile-role-meta {
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.mobile-role-info {
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.mobile-role-actions {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.mobile-role-actions .el-button {
  margin: 0;
  width: 100%;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media screen and (max-width: 768px) {
  .role-container {
    padding: 8px;
  }

  .toolbar {
    flex-direction: column;
    gap: 8px;
  }

  .mobile-role-card {
    padding: 8px;
    border: 1px solid var(--el-border-color-lighter);
  }

  .mobile-role-header {
    margin-bottom: 8px;
  }

  .role-name {
    font-size: 14px;
  }

  .mobile-role-meta {
    font-size: 12px;
  }

  .mobile-role-info {
    font-size: 12px;
  }

  .mobile-role-actions {
    gap: 8px;
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

  :deep(.el-select) {
    width: 100%;
  }
}
</style>