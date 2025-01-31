<template>
  <nav class="article-toc">
    <ol v-if="tocItems.length">
      <li 
        v-for="item in tocItems" 
        :key="item.id"
        :class="{ 
          'toc-item': true,
          [`level-${item.level}`]: true,
          'active': activeId === item.id
        }"
      >
        <a 
          :href="'#' + item.id"
          @click.prevent="scrollToHeading(item.id)"
        >
          {{ item.text }}
        </a>
      </li>
    </ol>
    <div v-else class="no-toc">暂无目录</div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { marked } from 'marked'

const props = defineProps<{
  content: string
}>()

interface TocItem {
  id: string
  text: string
  level: number
}

const tocItems = ref<TocItem[]>([])
const activeId = ref('')
const observer = ref<IntersectionObserver | null>(null)

// 解析内容生成目录
const parseToc = (content: string) => {
  const tokens = marked.lexer(content)
  const items: TocItem[] = []
  
  tokens.forEach(token => {
    if (token.type === 'heading') {
      items.push({
        id: token.text.toLowerCase().replace(/\s+/g, '-'),
        text: token.text,
        level: token.depth
      })
    }
  })
  
  return items
}

// 滚动到指定标题
const scrollToHeading = (id: string) => {
  const el = document.getElementById(id)
  if (el) {
    // 获取元素的位置信息
    const rect = el.getBoundingClientRect()
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const offset = 80 // 头部导航栏的高度
    
    // 计算目标滚动位置
    const targetPosition = scrollTop + rect.top - offset
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    })
  }
}

// 监听标题元素是否可见
const observeHeadings = () => {
  if (observer.value) {
    observer.value.disconnect()
  }

  observer.value = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          activeId.value = entry.target.id
        }
      })
    },
    {
      rootMargin: '-80px 0px -80% 0px',
      threshold: [0, 1]
    }
  )

  // 观察所有标题元素
  tocItems.value.forEach(item => {
    const el = document.getElementById(item.id)
    if (el) {
      observer.value?.observe(el)
    }
  })
}

// 监听内容变化
watch(
  () => props.content,
  (newContent) => {
    tocItems.value = parseToc(newContent)
    // 等待 DOM 更新后再观察标题
    setTimeout(observeHeadings, 100)
  },
  { immediate: true }
)

onMounted(() => {
  observeHeadings()
  
  // 为所有标题添加 scroll-margin-top
  const style = document.createElement('style')
  style.textContent = `
    h1[id], h2[id], h3[id], h4[id], h5[id], h6[id] {
      scroll-margin-top: 80px;
    }
  `
  document.head.appendChild(style)
})

onUnmounted(() => {
  if (observer.value) {
    observer.value.disconnect()
  }
})
</script>

<style scoped>
.article-toc {
  font-size: 14px;
  line-height: 1.5;
  position: sticky;
  top: 80px;
}

.article-toc ol {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-item {
  margin: 4px 0;
}

.toc-item a {
  display: block;
  padding: 4px 8px;
  color: var(--el-text-color-regular);
  text-decoration: none;
  border-radius: 4px;
  transition: all 0.2s;
}

.toc-item a:hover {
  color: var(--el-color-primary);
  background-color: var(--el-fill-color-light);
}

.toc-item.active a {
  color: var(--el-color-primary);
  background-color: var(--el-fill-color-light);
  font-weight: 500;
}

.level-1 { margin-left: 0; }
.level-2 { margin-left: 1em; }
.level-3 { margin-left: 2em; }
.level-4 { margin-left: 3em; }
.level-5 { margin-left: 4em; }
.level-6 { margin-left: 5em; }

.no-toc {
  color: var(--el-text-color-secondary);
  text-align: center;
  padding: 16px;
}
</style> 