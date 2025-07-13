<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useRouter } from 'vue-router'
import Bottom from '@/components/bottom.vue'

const cartStore = useCartStore()
const router = useRouter()
const order = ref(cartStore.getCurrentOrder())

// 如果没有订单信息，返回商家页面
onMounted(() => {
  if (!order.value) {
    alert('订单信息不存在')
    router.push('/businessList')
  }
})

// 格式化时间
const formatTime = (timeString: string) => {
  const date = new Date(timeString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 提交订单
const submitOrder = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      alert('请先登录')
      router.push('/login')
      return
    }

    if (!order.value) {
      alert('订单信息不存在')
      return
    }

    // 构造符合要求的订单数据
    const orderData = {
      businessId: order.value.businessId,
      orderItems: order.value.items.map(item => ({
        commodityId: item.id,
        quanity: item.quantity
      }))
    }

    // 调用创建订单API
    const response = await fetch('http://localhost:80/api/order/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    })

    if (!response.ok) {
      throw new Error('提交订单失败')
    }

    alert('订单提交成功')
    cartStore.clearCart()
    cartStore.clearCurrentOrder()
    router.push('/orderList')
  } catch (error) {
    console.error('提交订单失败:', error)
    alert('提交订单失败，请重试')
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 pb-20">
    <!-- 顶部标题 -->
    <div class="bg-blue-500 h-14 w-full flex justify-center items-center fixed top-0 z-50">
      <h1 class="text-center text-xl text-white">确认订单</h1>
    </div>

    <!-- 订单内容 -->
    <div class="pt-16 px-4" v-if="order">
      <!-- 商家信息 -->
      <div class="bg-white rounded-lg p-4 mb-4">
        <h2 class="text-lg font-medium mb-2">商家信息</h2>
        <p class="text-gray-600">订单编号：{{ order.createTime }}</p>
        <p class="text-gray-600">下单时间：{{ formatTime(order.createTime) }}</p>
      </div>

      <!-- 商品列表 -->
      <div class="bg-white rounded-lg p-4 mb-4">
        <h2 class="text-lg font-medium mb-2">商品信息</h2>
        <div v-for="item in order.items" :key="item.id" class="flex items-center py-2 border-b border-gray-100">
          <img :src="item.image" :alt="item.commodityName" class="w-16 h-16 object-cover rounded mr-3">
          <div class="flex-1">
            <h3 class="text-base font-medium">{{ item.commodityName }}</h3>
            <div class="flex justify-between items-center mt-1">
              <span class="text-red-500">¥{{ item.price }}</span>
              <span class="text-gray-500">x{{ item.quantity }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 订单金额 -->
      <div class="bg-white rounded-lg p-4 mb-4">
        <h2 class="text-lg font-medium mb-2">订单金额</h2>
        <div class="flex justify-between items-center py-2">
          <span class="text-gray-600">商品总额</span>
          <span class="text-red-500">¥{{ order.totalPrice.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between items-center py-2">
          <span class="text-gray-600">配送费</span>
          <span class="text-gray-600">¥0.00</span>
        </div>
        <div class="flex justify-between items-center py-2 border-t border-gray-100">
          <span class="text-lg font-medium">实付金额</span>
          <span class="text-xl text-red-500 font-bold">¥{{ order.totalPrice.toFixed(2) }}</span>
        </div>
      </div>

      <!-- 提交订单按钮 -->
      <button 
        @click="submitOrder"
        class="fixed bottom-20 left-4 right-4 bg-blue-500 text-white py-3 rounded-full text-lg font-medium">
        提交订单
      </button>
    </div>

    <Bottom class="fixed bottom-0"></Bottom>
  </div>
</template>

<style scoped>
.min-h-screen {
  min-height: 100vh;
}
</style>