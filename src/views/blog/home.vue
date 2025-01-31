<template>
  <div class="home">
    <!-- 主要内容区 -->
    <div class="main-content">
      <div class="article-list">
        <!-- 文章列表内容 -->
        <div v-for="article in articles" :key="article.id" class="article-card">
          <div class="article-content">
            <h2 class="title">
              <router-link :to="`/blog/article/${article.id}`">{{ article.title }}</router-link>
            </h2>
            <div class="meta">
              <span class="meta-item">
                <el-icon><Calendar /></el-icon>
                {{ article.created_at }}
              </span>
              <span class="meta-item">
                <el-icon><View /></el-icon>
                {{ article.views }} 阅读
              </span>
              <span class="meta-item">
                <el-icon><ChatLineRound /></el-icon>
                {{ article.comments }} 评论
              </span>
              <span class="meta-item category">
                <el-icon><Folder /></el-icon>
                <router-link :to="`/blog/category/${article.category.id}`">
                  {{ article.category.name }}
                </router-link>
              </span>
            </div>
            <div class="summary">{{ article.summary }}</div>
            <div class="footer">
              <div class="tags">
                <router-link 
                  v-for="tag in article.tags" 
                  :key="tag.id" 
                  :to="`/blog/tag/${tag.id}`"
                  class="tag"
                >
                  <el-icon><Collection /></el-icon>
                  {{ tag.name }}
                </router-link>
              </div>
              <router-link :to="`/blog/article/${article.id}`" class="read-more">
                阅读全文<el-icon><ArrowRight /></el-icon>
              </router-link>
            </div>
          </div>
        </div>
        
        <!-- 分页 -->
        <div class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 30, 50]"
            layout="total, sizes, prev, pager, next"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
    
    <!-- 右侧边栏 -->
    <div class="right-sidebar">
      <!-- 时间卡片 -->
      <TimeCard />
      
      <!-- 分类统计 -->
      <div class="widget category-widget">
        <h3 class="widget-title">
          <el-icon><Folder /></el-icon>
          分类统计
        </h3>
        <ul class="category-list">
          <li v-for="category in categories" :key="category.id">
            <router-link :to="`/blog/category/${category.id}`">
              {{ category.name }}
              <span class="count">{{ category.count }}</span>
            </router-link>
          </li>
        </ul>
      </div>
      
      <!-- 标签云 -->
      <div class="widget tag-widget">
        <h3 class="widget-title">
          <el-icon><Collection /></el-icon>
          标签云
        </h3>
        <div class="tag-cloud">
          <router-link
            v-for="tag in tags"
            :key="tag.id"
            :to="`/blog/tag/${tag.id}`"
            class="tag"
            :style="{
              fontSize: Math.max(12, Math.min(20, 12 + tag.count / 2)) + 'px',
              opacity: 0.6 + tag.count / 20
            }"
          >
            {{ tag.name }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  Calendar, View, ChatLineRound, Collection, ArrowRight, 
  Folder
} from '@element-plus/icons-vue'
import TimeCard from '@/components/TimeCard.vue'

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 模拟数据
const articles = ref([
  {
    id: 1,
    title: 'Vue3 组合式 API 最佳实践指南',
    summary: '本文将详细介绍 Vue3 组合式 API 的使用技巧和最佳实践，帮助你更好地组织和管理代码...',
    created_at: '2024-03-20',
    views: 1234,
    comments: 23,
    cover: 'https://picsum.photos/800/400',
    category: { id: 1, name: '前端开发' },
    tags: [
      { id: 1, name: 'Vue3' },
      { id: 2, name: 'TypeScript' },
      { id: 3, name: '最佳实践' }
    ]
  },
  {
    id: 2,
    title: 'TypeScript 高级特性详解',
    summary: '深入探讨 TypeScript 的高级特性，包括泛型、装饰器、类型体操等进阶用法...',
    created_at: '2024-03-19',
    views: 856,
    comments: 15,
    category: { id: 1, name: '前端开发' },
    tags: [
      { id: 2, name: 'TypeScript' },
      { id: 4, name: '进阶教程' }
    ]
  }
])

const categories = ref([
  { id: 1, name: '前端开发', count: 25 },
  { id: 2, name: '后端开发', count: 18 },
  { id: 3, name: '工程化', count: 12 },
  { id: 4, name: '性能优化', count: 8 },
  { id: 5, name: '开发工具', count: 15 }
])

const tags = ref([
  { id: 1, name: 'Vue3', count: 15 },
  { id: 2, name: 'TypeScript', count: 12 },
  { id: 3, name: '最佳实践', count: 8 },
  { id: 4, name: '进阶教程', count: 6 },
  { id: 5, name: 'JavaScript', count: 20 },
  { id: 6, name: 'Node.js', count: 10 },
  { id: 7, name: 'Vite', count: 5 },
  { id: 8, name: 'React', count: 9 }
])

const handleSizeChange = (val: number) => {
  pageSize.value = val
  // 重新加载数据
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  // 重新加载数据
}
</script>

<style scoped>
.home {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
  max-width: 1600px;
  margin: 0 auto;
  padding: 20px;
}

.main-content {
  min-width: 0;
}

.article-card {
  background: var(--el-bg-color);
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--el-border-color-light);
  transition: all 0.3s ease;
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: var(--el-color-primary-light-5);
}

.article-content {
  padding: 24px;
}

.title {
  margin: 0 0 16px;
  font-size: 24px;
  line-height: 1.4;
}

.title a {
  color: var(--el-text-color-primary);
  text-decoration: none;
  transition: color 0.3s;
}

.title a:hover {
  color: var(--el-color-primary);
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-item.category a {
  color: var(--el-color-primary);
  text-decoration: none;
  transition: color 0.3s;
}

.meta-item.category a:hover {
  color: var(--el-color-primary-light-3);
}

.summary {
  color: var(--el-text-color-regular);
  margin-bottom: 20px;
  line-height: 1.8;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px dashed var(--el-border-color);
}

.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  text-decoration: none;
  transition: all 0.3s;
}

.tag:hover {
  color: #fff;
  background: var(--el-color-primary);
  transform: translateY(-2px);
}

.read-more {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--el-color-primary);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
  padding: 6px 16px;
  border-radius: 20px;
  background: var(--el-color-primary-light-9);
}

.read-more:hover {
  color: #fff;
  background: var(--el-color-primary);
  transform: translateX(4px);
}

.pagination {
  margin-top: 32px;
  display: flex;
  justify-content: center;
}

.widget {
  background: var(--el-bg-color);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--el-border-color-light);
}

.widget-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 20px;
  font-size: 18px;
  color: var(--el-text-color-primary);
  font-weight: 600;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.category-list li {
  margin-bottom: 12px;
}

.category-list a {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--el-text-color-regular);
  text-decoration: none;
  padding: 10px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
  background-color: var(--el-fill-color-light);
}

.category-list a:hover {
  color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
  transform: translateX(4px);
}

.count {
  color: var(--el-text-color-secondary);
  font-size: 13px;
  background-color: var(--el-fill-color);
  padding: 2px 8px;
  border-radius: 12px;
  transition: all 0.3s;
}

.category-list a:hover .count {
  background-color: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.tag-cloud .tag {
  padding: 6px 16px;
  border-radius: 20px;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  text-decoration: none;
  transition: all 0.3s ease;
}

.tag-cloud .tag:hover {
  color: #fff;
  background: var(--el-color-primary);
  transform: translateY(-2px) scale(1.05);
}

.right-sidebar {
  position: sticky;
  top: 88px;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .home {
    grid-template-columns: 1fr;
  }
  
  .right-sidebar {
    display: none;
  }
}

@media (max-width: 768px) {
  .home {
    padding: 16px;
  }

  .article-content {
    padding: 20px;
  }

  .title {
    font-size: 20px;
  }

  .meta {
    gap: 12px;
    font-size: 13px;
  }

  .footer {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .read-more {
    width: 100%;
    justify-content: center;
  }

  .pagination :deep(.el-pagination) {
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
  }

  .pagination :deep(.el-pagination__total) {
    margin-right: 0;
  }

  .pagination :deep(.el-pagination__sizes) {
    margin-right: 0;
  }
}

@media (max-width: 480px) {
  .pagination :deep(.el-pagination) {
    font-size: 12px;
  }

  .pagination :deep(.el-pagination .el-select .el-input) {
    width: 90px;
  }
}
</style> 