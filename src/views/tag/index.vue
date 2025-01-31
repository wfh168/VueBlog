<template>
  <div class="tag-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>标签管理</span>
          <el-button type="primary" @click="handleAdd">新增标签</el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="标签名称">
          <el-input v-model="searchForm.name" placeholder="搜索标签名称" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- PC端表格显示 -->
      <el-table 
        v-if="!isMobile" 
        :data="tags" 
        style="width: 100%" 
        v-loading="loading"
      >
        <el-table-column prop="name" label="标签名称" min-width="120" />
        <el-table-column prop="article_count" label="文章数量" width="120" align="center" />
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-space :size="8">
              <el-button type="primary" size="small" @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(row)">
                删除
              </el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>

      <!-- 移动端卡片显示 -->
      <div v-else class="mobile-tag-list">
        <el-card 
          v-for="item in tags" 
          :key="item.tag_id" 
          class="mobile-tag-card"
          shadow="hover"
        >
          <div class="mobile-tag-header">
            <h3 class="mobile-tag-name">{{ item.name }}</h3>
            <el-tag size="small" type="info">{{ item.article_count }} 篇文章</el-tag>
          </div>
          <div class="mobile-tag-info">
            <span class="mobile-tag-time">
              <el-icon><Clock /></el-icon>
              {{ formatDate(item.created_at).split(' ')[0] }}
            </span>
          </div>
          <div class="mobile-tag-actions">
            <el-button type="primary" size="small" @click="handleEdit(item)">
              编辑
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
      :title="dialogType === 'add' ? '新增标签' : '编辑标签'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="标签名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入标签名称" />
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

interface Tag {
  tag_id: number
  name: string
  article_count: number
  created_at: string
}

interface TagForm {
  name: string
}

interface SearchForm {
  name: string
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

const form = ref<TagForm>({
  name: ''
})

const searchForm = ref<SearchForm>({
  name: ''
})

const rules = {
  name: [
    { required: true, message: '请输入标签名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ]
}

// 模拟数据
const tags = ref<Tag[]>([
  {
    tag_id: 1,
    name: 'Vue3',
    article_count: 5,
    created_at: '2024-03-20 10:00:00'
  },
  {
    tag_id: 2,
    name: 'TypeScript',
    article_count: 3,
    created_at: '2024-03-19 15:30:00'
  }
])

const formatDate = (date: string) => {
  return isMobile.value ? 
    dayjs(date).format('YYYY-MM-DD') : 
    dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const resetForm = () => {
  form.value = {
    name: ''
  }
}

const handleAdd = () => {
  dialogType.value = 'add'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: Tag) => {
  dialogType.value = 'edit'
  editingId.value = row.tag_id
  form.value = {
    name: row.name
  }
  dialogVisible.value = true
}

const handleDelete = (row: Tag) => {
  if (row.article_count > 0) {
    ElMessage.warning('该标签下还有文章，不能删除')
    return
  }

  ElMessageBox.confirm(
    `确定要删除标签 "${row.name}" 吗？`,
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
    // 重新加载标签列表
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
    name: ''
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
.tag-container {
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

.w-full {
  width: 100%;
}

.mobile-tag-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mobile-tag-card {
  margin-bottom: 0;
}

.mobile-tag-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.mobile-tag-name {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.mobile-tag-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 8px 0;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.mobile-tag-time {
  display: flex;
  align-items: center;
  gap: 4px;
}

.mobile-tag-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

@media screen and (max-width: 768px) {
  .tag-container {
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
  }

  :deep(.el-form--inline .el-form-item) {
    margin-right: 0;
    width: 100%;
  }

  :deep(.el-input) {
    width: 100%;
  }

  :deep(.el-form-item__content) {
    display: flex;
    gap: 8px;
  }

  :deep(.el-form-item__content .el-button) {
    flex: 1;
  }

  :deep(.el-table) {
    font-size: 12px;
  }

  :deep(.el-table .cell) {
    padding: 4px;
  }

  :deep(.el-table--border .el-table__cell) {
    padding: 4px;
  }

  :deep(.el-button--small) {
    padding: 4px 8px;
    font-size: 12px;
    height: 24px;
  }

  :deep(.el-space) {
    gap: 4px !important;
  }

  .pagination {
    justify-content: center;
  }

  :deep(.el-pagination) {
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
  }

  :deep(.el-pagination .el-select) {
    width: 90px;
  }

  :deep(.el-dialog) {
    width: 95% !important;
    margin: 10px auto !important;
  }

  :deep(.el-dialog__body) {
    padding: 12px !important;
  }

  .mobile-tag-card :deep(.el-card__body) {
    padding: 12px;
  }

  .mobile-tag-actions {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .mobile-tag-actions .el-button {
    margin: 0;
    width: 100%;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mobile-tag-actions .el-button + .el-button {
    margin-left: 0;
  }
}
</style> 