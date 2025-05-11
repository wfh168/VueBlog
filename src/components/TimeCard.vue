<template>
  <div class="time-card">
    <div class="time-section">
      <div class="time">{{ time }}</div>
      <div class="date">{{ date }}</div>
    </div>
    <div class="info-section">
      <div class="info-item">
        <el-icon><Calendar /></el-icon>
        <span>今年第 {{ getYearDay() }} 天</span>
      </div>
      <div class="info-item">
        <el-icon><Clock /></el-icon>
        <span>第 {{ getWeek() }} 周</span>
      </div>
<!--      <div class="info-item">-->
<!--        <el-icon><Sunrise /></el-icon>-->
<!--        <span>今日已过 {{ getDayProgress() }}%</span>-->
<!--      </div>-->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Calendar, Clock, Sunrise } from '@element-plus/icons-vue'

const time = ref('')
const date = ref('')

// 获取当前时间
const updateDateTime = () => {
  const now = new Date()
  
  // 格式化时间 HH:mm:ss
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  time.value = `${hours}:${minutes}:${seconds}`
  
  // 格式化日期 YYYY年MM月DD日
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  date.value = `${year}年${month}月${day}日`
}

// 获取今年的第几天
const getYearDay = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
}

// 获取当前周数
const getWeek = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const diff = now.getTime() - start.getTime()
  const oneWeek = 1000 * 60 * 60 * 24 * 7
  return Math.ceil((diff + start.getDay() + 1) / oneWeek)
}

// 获取今日进度
const getDayProgress = () => {
  const now = new Date()
  const total = 24 * 60 * 60 * 1000 // 一天的总毫秒数
  const current = (now.getHours() * 60 * 60 * 1000) + 
                 (now.getMinutes() * 60 * 1000) + 
                 (now.getSeconds() * 1000) +
                 now.getMilliseconds()
  return Math.round((current / total) * 100)
}

let timer: number | null = null

onMounted(() => {
  updateDateTime()
  timer = window.setInterval(updateDateTime, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.time-card {
  background-color: var(--el-bg-color);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--el-border-color-light);
  transition: all 0.3s ease;
}

.time-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.time-section {
  text-align: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.time {
  font-size: 42px;
  font-weight: 600;
  color: var(--el-color-primary);
  font-family: 'Roboto Mono', monospace;
  letter-spacing: 2px;
  line-height: 1;
}

.date {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin-top: 6px;
}

.info-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.info-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px;
  border-radius: 6px;
  background-color: var(--el-fill-color-light);
  transition: all 0.3s ease;
}

.info-item:hover {
  background-color: var(--el-color-primary-light-9);
}

.info-item .el-icon {
  font-size: 14px;
  color: var(--el-color-primary);
}

.info-item span {
  font-size: 12px;
  color: var(--el-text-color-regular);
  white-space: nowrap;
}

@media (max-width: 768px) {
  .time-card {
    padding: 16px;
  }

  .time {
    font-size: 36px;
  }

  .info-section {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .info-item {
    width: auto;
    flex: 1;
    min-width: calc(33.33% - 6px);
  }
}
</style> 