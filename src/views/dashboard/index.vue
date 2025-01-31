<template>
  <div class="dashboard-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>文章总数</span>
              <el-tag type="info" effect="plain">较昨日 +5</el-tag>
            </div>
          </template>
          <div class="card-content">
            <h2>{{ stats.totalPosts }}</h2>
            <div class="trend">
              <span>月同比</span>
              <span :class="['trend-value', stats.postTrend > 0 ? 'up' : 'down']">
                {{ Math.abs(stats.postTrend) }}%
                <el-icon><component :is="stats.postTrend > 0 ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
              </span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>总访问量</span>
              <el-tag type="success" effect="plain">较昨日 +128</el-tag>
            </div>
          </template>
          <div class="card-content">
            <h2>{{ stats.totalViews }}</h2>
            <div class="trend">
              <span>月同比</span>
              <span :class="['trend-value', stats.viewTrend > 0 ? 'up' : 'down']">
                {{ Math.abs(stats.viewTrend) }}%
                <el-icon><component :is="stats.viewTrend > 0 ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
              </span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>评论数</span>
              <el-tag type="warning" effect="plain">较昨日 +12</el-tag>
            </div>
          </template>
          <div class="card-content">
            <h2>{{ stats.totalComments }}</h2>
            <div class="trend">
              <span>月同比</span>
              <span :class="['trend-value', stats.commentTrend > 0 ? 'up' : 'down']">
                {{ Math.abs(stats.commentTrend) }}%
                <el-icon><component :is="stats.commentTrend > 0 ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
              </span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>收藏数</span>
              <el-tag type="danger" effect="plain">较昨日 +3</el-tag>
            </div>
          </template>
          <div class="card-content">
            <h2>{{ stats.totalFavorites }}</h2>
            <div class="trend">
              <span>月同比</span>
              <span :class="['trend-value', stats.favoriteTrend > 0 ? 'up' : 'down']">
                {{ Math.abs(stats.favoriteTrend) }}%
                <el-icon><component :is="stats.favoriteTrend > 0 ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
              </span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :lg="16">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>访问趋势</span>
              <el-radio-group v-model="chartType" class="mb-4">
                <el-radio-button value="week">最近一周</el-radio-button>
                <el-radio-button value="month">最近一月</el-radio-button>
                <el-radio-button value="year">最近一年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <v-chart class="chart" :option="viewChartOption" autoresize />
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>文章分类占比</span>
            </div>
          </template>
          <v-chart class="chart" :option="categoryChartOption" autoresize />
        </el-card>
      </el-col>
    </el-row>

    <!-- 最新动态 -->
    <el-row :gutter="20" class="activity-row">
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover" class="activity-card">
          <template #header>
            <div class="card-header">
              <span>最新文章</span>
              <el-button text>查看更多</el-button>
            </div>
          </template>
          <el-table :data="latestPosts" style="width: 100%">
            <el-table-column prop="title" label="标题" show-overflow-tooltip />
            <el-table-column prop="views" label="访问量" width="100" align="center" />
            <el-table-column prop="createTime" label="发布时间" width="180" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover" class="activity-card">
          <template #header>
            <div class="card-header">
              <span>最新评论</span>
              <el-button text>查看更多</el-button>
            </div>
          </template>
          <el-table :data="latestComments" style="width: 100%">
            <el-table-column prop="content" label="评论内容" show-overflow-tooltip />
            <el-table-column prop="user" label="评论者" width="120" />
            <el-table-column prop="createTime" label="评论时间" width="180" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, PieChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import dayjs from 'dayjs'

// 注册 ECharts 组件
use([
  CanvasRenderer,
  LineChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
])

const router = useRouter()
const chartType = ref('week')

// 统计数据
const stats = reactive({
  totalPosts: 128,
  postTrend: 15,
  totalViews: 25678,
  viewTrend: 32,
  totalComments: 896,
  commentTrend: -8,
  totalFavorites: 256,
  favoriteTrend: 12
})

// 访问趋势图表配置
const viewChartOption = ref({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {
    data: ['访问量', '评论数']
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: []
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '访问量',
      type: 'line',
      smooth: true,
      data: [],
      itemStyle: {
        color: '#409EFF'
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: 'rgba(64,158,255,0.2)'
            },
            {
              offset: 1,
              color: 'rgba(64,158,255,0)'
            }
          ]
        }
      }
    },
    {
      name: '评论数',
      type: 'line',
      smooth: true,
      data: [],
      itemStyle: {
        color: '#67C23A'
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: 'rgba(103,194,58,0.2)'
            },
            {
              offset: 1,
              color: 'rgba(103,194,58,0)'
            }
          ]
        }
      }
    }
  ]
})

// 生成图表数据
const generateChartData = (type: string) => {
  const days: string[] = []
  const views: number[] = []
  const comments: number[] = []
  const today = dayjs()

  switch(type) {
    case 'week':
      // 最近7天
      for (let i = 6; i >= 0; i--) {
        const date = today.subtract(i, 'day')
        days.push(date.format('MM-DD'))
        views.push(Math.floor(Math.random() * 1000))
        comments.push(Math.floor(Math.random() * 100))
      }
      break
    case 'month':
      // 本月每天
      const daysInMonth = today.daysInMonth()
      for (let i = 1; i <= daysInMonth; i++) {
        days.push(`${i}日`)
        views.push(Math.floor(Math.random() * 1500))
        comments.push(Math.floor(Math.random() * 150))
      }
      break
    case 'year':
      // 一年12个月
      for (let i = 1; i <= 12; i++) {
        days.push(`${i}月`)
        views.push(Math.floor(Math.random() * 30000))
        comments.push(Math.floor(Math.random() * 3000))
      }
      break
  }

  return { days, views, comments }
}

// 更新图表数据
const updateChartData = (type: string) => {
  const { days, views, comments } = generateChartData(type)
  viewChartOption.value.xAxis.data = days
  viewChartOption.value.series[0].data = views
  viewChartOption.value.series[1].data = comments
}

// 监听时间范围变化
watch(chartType, (newType) => {
  updateChartData(newType)
})

// 初始化图表数据
onMounted(() => {
  updateChartData(chartType.value)
})

// 基础图表配置
const baseChartOption = {
  tooltip: {
    trigger: 'axis'
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  }
}

// 文章分类饼图配置
const categoryChartOption = ref({
  tooltip: {
    trigger: 'item'
  },
  legend: {
    orient: 'vertical',
    left: 'left'
  },
  series: [
    {
      type: 'pie',
      radius: '50%',
      data: [
        { value: 35, name: '技术' },
        { value: 20, name: '生活' },
        { value: 15, name: '随笔' },
        { value: 10, name: '阅读' },
        { value: 20, name: '其他' }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
})

// 最新文章数据
const latestPosts = ref([
  {
    title: 'Vue3 组合式 API 最佳实践',
    views: 1250,
    createTime: '2024-03-20 10:00:00'
  },
  {
    title: 'TypeScript 高级特性详解',
    views: 860,
    createTime: '2024-03-19 15:30:00'
  },
  {
    title: 'Node.js 性能优化指南',
    views: 720,
    createTime: '2024-03-18 14:20:00'
  }
])

// 最新评论数据
const latestComments = ref([
  {
    content: '这篇文章写得很好，对我帮助很大！',
    user: '张三',
    createTime: '2024-03-20 16:30:00'
  },
  {
    content: '期待更多相关内容的分享。',
    user: '李四',
    createTime: '2024-03-20 15:45:00'
  },
  {
    content: '文章的代码示例很清晰，感谢分享。',
    user: '王五',
    createTime: '2024-03-20 14:20:00'
  }
])

onMounted(() => {
  // 这里可以调用API获取实际数据
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.stat-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  text-align: center;
}

.card-content h2 {
  margin: 10px 0;
  font-size: 28px;
  color: var(--el-text-color-primary);
}

.trend {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.trend-value {
  display: flex;
  align-items: center;
  gap: 4px;
}

.trend-value.up {
  color: #67C23A;
}

.trend-value.down {
  color: #F56C6C;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
}

.chart {
  height: 350px;
}

.activity-row {
  margin-bottom: 20px;
}

.activity-card {
  margin-bottom: 20px;
}

:deep(.el-card__header) {
  padding: 12px 20px;
  border-bottom: 1px solid var(--el-border-color-light);
}

:deep(.el-table) {
  --el-table-border-color: var(--el-border-color-light);
  --el-table-header-bg-color: var(--el-fill-color-light);
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 12px;
  }

  .chart {
    height: 300px;
  }
}
</style> 