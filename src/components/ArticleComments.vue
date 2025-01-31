<template>
  <div class="article-comments">
    <div class="comments-header">
      <h3>评论区</h3>
      <span class="comment-count">{{ comments.length }} 条评论</span>
    </div>

    <!-- 评论列表 -->
    <div class="comment-list" v-if="comments.length">
      <div v-for="comment in comments" :key="comment.id" class="comment-item">
        <div class="comment-avatar">
          <el-avatar :src="comment.author.avatar" />
        </div>
        <div class="comment-content">
          <div class="comment-info">
            <span class="author-name">{{ comment.author.name }}</span>
            <span class="comment-time">{{ comment.time }}</span>
          </div>
          <div class="comment-text">{{ comment.text }}</div>
          <div class="comment-actions">
            <el-button 
              link 
              type="primary" 
              @click="handleReply(comment)"
            >
              <el-icon><ChatDotRound /></el-icon>
              回复
            </el-button>
            <el-button 
              v-if="comment.author.id === currentUser.id"
              link 
              type="danger" 
              @click="handleDelete(comment.id)"
            >
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </div>

          <!-- 回复列表 -->
          <div v-if="comment.replies && comment.replies.length" class="reply-list">
            <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
              <div class="reply-avatar">
                <el-avatar :src="reply.author.avatar" :size="24" />
              </div>
              <div class="reply-content">
                <div class="reply-info">
                  <span class="author-name">{{ reply.author.name }}</span>
                  <span class="reply-time">{{ reply.time }}</span>
                </div>
                <div class="reply-text">{{ reply.text }}</div>
                <div class="reply-actions">
                  <el-button 
                    v-if="reply.author.id === currentUser.id"
                    link 
                    type="danger" 
                    @click="handleDeleteReply(comment.id, reply.id)"
                  >
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 回复编辑器 -->
          <div v-if="replyTo?.id === comment.id" class="reply-editor">
            <el-input
              v-model="replyComment"
              type="textarea"
              :rows="2"
              placeholder="写下你的回复..."
            />
            <div class="editor-footer">
              <el-button @click="cancelReply">取消</el-button>
              <el-button type="primary" @click="submitReply">提交回复</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="no-comments">暂无评论</div>

    <!-- 评论编辑器 -->
    <div class="comment-editor">
      <el-input
        v-model="newComment"
        type="textarea"
        :rows="3"
        placeholder="写下你的评论..."
      />
      <div class="editor-footer">
        <el-button type="primary" @click="submitComment">提交评论</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, ChatDotRound } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

// 当前用户信息
const currentUser = {
  id: 1,
  name: '示例用户',
  avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
}

// 评论数据
const comments = ref([
  {
    id: 1,
    author: {
      id: 2,
      name: 'John Doe',
      avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
    },
    text: '这是一条示例评论',
    time: '2024-01-20 12:00:00',
    replies: [
      {
        id: 1,
        author: {
          id: 1,
          name: '示例用户',
          avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
        },
        text: '这是一条示例回复',
        time: '2024-01-20 12:30:00'
      }
    ]
  }
])

// 新评论内容
const newComment = ref('')

// 回复相关
const replyTo = ref(null)
const replyComment = ref('')

// 提交评论
const submitComment = () => {
  if (!newComment.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }

  const comment = {
    id: Date.now(),
    author: currentUser,
    text: newComment.value,
    time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    replies: []
  }

  comments.value.unshift(comment)
  newComment.value = ''
  ElMessage.success('评论成功')
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
    author: currentUser,
    text: replyComment.value,
    time: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }

  const comment = comments.value.find(c => c.id === replyTo.value.id)
  if (comment) {
    if (!comment.replies) {
      comment.replies = []
    }
    comment.replies.push(reply)
  }

  cancelReply()
  ElMessage.success('回复成功')
}

// 删除评论
const handleDelete = async (commentId) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    comments.value = comments.value.filter(comment => comment.id !== commentId)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消删除
  }
}

// 删除回复
const handleDeleteReply = async (commentId, replyId) => {
  try {
    await ElMessageBox.confirm('确定要删除这条回复吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const comment = comments.value.find(c => c.id === commentId)
    if (comment && comment.replies) {
      comment.replies = comment.replies.filter(reply => reply.id !== replyId)
    }
    ElMessage.success('删除成功')
  } catch {
    // 用户取消删除
  }
}
</script>

<style scoped>
.article-comments {
  margin-top: 2rem;
}

.comments-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.comments-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 500;
}

.comment-count {
  margin-left: 1rem;
  color: var(--el-text-color-secondary);
}

.comment-list {
  margin-bottom: 2rem;
}

.comment-item {
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.comment-content {
  flex: 1;
}

.comment-info {
  margin-bottom: 0.5rem;
}

.author-name {
  font-weight: 500;
  margin-right: 1rem;
}

.comment-time {
  color: var(--el-text-color-secondary);
  font-size: 0.875rem;
}

.comment-text {
  line-height: 1.5;
  margin-bottom: 0.5rem;
}

.comment-actions {
  display: flex;
  gap: 1rem;
}

.reply-list {
  margin: 1rem 0;
  padding-left: 1rem;
  border-left: 2px solid var(--el-border-color-lighter);
}

.reply-item {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.reply-content {
  flex: 1;
}

.reply-info {
  margin-bottom: 0.25rem;
}

.reply-time {
  color: var(--el-text-color-secondary);
  font-size: 0.875rem;
  margin-left: 0.5rem;
}

.reply-text {
  line-height: 1.5;
  margin-bottom: 0.25rem;
}

.reply-editor {
  margin: 1rem 0;
}

.editor-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.no-comments {
  text-align: center;
  color: var(--el-text-color-secondary);
  padding: 2rem 0;
}
</style> 