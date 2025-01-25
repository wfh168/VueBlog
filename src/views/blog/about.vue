<template>
  <div class="about-page">
    <div class="content">
      <!-- 关于信息 -->
      <div class="about-card">
        <div class="about-header">
          <img :src="profile.avatar" :alt="profile.name" class="avatar">
          <h1 class="name">{{ profile.name }}</h1>
          <p class="bio">{{ profile.bio }}</p>
          <div class="social-links">
            <a v-for="link in profile.social" :key="link.name" :href="link.url" target="_blank" class="social-link">
              <el-icon><component :is="link.icon" /></el-icon>
            </a>
          </div>
        </div>

        <div class="about-content markdown-body" v-html="renderedContent"></div>

        <!-- 技能标签 -->
        <div class="skills">
          <h2 class="section-title">技能标签</h2>
          <div class="skill-list">
            <div v-for="skill in skills" :key="skill.name" class="skill-item">
              <div class="skill-name">{{ skill.name }}</div>
              <el-progress
                :percentage="skill.level"
                :color="skill.color"
                :show-text="false"
                :stroke-width="8"
              />
            </div>
          </div>
        </div>

        <!-- 项目展示 -->
        <div class="projects">
          <h2 class="section-title">项目展示</h2>
          <div class="project-list">
            <div v-for="project in projects" :key="project.name" class="project-card">
              <div class="project-header">
                <h3 class="project-name">{{ project.name }}</h3>
                <div class="project-links">
                  <a v-if="project.demo" :href="project.demo" target="_blank" class="project-link">
                    <el-icon><Link /></el-icon>
                    Demo
                  </a>
                  <a v-if="project.github" :href="project.github" target="_blank" class="project-link">
                    <el-icon><Position /></el-icon>
                    GitHub
                  </a>
                </div>
              </div>
              <p class="project-desc">{{ project.description }}</p>
              <div class="project-tech">
                <span v-for="tech in project.tech" :key="tech" class="tech-tag">
                  {{ tech }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 时间线 -->
        <div class="timeline">
          <h2 class="section-title">时间线</h2>
          <div class="timeline-list">
            <div v-for="item in timeline" :key="item.date" class="timeline-item">
              <div class="timeline-date">{{ item.date }}</div>
              <div class="timeline-content">
                <h3 class="timeline-title">{{ item.title }}</h3>
                <p class="timeline-desc">{{ item.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 留言板 -->
      <div class="guestbook">
        <h2 class="section-title">留言板</h2>
        <div class="comment-form">
          <el-form ref="commentForm" :model="commentData" :rules="commentRules">
            <el-form-item prop="content">
              <el-input
                v-model="commentData.content"
                type="textarea"
                :rows="4"
                placeholder="写下你的留言..."
              />
            </el-form-item>
            <el-form-item class="form-footer">
              <div class="user-info">
                <el-form-item prop="nickname">
                  <el-input
                    v-model="commentData.nickname"
                    placeholder="昵称"
                    :prefix-icon="User"
                  />
                </el-form-item>
                <el-form-item prop="email">
                  <el-input
                    v-model="commentData.email"
                    placeholder="邮箱"
                    :prefix-icon="Message"
                  />
                </el-form-item>
              </div>
              <el-button type="primary" @click="submitComment">
                发表留言
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <div class="comment-list">
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-avatar">
              <img :src="comment.avatar" :alt="comment.nickname">
            </div>
            <div class="comment-content">
              <div class="comment-header">
                <span class="comment-author">{{ comment.nickname }}</span>
                <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
              </div>
              <div class="comment-text">{{ comment.content }}</div>
            </div>
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
      <!-- 博客信息 -->
      <div class="widget">
        <h3 class="widget-title">博客信息</h3>
        <ul class="stat-list">
          <li class="stat-item">
            <span class="stat-label">文章总数</span>
            <span class="stat-value">{{ stats.posts }}</span>
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
            <span class="stat-label">运行天数</span>
            <span class="stat-value">{{ stats.days }}</span>
          </li>
        </ul>
      </div>

      <!-- 最近访客 -->
      <div class="widget">
        <h3 class="widget-title">最近访客</h3>
        <div class="visitor-list">
          <div v-for="visitor in visitors" :key="visitor.id" class="visitor-item">
            <img :src="visitor.avatar" :alt="visitor.nickname" class="visitor-avatar">
            <div class="visitor-info">
              <div class="visitor-name">{{ visitor.nickname }}</div>
              <div class="visitor-date">{{ formatDate(visitor.visited_at) }}</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { User, Message, Link, Position } from '@element-plus/icons-vue'
import { marked } from 'marked'
import dayjs from 'dayjs'

// 个人信息
const profile = ref({
  name: '博主',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
  bio: '前端开发工程师，热爱技术，热爱分享。',
  social: [
    { name: 'GitHub', icon: 'Position', url: 'https://github.com' },
    { name: 'Twitter', icon: 'Position', url: 'https://twitter.com' },
    { name: 'Email', icon: 'Message', url: 'mailto:example@example.com' }
  ]
})

// 关于内容
const content = ref(`
# 关于我

热爱编程，热爱开源，喜欢分享技术经验。

## 技术栈

- 前端：Vue.js, React.js, TypeScript
- 后端：Node.js, Python, Go
- 数据库：MySQL, MongoDB, Redis
- 其他：Docker, Git, Linux

## 联系我

如果你有任何问题或建议，欢迎通过以下方式联系我：

- Email: example@example.com
- GitHub: https://github.com
- Twitter: https://twitter.com
`)

// 渲染 Markdown 内容
const renderedContent = marked(content.value)

// 技能标签
const skills = ref([
  { name: 'Vue.js', level: 90, color: '#42b883' },
  { name: 'TypeScript', level: 85, color: '#3178c6' },
  { name: 'Node.js', level: 80, color: '#339933' },
  { name: 'React.js', level: 75, color: '#61dafb' },
  { name: 'Python', level: 70, color: '#3776ab' }
])

// 项目展示
const projects = ref([
  {
    name: '个人博客系统',
    description: '使用 Vue 3 和 TypeScript 构建的现代化博客系统，包括前台展示和后台管理功能。',
    demo: 'https://example.com',
    github: 'https://github.com',
    tech: ['Vue 3', 'TypeScript', 'Element Plus']
  },
  // 更多项目...
])

// 时间线
const timeline = ref([
  {
    date: '2024-01',
    title: '个人博客上线',
    description: '使用 Vue 3 和 TypeScript 开发的个人博客系统正式上线。'
  },
  // 更多时间线项目...
])

// 统计信息
const stats = ref({
  posts: 100,
  categories: 10,
  tags: 30,
  days: 365
})

// 最近访客
const visitors = ref([
  {
    id: 1,
    nickname: '访客1',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    visited_at: '2024-01-20'
  },
  // 更多访客...
])

// 留言相关
const commentData = ref({
  nickname: '',
  email: '',
  content: ''
})

const commentRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入留言内容', trigger: 'blur' },
    { min: 2, max: 500, message: '长度在 2 到 500 个字符', trigger: 'blur' }
  ]
}

const comments = ref([
  {
    id: 1,
    nickname: '访客1',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    content: '博客做得很好，继续加油！',
    created_at: '2024-01-20'
  },
  // 更多留言...
])

const hasMore = ref(true)

// 提交留言
const submitComment = () => {
  console.log('提交留言:', commentData.value)
}

// 加载更多
const loadMore = () => {
  console.log('加载更多留言')
}

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD')
}
</script>

<style scoped>
.about-page {
  margin-top: 20px;
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 24px;
}

.content {
  min-height: 200px;
}

.about-card {
  padding: 24px;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-bottom: 24px;
}

.about-header {
  text-align: center;
  margin-bottom: 32px;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  margin-bottom: 16px;
}

.name {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 8px;
}

.bio {
  color: var(--text-color-light);
  margin: 0 0 16px;
}

.social-links {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.social-link {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--hover-bg);
  color: var(--text-color);
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: all 0.3s;
}

.social-link:hover {
  background-color: var(--el-color-primary);
  color: #fff;
  transform: translateY(-2px);
}

.about-content {
  margin-bottom: 32px;
  line-height: 1.8;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--el-color-primary);
}

.skills {
  margin-bottom: 32px;
}

.skill-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.skill-item {
  margin-bottom: 8px;
}

.skill-name {
  font-size: 14px;
  color: var(--text-color);
  margin-bottom: 4px;
}

.projects {
  margin-bottom: 32px;
}

.project-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.project-card {
  padding: 16px;
  background-color: var(--hover-bg);
  border-radius: 8px;
  transition: all 0.3s;
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.project-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.project-links {
  display: flex;
  gap: 8px;
}

.project-link {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-color-light);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
}

.project-link:hover {
  color: var(--el-color-primary);
}

.project-desc {
  color: var(--text-color);
  font-size: 14px;
  margin: 0 0 12px;
}

.project-tech {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tech-tag {
  padding: 2px 8px;
  background-color: var(--bg-color);
  color: var(--text-color-light);
  border-radius: 4px;
  font-size: 12px;
}

.timeline {
  margin-bottom: 32px;
}

.timeline-list {
  position: relative;
  padding-left: 20px;
}

.timeline-list::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 2px;
  background-color: var(--border-color);
}

.timeline-item {
  position: relative;
  padding-bottom: 24px;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: -24px;
  top: 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--el-color-primary);
}

.timeline-date {
  font-size: 14px;
  color: var(--text-color-light);
  margin-bottom: 4px;
}

.timeline-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 4px;
}

.timeline-desc {
  color: var(--text-color);
  font-size: 14px;
  margin: 0;
}

.guestbook {
  padding: 24px;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.comment-form {
  margin-bottom: 32px;
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0;
}

.user-info {
  display: flex;
  gap: 16px;
  flex: 1;
  margin-right: 16px;
}

.comment-list {
  margin-bottom: 24px;
}

.comment-item {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.comment-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.comment-author {
  font-weight: 500;
  color: var(--text-color);
}

.comment-date {
  font-size: 12px;
  color: var(--text-color-light);
}

.comment-text {
  color: var(--text-color);
  line-height: 1.6;
}

.load-more {
  text-align: center;
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

.visitor-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.visitor-item {
  text-align: center;
}

.visitor-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-bottom: 4px;
}

.visitor-name {
  font-size: 12px;
  color: var(--text-color);
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.visitor-date {
  font-size: 12px;
  color: var(--text-color-light);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .about-page {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
    margin-top: 24px;
  }

  .skill-list,
  .project-list {
    grid-template-columns: 1fr;
  }

  .form-footer {
    flex-direction: column;
  }

  .user-info {
    flex-direction: column;
    margin-right: 0;
    margin-bottom: 16px;
  }

  .visitor-list {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style> 