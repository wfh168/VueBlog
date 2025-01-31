<template>
  <div class="comment-container">
    <div class="toolbar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索评论内容"
        class="search-input"
        :prefix-icon="Search"
        @input="handleSearch"
      />
      <el-select v-model="filterStatus" placeholder="评论状态" @change="handleFilterChange">
        <el-option label="全部" value="" />
        <el-option label="待审核" value="pending" />
        <el-option label="已通过" value="approved" />
        <el-option label="已拒绝" value="rejected" />
      </el-select>
    </div>

    <!-- PC端表格显示 -->
    <el-table
      v-if="!isMobile"
      v-loading="loading"
      :data="comments"
      style="width: 100%"
      border
    >
      <el-table-column prop="content" label="评论内容" min-width="200">
        <template #default="{ row }">
          <div class="comment-content">
            <div class="comment-text">{{ row.content }}</div>
            <div class="comment-article">
              文章：<el-link type="primary" @click="viewArticle(row.articleId)">{{ row.articleTitle }}</el-link>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="author" label="评论者" width="150">
        <template #default="{ row }">
          <div class="comment-author">
            <el-avatar :size="32" :src="row.avatar" />
            <span class="author-name">{{ row.author }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="评论时间" width="180">
        <template #default="{ row }">
          {{ row.createTime }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="{ row }">
          <el-space :size="8">
            <el-button
              v-if="row.status === 'pending'"
              type="success"
              size="small"
              @click="handleApprove(row)"
            >
              通过
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              type="danger"
              size="small"
              @click="handleReject(row)"
            >
              拒绝
            </el-button>
            <el-button
              type="primary"
              size="small"
              @click="handleReply(row)"
            >
              回复
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </el-space>
        </template>
      </el-table-column>
    </el-table>

    <!-- 移动端卡片显示 -->
    <div v-else class="mobile-comment-list">
      <el-card 
        v-for="item in comments" 
        :key="item.id" 
        class="mobile-comment-card"
        shadow="hover"
      >
        <div class="mobile-comment-header">
          <div class="comment-author">
            <el-avatar :size="24" :src="item.avatar" />
            <span class="author-name">{{ item.author }}</span>
          </div>
          <el-tag :type="getStatusType(item.status)" size="small">
            {{ getStatusText(item.status) }}
          </el-tag>
        </div>
        <div class="mobile-comment-content">
          <div class="comment-text">{{ item.content }}</div>
          <div class="comment-article">
            文章：<el-link type="primary" @click="viewArticle(item.articleId)">{{ item.articleTitle }}</el-link>
          </div>
        </div>
        <div class="mobile-comment-info">
          <span class="mobile-comment-time">
            <el-icon><Clock /></el-icon>
            {{ item.createTime.split(' ')[0] }}
          </span>
        </div>
        <div class="mobile-comment-actions">
          <el-button
            v-if="item.status === 'pending'"
            type="success"
            size="small"
            @click="handleApprove(item)"
          >
            通过
          </el-button>
          <el-button
            v-if="item.status === 'pending'"
            type="danger"
            size="small"
            @click="handleReject(item)"
          >
            拒绝
          </el-button>
          <el-button
            type="primary"
            size="small"
            @click="handleReply(item)"
          >
            回复
          </el-button>
          <el-button
            type="danger"
            size="small"
            @click="handleDelete(item)"
          >
            删除
          </el-button>
        </div>
      </el-card>
    </div>

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

    <!-- 回复对话框 -->
    <el-dialog
      v-model="replyDialogVisible"
      title="回复评论"
      :width="isMobile ? '95%' : '500px'"
    >
      <el-form :model="replyForm" :rules="replyRules" ref="replyFormRef">
        <el-form-item label="回复内容" prop="content">
          <el-input
            v-model="replyForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入回复内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="replyDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitReply" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Clock } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const searchQuery = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 回复相关
const replyDialogVisible = ref(false)
const replyFormRef = ref<FormInstance>()
const currentComment = ref<any>(null)
const replyForm = reactive({
  content: ''
})

const replyRules = {
  content: [
    { required: true, message: '请输入回复内容', trigger: 'blur' },
    { min: 2, max: 500, message: '长度在 2 到 500 个字符', trigger: 'blur' }
  ]
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

// 模拟数据
const comments = ref([
  {
    id: 1,
    content: '这篇文章写得很好，对我帮助很大！',
    author: '张三',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    articleId: 1,
    articleTitle: 'Vue3 组合式 API 最佳实践',
    status: 'approved',
    createTime: '2024-03-20 10:00:00'
  },
  {
    id: 2,
    content: '期待更多相关内容的分享！',
    author: '李四',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    articleId: 2,
    articleTitle: 'TypeScript 高级特性详解',
    status: 'pending',
    createTime: '2024-03-19 15:30:00'
  }
])

// 获取状态类型
const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return types[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return texts[status] || status
}

// 查看文章
const viewArticle = (articleId: number) => {
  router.push(`/article/${articleId}`)
}

// 搜索
const handleSearch = () => {
  // 实现搜索逻辑
  console.log('搜索关键词：', searchQuery.value)
}

// 筛选
const handleFilterChange = () => {
  // 实现筛选逻辑
  console.log('筛选状态：', filterStatus.value)
}

// 分页
const handleSizeChange = (val: number) => {
  pageSize.value = val
  // 重新加载数据
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  // 重新加载数据
}

// 审核评论
const handleApprove = (row: any) => {
  ElMessageBox.confirm(
    '确定要通过这条评论吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    // 实现通过评论的逻辑
    ElMessage.success('已通过评论')
  })
}

const handleReject = (row: any) => {
  ElMessageBox.confirm(
    '确定要拒绝这条评论吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 实现拒绝评论的逻辑
    ElMessage.success('已拒绝评论')
  })
}

// 回复评论
const handleReply = (row: any) => {
  currentComment.value = row
  replyForm.content = ''
  replyDialogVisible.value = true
}

const submitReply = async () => {
  if (!replyFormRef.value) return
  
  await replyFormRef.value.validate((valid, fields) => {
    if (valid) {
      // 实现提交回复的逻辑
      ElMessage.success('回复成功')
      replyDialogVisible.value = false
    }
  })
}

// 删除评论
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    '确定要删除这条评论吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 实现删除评论的逻辑
    ElMessage.success('删除成功')
  })
}
</script>

<style scoped>
.comment-container {
  padding: 20px;
  background-color: var(--bg-color);
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.toolbar {
  margin-bottom: 20px;
  display: flex;
  gap: 16px;
  background-color: var(--bg-color);
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.search-input {
  width: 300px;
}

.comment-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.comment-text {
  color: var(--text-color);
  word-break: break-all;
}

.comment-article {
  font-size: 13px;
  color: var(--text-color);
  opacity: 0.8;
}

.comment-author {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-name {
  color: var(--text-color);
}

:deep(.el-tag) {
  background-color: var(--hover-bg);
  border-color: var(--border-color);
  color: var(--text-color);
}

:deep(.el-dialog) {
  background-color: var(--bg-color);
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid var(--border-color);
}

:deep(.el-dialog__title) {
  color: var(--text-color);
}

:deep(.el-dialog__body) {
  color: var(--text-color);
}

:deep(.el-input__wrapper) {
  background-color: var(--bg-color);
}

:deep(.el-textarea__inner) {
  background-color: var(--bg-color);
  color: var(--text-color);
}

:deep(.el-select) {
  width: 120px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.mobile-comment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mobile-comment-card {
  margin-bottom: 0;
}

.mobile-comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.mobile-comment-content {
  margin-bottom: 12px;
}

.mobile-comment-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 8px 0;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.mobile-comment-time {
  display: flex;
  align-items: center;
  gap: 4px;
}

.mobile-comment-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

@media screen and (max-width: 768px) {
  .comment-container {
    padding: 12px;
  }

  .toolbar {
    flex-direction: column;
    padding: 12px;
    gap: 12px;
  }

  .search-input {
    width: 100%;
  }

  :deep(.el-select) {
    width: 100%;
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

  .comment-text {
    font-size: 12px;
    line-height: 1.4;
  }

  .comment-article {
    font-size: 11px;
  }

  .author-name {
    font-size: 11px;
  }

  :deep(.el-tag--small) {
    height: 20px;
    padding: 0 4px;
    font-size: 11px;
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

  .mobile-comment-card :deep(.el-card__body) {
    padding: 12px;
  }

  .mobile-comment-actions {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .mobile-comment-actions .el-button {
    margin: 0;
    width: 100%;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mobile-comment-actions .el-button + .el-button {
    margin-left: 0;
  }

  .comment-text {
    font-size: 14px;
    line-height: 1.5;
  }
}
</style> 