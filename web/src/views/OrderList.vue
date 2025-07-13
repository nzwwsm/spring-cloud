<script setup lang="ts">

import Bottom from "@/components/bottom.vue";
import { ref, onMounted } from 'vue'
import {getPaidOrders, getUnpaidOrders} from "@/api/order";
import axios, { AxiosError } from 'axios';
import { useRouter } from 'vue-router'

interface OrderItem {
  quanity: number
  productName: string
  commodityPrice: number
  image: string
}

interface Order {
  orderId: number
  payAmount: number
  businessName: string
  businessDeliveryFees: number
  orderItemDTOs: OrderItem[]
}
// 模拟数据
const unpaidOrders = ref<Order[]>([])

const paidOrders = ref<Order[]>([])

// 控制每个订单的展开状态
const expandedOrders = ref<number[]>([])

// 切换订单展开状态
const toggleOrder = (orderId: number) => {
  const index = expandedOrders.value.indexOf(orderId)
  if (index === -1) {
    expandedOrders.value.push(orderId)
  } else {
    expandedOrders.value.splice(index, 1)
  }
}

// 检查订单是否展开
const isExpanded = (orderId: number) => {
  return expandedOrders.value.includes(orderId)
}

const router = useRouter()

// 检查登录状态
const checkLoginStatus = () => {
  const token = localStorage.getItem('token')
  if (!token) {
    console.warn('未检测到登录状态')
    // 使用 alert 提示用户
    alert('请先登录后再查看订单')
    router.push('/login')
    return false
  }
  return true
}

// 获取订单列表
const fetchOrders = async () => {
  // 先检查登录状态
  if (!checkLoginStatus()) {
    return
  }

  try {
    const token = localStorage.getItem('token')
    console.log('开始获取订单列表，token:', token?.substring(0, 10) + '...') // 只显示 token 的前10位

    const [paidOrdersData, unpaidOrdersData] = await Promise.all([
      getPaidOrders(),
      getUnpaidOrders()
    ])

    console.log('已支付订单数据:', paidOrdersData)
    console.log('未支付订单数据:', unpaidOrdersData)

    // 直接使用返回的数据，因为响应拦截器已经处理了 data 字段
    if (Array.isArray(paidOrdersData["data"])) {
      paidOrders.value = paidOrdersData["data"]
    }
    if (Array.isArray(unpaidOrdersData["data"])) {
      unpaidOrders.value = unpaidOrdersData["data"]
    }

  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError
      console.error('获取订单列表失败:', {
        message: axiosError.message,
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        headers: axiosError.response?.headers,
        config: {
          url: axiosError.config?.url,
          method: axiosError.config?.method,
          headers: axiosError.config?.headers
        }
      })
      
      if (axiosError.response?.status === 401) {
        console.error('token 已失效或未授权')
        alert('登录已过期，请重新登录')
        // 清除失效的 token
        localStorage.removeItem('token')
        router.push('/login')
      } else if (axiosError.response?.status === 404) {
        console.error('接口地址不存在')
        alert('系统错误，请稍后重试')
      } else if (axiosError.code === 'ECONNABORTED') {
        console.error('请求超时')
        alert('网络请求超时，请检查网络后重试')
      } else if (axiosError.code === 'ERR_NETWORK') {
        console.error('网络连接失败，请检查网络设置')
        alert('网络连接失败，请检查网络设置')
      }
    }
  }
}

// 在组件挂载时检查登录状态并获取订单
onMounted(() => {
  if (checkLoginStatus()) {
    fetchOrders()
  }
})
</script>

<template>
  <div class="bg-blue-4 h-7% w-full flex justify-center items-center">
    <h1 class="text-center text-1.5xl color-white">我的订单</h1>
  </div>

  <div class="bg-white min-h-screen">
    <!-- 未支付订单 -->
    <div class="p-4">
      <h2 class="text-gray-600 mb-4">未支付订单信息</h2>
      <div v-for="order in unpaidOrders" :key="order.orderId" class="bg-white rounded-lg mb-3 p-4">
        <div class="flex justify-between items-center" @click="toggleOrder(order.orderId)">
          <div class="flex items-center">
            {{ order.businessName }}
            <i class="fa fa-caret-down ml-1" :class="{ 'rotate-180': isExpanded(order.orderId) }"></i>
          </div>
          <div class="flex items-center">
            <span class="mr-2">¥{{ order.payAmount }}</span>
            <button class="bg-[#ff8000] text-white px-3 py-1 rounded text-sm">
              去支付
            </button>
          </div>
        </div>
        <!-- 订单详情 -->
        <div v-show="isExpanded(order.orderId)" class="mt-2 text-gray-600">
          <div v-for="item in order.orderItemDTOs" :key="item.productName" class="flex justify-between py-1">
            <span>{{ item.productName }} × {{ item.quanity }}</span>
            <span>¥{{ item.commodityPrice*item.quanity }}</span>
          </div>
          <div class="flex justify-between py-1">
            <span>配送费</span>
            <span>¥{{ order.businessDeliveryFees }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 已支付订单 -->
    <div class="p-4">
      <h2 class="text-gray-600 mb-4">已支付订单信息</h2>
      <div v-for="order in paidOrders" :key="order.orderId" class="bg-white rounded-lg mb-3 p-4">
        <div class="flex justify-between items-center" @click="toggleOrder(order.orderId)">
          <div class="flex items-center">
            {{ order.businessName }}
            <i class="fa fa-caret-down ml-1" :class="{ 'rotate-180': isExpanded(order.orderId) }"></i>
          </div>
          <div>
            ¥{{ order.payAmount }}
          </div>
        </div>
        <!-- 订单详情 -->
        <div v-show="isExpanded(order.orderId)" class="mt-2 text-gray-600">
          <div v-for="item in order.orderItemDTOs" :key="item.productName" class="flex justify-between py-1">
            <span>{{ item.productName }} × {{ item.quanity }}</span>
            <span>¥{{ item.commodityPrice*item.quanity}}</span>
          </div>
          <div class="flex justify-between py-1">
            <span>配送费</span>
            <span>¥{{ order.businessDeliveryFees }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <bottom class="fixed bottom-0"></bottom>
</template>

<style scoped>
.fa-caret-down {
  transition: transform 0.3s ease;
}

.fa-caret-down.rotate {
  transform: rotate(180deg);
}
</style>