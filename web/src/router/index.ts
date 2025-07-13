import { createRouter, createWebHistory } from 'vue-router';
import {authService} from "@/service/AuthService";
import BusinessListCom from '../components/BusinessListCom.vue'
import BusinessInfoCom from '../components/BusinessInfoCom.vue'
import {hColgroup} from "element-plus/es/components/table/src/h-helper";
import props = hColgroup.props;
import User from '@/views/User.vue'



const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {path:"/", redirect:{name:"main"}},
    {path:"/main",name: "main",component:() => import('@/views/Main.vue'), meta:{ requiresAuth: true } },
    {path:"/login",name: "login",component: () => import('@/views/Login.vue')},
    {path:"/orderList",name:"orderList",component:() => import('@/views/OrderList.vue')},
    {path:"/businessList",name:"businessList",component:() => import('@/views/BusinessList.vue')},
    {path:"/payment",name:"payment",component:() => import('@/views/Payment.vue')},
    {path:"/order",name:"order",component:() => import('@/views/Order.vue')},
    {path:"/register",name:"register",component:() => import('@/views/Register.vue')},
    {
      path: '/businessInfo/:id',
      name: 'businessInfo',
      component: () => import('@/views/BusinessInfo.vue')
    },
    {
      path: '/user',
      name: 'User',
      component: User
    }
  ],
})

export default router
