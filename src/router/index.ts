import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 配置 NProgress
NProgress.configure({ 
  easing: 'ease',
  speed: 500,
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.3
})

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/index.vue')
  },
  {
    path: '/blog',
    component: () => import('@/views/blog/layout.vue'),
    children: [
      {
        path: '',
        component: () => import('@/views/blog/home.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'article/:id',
        component: () => import('@/views/blog/article.vue'),
        meta: { title: '文章详情' }
      },
      {
        path: 'category',
        component: () => import('@/views/blog/category.vue'),
        meta: { title: '分类' }
      },
      {
        path: 'category/:id',
        component: () => import('@/views/blog/category.vue'),
        meta: { title: '分类详情' }
      },
      {
        path: 'tag',
        component: () => import('@/views/blog/tag.vue'),
        meta: { title: '标签' }
      },
      {
        path: 'tag/:id',
        component: () => import('@/views/blog/tag.vue'),
        meta: { title: '标签详情' }
      },
      {
        path: 'archive',
        component: () => import('@/views/blog/archive.vue'),
        meta: { title: '归档' }
      },
      {
        path: 'about',
        component: () => import('@/views/blog/about.vue'),
        meta: { title: '关于' }
      }
    ]
  },
  {
    path: '/',
    component: () => import('../layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/dashboard/index.vue')
      },
      {
        path: 'article',
        name: 'Article',
        component: () => import('../views/article/index.vue')
      },
      {
        path: 'article/create',
        name: 'CreateArticle',
        component: () => import('../views/article/editor.vue')
      },
      {
        path: 'article/:id/edit',
        name: 'EditArticle',
        component: () => import('../views/article/editor.vue')
      },
      {
        path: 'category',
        name: 'Category',
        component: () => import('../views/category/index.vue')
      },
      {
        path: 'tag',
        name: 'Tag',
        component: () => import('../views/tag/index.vue')
      },
      {
        path: 'comment',
        name: 'Comment',
        component: () => import('../views/comment/index.vue')
      },
      {
        path: 'user',
        name: 'User',
        redirect: '/user/info',
        children: [
          {
            path: 'info',
            name: 'UserInfo',
            component: () => import('../views/user/info.vue')
          },
          {
            path: 'permission',
            name: 'UserPermission',
            component: () => import('../views/user/permission.vue')
          }
        ]
      },
      {
        path: 'gallery',
        name: 'Gallery',
        component: () => import('../views/gallery/index.vue'),
        meta: {
          title: '图库管理',
          requiresAuth: true
        }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/settings/index.vue'),
        meta: {
          title: '系统设置',
          icon: 'Setting'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由前置守卫
router.beforeEach((to, from, next) => {
  // 开始加载进度条
  NProgress.start()
  next()
})

// 路由后置守卫
router.afterEach(() => {
  // 结束加载进度条
  NProgress.done()
})

// 路由错误处理
router.onError(() => {
  // 发生错误时结束加载进度条
  NProgress.done()
})

export default router 