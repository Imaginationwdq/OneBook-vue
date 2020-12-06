import Vue from 'vue'
import Router from 'vue-router'
import Login from './components/Login'
import Home from './components/Home'
import Welcome from './components/Welcome'
import Users from './components/user/Users'
import Rights from './components/power/Rights'
import Roles from './components/power/Roles'
import Cate from './components/goods/Cate'
import Params from './components/goods/Params'
import GoodsList from './components/goods/List'
import Add from './components/goods/Add'
import Order from './components/order/Order'
import Report from './components/report/Report'
import Mouse from './components/mouse/Mouse'

Vue.use(Router)

const router = new Router({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: Users },
        { path: '/rights', component: Rights },
        { path: '/roles', component: Roles },
        { path: '/cate', component: Cate },
        { path: '/params', component: Params },
        { path: '/goods', component: GoodsList },
        { path: '/goods/add', component: Add },
        { path: '/orders', component: Order },
        { path: '/reports', component: Report },
        { path: '/mouse', component: Mouse }
      ]
    }
  ]
})

// 挂载路由导航守卫
// 只要登录成功之后，才能访问后面的网页，如果没有登录，自动跳转到login
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数，表示放行
  //     next()  放行    next('/login')  强制跳转

  if (to.path === '/login') return next()

  // 获取token
  const tokenStr = JSON.parse(localStorage.getItem('token'))
  if (!tokenStr) return next('/login')
  next()
})

export default router
