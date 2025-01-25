<template>
  <div class="archive-page">
    <div class="content">
      <!-- 归档信息 -->
      <div class="archive-header">
        <h1 class="archive-title">
          <el-icon><Calendar /></el-icon>
          文章归档
          <span class="archive-count">(共 {{ total }} 篇文章)</span>
        </h1>
      </div>

      <!-- 归档列表 -->
      <div class="archive-list">
        <div v-for="year in archives" :key="year.year" class="archive-year">
          <h2 class="year-title">
            {{ year.year }}
            <span class="year-count">({{ year.count }})</span>
          </h2>
          <div v-for="month in year.months" :key="`${year.year}-${month.month}`" class="archive-month">
            <h3 class="month-title">
              {{ month.month }} 月
              <span class="month-count">({{ month.articles.length }})</span>
            </h3>
            <ul class="article-list">
              <li v-for="article in month.articles" :key="article.id" class="article-item">
                <span class="article-date">{{ formatDate(article.created_at) }}</span>
                <router-link :to="`/blog/article/${article.id}`" class="article-title">
                  {{ article.title }}
                </router-link>
                <div class="article-meta">
                  <span class="meta-item">
                    <el-icon><View /></el-icon>
                    {{ article.views }}
                  </span>
                  <span class="meta-item">
                    <el-icon><ChatLineRound /></el-icon>
                    {{ article.comments }}
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- 加载更多 -->
        <div v-if="hasMore" class="load-more">
          <el-button text @click="loadMore">
            加载更多
          </el-button>
        </div>
      </div>
    </div>

    <!-- 侧边栏 -->
    <aside class="sidebar">
      <!-- 统计信息 -->
      <div class="widget">
        <h3 class="widget-title">统计信息</h3>
        <ul class="stat-list">
          <li class="stat-item">
            <span class="stat-label">文章总数</span>
            <span class="stat-value">{{ total }}</span>
          </li>
          <li class="stat-item">
            <span class="stat-label">分类总数</span>
            <span class="stat-value">{{ stats.categories }}</span>
          </li>
          <li class="stat-item">
            <span class="stat-label">标签总数</span>
            <span class="stat-value">{{ stats.tags }}</span>
          </li>
          <li class="stat-item">
            <span class="stat-label">最后更新</span>
            <span class="stat-value">{{ formatDate(stats.lastUpdate) }}</span>
          </li>
        </ul>
      </div>

      <!-- 时间线 -->
      <div class="widget timeline">
        <h3 class="widget-title">时间线</h3>
        <div class="year-list">
          <router-link
            v-for="year in yearList"
            :key="year.year"
            :to="`/blog/archive?year=${year.year}`"
            :class="['year-item', { active: year.year === currentYear }]"
          >
            {{ year.year }}
            <span class="count">{{ year.count }}</span>
          </router-link>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Calendar, View, ChatLineRound } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

const route = useRoute()

// 统计信息
const total = ref(100)
const stats = ref({
  categories: 10,
  tags: 30,
  lastUpdate: '2024-01-20'
})

// 年份列表
const yearList = ref([
  { year: 2024, count: 20 },
  { year: 2023, count: 50 },
  { year: 2022, count: 30 },
  // 更多年份...
])

// 当前年份
const currentYear = computed(() => {
  return Number(route.query.year) || new Date().getFullYear()
})

// 归档数据
const archives = ref([
  {
    year: 2024,
    count: 20,
    months: [
      {
        month: 1,
        articles: [
          {
            id: 1,
            title: '使用 Vue 3 和 TypeScript 构建现代化博客系统',
            views: 1234,
            comments: 23,
            created_at: '2024-01-15'
          },
          // 更多文章...
        ]
      },
      // 更多月份...
    ]
  },
  // 更多年份...
])

// 是否有更多数据
const hasMore = ref(true)

// 加载更多数据
const loadMore = () => {
  console.log('加载更多数据')
  // 实现加载更多数据的逻辑
}

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD')
}

onMounted(() => {
  // 获取归档数据
  console.log('获取归档数据:', currentYear.value)
})
</script>

<style scoped>
.archive-page {
  margin-top: 20px;
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 24px;
}

.content {
  min-height: 200px;
}

.archive-header {
  padding: 24px;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-bottom: 24px;
}

.archive-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.archive-count {
  font-size: 16px;
  font-weight: normal;
  color: var(--text-color-light);
}

.archive-list {
  min-height: 200px;
}

.archive-year {
  margin-bottom: 32px;
}

.year-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--el-color-primary);
}

.year-count {
  font-size: 16px;
  font-weight: normal;
  color: var(--text-color-light);
}

.archive-month {
  margin-bottom: 24px;
}

.month-title {
  font-size: 18px;
  font-weight: 500;
  color: var(--text-color);
  margin: 0 0 12px;
}

.month-count {
  font-size: 14px;
  font-weight: normal;
  color: var(--text-color-light);
}

.article-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.article-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-bottom: 12px;
  transition: all 0.3s;
}

.article-item:hover {
  transform: translateX(4px);
  border-color: var(--el-color-primary);
}

.article-date {
  font-size: 14px;
  color: var(--text-color-light);
  white-space: nowrap;
}

.article-title {
  flex: 1;
  font-size: 16px;
  color: var(--text-color);
  text-decoration: none;
  transition: color 0.3s;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.article-title:hover {
  color: var(--el-color-primary);
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  white-space: nowrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--text-color-light);
}

.load-more {
  text-align: center;
  margin-top: 24px;
}

.sidebar {
  position: sticky;
  top: 88px;
}

.widget {
  padding: 20px;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-bottom: 24px;
}

.widget-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.stat-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px dashed var(--border-color);
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  color: var(--text-color);
}

.stat-value {
  color: var(--el-color-primary);
  font-weight: 500;
}

.year-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.year-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  color: var(--text-color);
  text-decoration: none;
  border-radius: 4px;
  transition: all 0.3s;
}

.year-item:hover {
  color: var(--el-color-primary);
  background-color: var(--hover-bg);
}

.year-item.active {
  color: var(--el-color-primary);
  background-color: var(--hover-bg);
  font-weight: 500;
}

.count {
  font-size: 12px;
  color: var(--text-color-light);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .archive-page {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
    margin-top: 24px;
  }

  .article-item {
    flex-wrap: wrap;
  }

  .article-date {
    order: 1;
    width: 100%;
  }

  .article-title {
    order: 2;
    width: 100%;
  }

  .article-meta {
    order: 3;
    width: 100%;
    justify-content: flex-start;
    margin-top: 8px;
  }
}
</style> 