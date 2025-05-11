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
    path: '/register',
    name: 'Register',
    component: () => import('../views/register/index.vue')
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
    redirect: '/blog'
  },
  {
    path: '/',
    component: () => import('../layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/dashboard/index.vue'),
        meta: { roles: ['admin', 'editor'] }
      },
      {
        path: 'article',
        name: 'Article',
        component: () => import('../views/article/index.vue'),
        meta: { roles: ['admin', 'editor'] }
      },
      {
        path: 'article/create',
        name: 'CreateArticle',
        component: () => import('../views/article/editor.vue'),
        meta: { roles: ['admin', 'editor'] }
      },
      {
        path: 'article/:id/edit',
        name: 'EditArticle',
        component: () => import('../views/article/editor.vue'),
        meta: { roles: ['admin', 'editor'] }
      },
      {
        path: 'category',
        name: 'Category',
        component: () => import('../views/category/index.vue'),
        meta: { roles: ['admin', 'editor'] }
      },
      {
        path: 'tag',
        name: 'Tag',
        component: () => import('../views/tag/index.vue'),
        meta: { roles: ['admin', 'editor'] }
      },
      {
        path: 'comment',
        name: 'Comment',
        component: () => import('../views/comment/index.vue'),
        meta: { roles: ['admin'] }
      },
      {
        path: 'user',
        name: 'User',
        redirect: '/user/info',
        meta: { roles: ['admin'] },
        children: [
          {
            path: 'info',
            name: 'UserInfo',
            component: () => import('../views/user/info.vue'),
            meta: { roles: ['admin'] }
          },
          {
            path: 'permission',
            name: 'UserPermission',
            component: () => import('../views/user/permission.vue'),
            meta: { roles: ['admin'] }
          },
          {
            path: 'profile',
            name: 'UserProfile',
            component: () => import('../components/UserProfile.vue'),
            meta: { roles: ['admin', 'editor'] }
          }
        ]
      },
      {
        path: 'gallery',
        name: 'Gallery',
        component: () => import('../views/gallery/index.vue'),
        meta: {
          title: '图库管理',
          requiresAuth: true,
          roles: ['admin']
        }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/settings/index.vue'),
        meta: {
          title: '系统设置',
          icon: 'Setting',
          roles: ['admin']
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
  NProgress.start()
  // 权限控制
  if (to.path.startsWith('/dashboard') || (to.meta && to.meta.roles)) {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    const role = userInfo.role
    if (!role) {
      // 未登录或无角色
      return next('/login')
    }
    // 检查 meta.roles
    if (to.meta && Array.isArray(to.meta.roles) && !to.meta.roles.includes(role)) {
      return next('/403')
    }
  }
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