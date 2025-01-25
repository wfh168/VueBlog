<template>
  <nav class="article-toc" v-if="tocItems.length">
    <ul class="toc-list">
      <li v-for="item in tocItems" :key="item.id" :class="['toc-item', `level-${item.level}`]">
        <a :href="'#' + item.id" 
           :class="['toc-link', { active: activeId === item.id }]"
           @click.prevent="scrollToHeading(item.id)">
          {{ item.text }}
        </a>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps<{
  content: string
}>()

interface TocItem {
  id: string
  level: number
  text: string
  element?: HTMLElement
}

const tocItems = ref<TocItem[]>([])
const activeId = ref('')

// 解析内容生成目录
const parseToc = () => {
  const container = document.querySelector('.article-content')
  if (!container) return

  const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6')
  const items: TocItem[] = []

  headings.forEach((heading: Element) => {
    const level = parseInt(heading.tagName[1])
    const text = heading.textContent || ''
    const id = text.toLowerCase().replace(/\s+/g, '-')
    heading.id = id

    items.push({
      id,
      level,
      text,
      element: heading as HTMLElement
    })
  })

  tocItems.value = items
}

// 滚动到指定标题
const scrollToHeading = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    const top = element.offsetTop - 80 // 考虑顶部导航栏高度
    window.scrollTo({
      top,
      behavior: 'smooth'
    })
  }
}

// 监听滚动更新激活项
const updateActiveHeading = () => {
  const scrollTop = window.scrollY
  let current = ''

  for (const item of tocItems.value) {
    const element = document.getElementById(item.id)
    if (element && element.offsetTop - 100 <= scrollTop) {
      current = item.id
    } else {
      break
    }
  }

  activeId.value = current
}

// 监听内容变化
watch(() => props.content, () => {
  setTimeout(parseToc, 100)
}, { immediate: true })

// 添加滚动监听
onMounted(() => {
  window.addEventListener('scroll', updateActiveHeading)
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateActiveHeading)
})
</script>

<style scoped>
.article-toc {
  position: relative;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-item {
  padding: 0;
  margin: 0;
}

.toc-link {
  display: block;
  padding: 6px 12px;
  margin: 4px 0;
  color: var(--text-color-2);
  text-decoration: none;
  font-size: 13px;
  line-height: 1.4;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.toc-link:hover {
  color: var(--text-color-1);
  background-color: var(--bg-color-hover);
}

.toc-link.active {
  color: var(--primary-color);
  background-color: var(--bg-color-hover);
  font-weight: 500;
}

.level-1 { padding-left: 0; }
.level-2 { padding-left: 12px; }
.level-3 { padding-left: 24px; }
.level-4 { padding-left: 36px; }
.level-5 { padding-left: 48px; }
.level-6 { padding-left: 60px; }
</style> 