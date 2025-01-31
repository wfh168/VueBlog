<template>
  <div class="article-page">
    <div class="article-main">
      <el-card class="article-card" shadow="never">
        <article>
          <h1 class="article-title">{{ article.title }}</h1>
          <div class="article-meta">
            <el-space wrap :size="12">
              <el-tag size="small" :color="isDark ? '#2c2c2c' : '#f5f7fa'" class="meta-tag">
                <template #icon><el-icon><UserFilled /></el-icon></template>
                {{ article.author }}
              </el-tag>
              <el-tag size="small" :color="isDark ? '#2c2c2c' : '#f5f7fa'" class="meta-tag">
                <template #icon><el-icon><Clock /></el-icon></template>
                {{ formatDate(article.created_at) }}
              </el-tag>
              <el-tag size="small" :color="isDark ? '#2c2c2c' : '#f5f7fa'" class="meta-tag">
                <template #icon><el-icon><View /></el-icon></template>
                {{ article.views }} 阅读
              </el-tag>
              <el-tag size="small" :color="isDark ? '#2c2c2c' : '#f5f7fa'" class="meta-tag">
                <template #icon><el-icon><ChatDotRound /></el-icon></template>
                {{ article.comments }} 评论
              </el-tag>
              <el-tag size="small" :color="isDark ? '#2c2c2c' : '#f5f7fa'" class="meta-tag">
                <template #icon><el-icon><Folder /></el-icon></template>
                {{ article.category.name }}
              </el-tag>
              <el-tag v-for="tag in article.tags" :key="tag" size="small" :color="isDark ? '#2c2c2c' : '#f5f7fa'" class="meta-tag">
                <template #icon><el-icon><PriceTag /></el-icon></template>
                {{ tag }}
              </el-tag>
            </el-space>
          </div>

          <div class="article-content">
            <MarkdownViewer :content="article.content" />
          </div>

          <div class="article-actions">
            <el-space wrap :size="20">
              <el-button type="primary" plain>
                <template #icon><el-icon><Star /></el-icon></template>
                收藏文章
              </el-button>
              <el-button type="primary" plain>
                <template #icon><el-icon><Share /></el-icon></template>
                分享文章
              </el-button>
            </el-space>
          </div>

          <footer class="article-footer">
            <el-alert
              :title="'本文作者：' + article.author"
              type="info"
              :closable="false"
              class="copyright-alert"
            >
              <p>本文链接：{{ articleUrl }}</p>
              <p>版权声明：本博客所有文章除特别声明外，均采用 CC BY-NC-SA 4.0 许可协议。转载请注明出处！</p>
            </el-alert>

            <el-divider />

            <nav class="article-navigation">
              <el-row :gutter="24">
                <el-col :span="12" v-if="article.prev">
                  <el-card
                    shadow="hover"
                    class="nav-card prev"
                    @click="router.push(`/blog/article/${article.prev.id}`)"
                  >
                    <template #header>
                      <div class="nav-card-header">
                        <el-icon><ArrowLeft /></el-icon>
                        上一篇
                      </div>
                    </template>
                    {{ article.prev.title }}
                  </el-card>
                </el-col>
                <el-col :span="12" v-if="article.next">
                  <el-card
                    shadow="hover"
                    class="nav-card next"
                    @click="router.push(`/blog/article/${article.next.id}`)"
                  >
                    <template #header>
                      <div class="nav-card-header">
                        下一篇
                        <el-icon><ArrowRight /></el-icon>
                      </div>
                    </template>
                    {{ article.next.title }}
                  </el-card>
                </el-col>
              </el-row>
            </nav>
          </footer>
        </article>
      </el-card>

      <!-- 评论区 -->
      <el-card class="comments-card">
        <ArticleComments />
      </el-card>
    </div>

    <!-- 右侧边栏 -->
    <aside class="right-sidebar">
      <el-affix :offset="80">
        <el-card shadow="never" class="toc-card">
          <template #header>
            <div class="toc-title">
              <el-icon><Document /></el-icon>
              目录
            </div>
          </template>
          <ArticleToc :content="article.content" />
        </el-card>
      </el-affix>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Clock, View, ChatDotRound, Folder,
  Document, UserFilled, ArrowLeft, ArrowRight,
  Delete, Share, Star, PriceTag
} from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDark } from '@vueuse/core'
import ArticleToc from '@/components/ArticleToc.vue'
import MarkdownViewer from '@/components/MarkdownViewer.vue'
import ArticleComments from '@/components/ArticleComments.vue'

const route = useRoute()
const router = useRouter()
const isDark = useDark()

// 文章数据
const article = ref({
  id: 1,
  title: 'Nacos 注册中心 - 环境隔离',
  author: '星梦启航',
  created_at: '2024-03-20',
  views: 1234,
  comments: 23,
  category: { id: 1, name: '微服务' },
  tags: ['Nacos', 'Spring Cloud', '注册中心'],
  content: `# 2.注册中心

本章主要学习Nacos中的一些特性和原理，以及与Eureka的功能对比。

## 2.1.环境隔离

企业实际开发中，往往会搭建多个运行环境，例如：

- 开发环境
- 测试环境
- 预发布环境
- 生产环境

这些不同环境之间的服务和数据之间需要隔离。

还有的企业中，会开发多个项目，共享nacos集群。此时，这些项目之间也需要把服务和数据隔离。

因此，Nacos提供了基于\`namespace\`的环境隔离功能。具体的隔离层次如图所示：

![Nacos隔离层次](https://example.com/nacos-namespace.png)

说明：

- Nacos中可以配置多个\`namespace\`，相互之间完全隔离。默认的\`namespace\`名为\`public\`
- \`namespace\`下还可以继续分组，也就是group ，相互隔离。 默认的group是\`DEFAULT_GROUP\`
- \`group\`之下就是服务和配置了

### 2.1.1.创建namespace

nacos提供了一个默认的\`namespace\`，叫做\`public\`：

![默认namespace](https://example.com/default-namespace.png)

默认所有的服务和配置都属于这个\`namespace\`，当然我们也可以自己创建新的\`namespace\`。

添加完成后，可以在页面看到我们新建的\`namespace\`，并且Nacos为我们自动生成了一个命名空间id。

我们切换到配置列表页，你会发现\`dev\`这个命名空间下没有任何配置，因为之前我们添加的所有配置都在\`public\`下。

### 2.1.2.微服务配置namespace

默认情况下，所有的微服务注册发现、配置管理都是走\`public\`这个命名空间。如果要指定命名空间则需要修改\`application.yml\`文件。

比如，我们修改\`item-service\`服务的bootstrap.yml文件，添加服务发现配置，指定其\`namespace\`：

\`\`\`yaml
spring:
  application:
    name: item-service # 服务名称
  profiles:
    active: dev
  cloud:
    nacos:
      server-addr: 192.168.150.101 # nacos地址
      discovery: # 服务发现配置
        namespace: 8c468c63-b650-48da-a632-311c75e6d235 # 设置namespace，必须用id
      # 。。。略
\`\`\`

启动\`item-service\`，查看服务列表，会发现\`item-service\`出现在\`dev\`下，而其它服务则出现在\`public\`下。

此时访问\`http://localhost:8082/doc.html\`，基于\`swagger\`做测试，会发现查询结果中缺少商品的最新价格信息。

我们查看服务运行日志，会发现\`cart-service\`服务在远程调用\`item-service\`时，并没有找到可用的实例。这证明不同namespace之间确实是相互隔离的，不可访问。

当我们把\`namespace\`切换回\`public\`，或者统一都是以\`dev\`时访问恢复正常。`,
  prev: { id: 1, title: 'Spring Cloud Gateway 实战' },
  next: { id: 2, title: 'Nacos配置中心详解' }
})

// 用户数据
const user = ref({
  id: 1,
  name: '当前用户',
  avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
})

// 评论数据
const comments = ref([
  {
    id: 1,
    author: '张三',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    text: '写得很好，学习了！',
    created_at: '2024-03-21 10:30:00'
  },
  {
    id: 2,
    author: '李四',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    text: '这篇文章对我帮助很大。',
    created_at: '2024-03-21 11:15:00'
  }
])

// 新评论内容
const newComment = ref('')

// 回复相关数据
const replyTo = ref(null)
const replyComment = ref('')

// 提交评论
const submitComment = () => {
  if (!newComment.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }

  comments.value.push({
    id: Date.now(),
    author: user.value.name,
    avatar: user.value.avatar,
    text: newComment.value,
    created_at: dayjs().format('YYYY-MM-DD HH:mm:ss')
  })

  newComment.value = ''
  ElMessage.success('评论发表成功')
}

// 删除评论
const deleteComment = (id: number) => {
  const index = comments.value.findIndex(c => c.id === id)
  if (index > -1) {
    comments.value.splice(index, 1)
    ElMessage.success('评论删除成功')
  }
}

// 处理回复
const handleReply = (comment) => {
  replyTo.value = comment
  replyComment.value = ''
}

// 取消回复
const cancelReply = () => {
  replyTo.value = null
  replyComment.value = ''
}

// 提交回复
const submitReply = () => {
  if (!replyComment.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }

  const reply = {
    id: Date.now(),
    author: user.value.name,
    avatar: user.value.avatar,
    text: replyComment.value,
    created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    reply_to: replyTo.value.author
  }

  if (!replyTo.value.replies) {
    replyTo.value.replies = []
  }
  replyTo.value.replies.push(reply)

  cancelReply()
  ElMessage.success('回复发表成功')
}

// 删除评论或回复
const handleDelete = (id) => {
  ElMessageBox.confirm(
    '确定要删除这条评论吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    deleteComment(id)
  }).catch(() => {})
}

// 复制代码功能
const copyCode = (code: string) => {
  navigator.clipboard.writeText(code).then(() => {
    ElMessage.success('复制成功')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

// 计算文章完整URL
const articleUrl = computed(() => {
  return window.location.href
})

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD')
}

onMounted(() => {
  // 获取文章详情
  console.log('获取文章详情:', route.params.id)
})
</script>

<style scoped>
.article-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  gap: 20px;
}

.article-main {
  flex: 1;
  min-width: 0;
}

.right-sidebar {
  width: 300px;
  flex-shrink: 0;
}

.article-card {
  margin-bottom: 20px;
}

.article-title {
  font-size: 2em;
  margin: 0 0 1em;
  color: var(--el-text-color-primary);
}

.article-meta {
  margin-bottom: 1em;
}

.meta-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: none;
  font-size: 13px;
  color: var(--el-text-color-regular);
  height: 24px;
  line-height: 24px;
}

.meta-tag :deep(.el-icon) {
  font-size: 14px;
  margin: 0;
  position: relative;
  top: 1px;
}

.meta-tag a {
  color: inherit;
  text-decoration: none;
}

.meta-tag a:hover {
  color: var(--el-color-primary);
}

.article-content {
  margin: 2em 0;
}

.article-actions {
  margin: 2em 0;
  display: flex;
  justify-content: center;
}

.article-footer {
  margin-top: 2em;
}

.copyright-alert {
  margin: 2em 0;
}

.copyright-alert :deep(.el-alert__title) {
  font-size: 16px;
}

.nav-card {
  cursor: pointer;
  transition: all 0.3s;
}

.nav-card:hover {
  transform: translateY(-2px);
}

.nav-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-regular);
}

.prev .nav-card-header {
  justify-content: flex-start;
}

.next .nav-card-header {
  justify-content: flex-end;
}

/* 评论区样式 */
.comments-card {
  margin-top: 20px;
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comments-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
}

.comments-count {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.comment-editor {
  margin: 20px 0;
}

.editor-header {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.editor-info {
  flex: 1;
}

.editor-name {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.comment-textarea {
  width: 100%;
}

.editor-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.comment-list {
  margin-top: 20px;
}

.comment-item {
  display: flex;
  gap: 16px;
  padding: 20px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-header {
  margin-bottom: 8px;
}

.comment-author {
  font-weight: 500;
  margin-right: 8px;
}

.comment-time {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.comment-text {
  margin: 8px 0;
  line-height: 1.6;
  color: var(--el-text-color-primary);
}

.comment-actions {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}

.comment-action {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.comment-action:hover {
  color: var(--el-color-primary);
}

/* 回复样式 */
.reply-list {
  margin-top: 16px;
  padding: 16px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
}

.reply-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
}

.reply-item:not(:last-child) {
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.reply-content {
  flex: 1;
  min-width: 0;
}

.reply-header {
  margin-bottom: 8px;
  font-size: 14px;
}

.reply-author {
  font-weight: 500;
  margin-right: 4px;
}

.reply-to {
  color: var(--el-text-color-secondary);
  margin: 0 4px;
}

.reply-target {
  color: var(--el-color-primary);
  margin-right: 8px;
}

.reply-time {
  color: var(--el-text-color-secondary);
}

.reply-text {
  margin: 4px 0;
  line-height: 1.6;
  color: var(--el-text-color-primary);
}

.reply-editor {
  margin-top: 16px;
  padding: 16px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
}

.reply-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

/* 目录样式 */
.toc-card {
  position: sticky;
  top: 80px;
}

.toc-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
}

@media screen and (max-width: 1200px) {
  .right-sidebar {
    display: none;
  }
}

@media screen and (max-width: 768px) {
  .article-page {
    padding: 10px;
  }

  .article-title {
    font-size: 1.5em;
  }

  .meta-tag {
    padding: 4px 8px;
  }
}
</style> 