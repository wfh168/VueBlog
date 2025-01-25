<template>
  <div v-show="visible" class="back-to-top" @click="backToTop">
    <div class="progress-ring">
      <div class="percentage">{{ progress }}%</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const visible = ref(false)
const progress = ref(0)

const calculateScroll = () => {
  const totalHeight = document.documentElement.scrollHeight - window.innerHeight
  const currentScroll = window.scrollY || document.documentElement.scrollTop
  
  progress.value = Math.round((currentScroll / totalHeight) * 100)
  visible.value = currentScroll > 300
}

const backToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', calculateScroll)
  calculateScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', calculateScroll)
})
</script>

<style scoped>
.back-to-top {
  position: fixed;
  right: 40px;
  bottom: 40px;
  width: 40px;
  height: 40px;
  background: var(--el-color-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 999;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.back-to-top:hover {
  background: var(--el-color-primary-light-3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.progress-ring {
  color: #fff;
  font-size: 12px;
  font-weight: 500;
}

.percentage {
  line-height: 1;
}
</style> 