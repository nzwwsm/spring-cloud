<script setup lang="ts">
import { ref, computed } from 'vue'

interface OrderItem {
  name: string
  quantity: number
  price: number
}

// 新增：支持跳转函数可注入
const props = defineProps<{ jump?: (url: string) => void }>()
const jump = props.jump || ((url: string) => window.location.assign(url))

const businessName = ref('万家饺子（软件园E18店）')
const deliveryFee = ref(3)
const selectedPayment = ref('alipay') // 'alipay' 或 'wechat'
const isDetailsVisible = ref(true) // 添加控制订单详情显示的状态
const isPaying = ref(false) // 添加支付状态
const error = ref('') // 添加错误状态

const orderItems = ref<OrderItem[]>([
  { name: '纯肉饺子（水饺）', quantity: 2, price: 15 },
  { name: '玉米鲜肉（水饺）', quantity: 1, price: 16 },
])

// 计算订单总价
const totalPrice = computed(() => {
  const itemsTotal = orderItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  return itemsTotal + deliveryFee.value
})

// 计算是否禁用支付按钮
const isPayButtonDisabled = computed(() => {
  return isPaying.value || orderItems.value.length === 0 || totalPrice.value < 10
})

// 切换订单详情的显示状态
const toggleDetails = () => {
  isDetailsVisible.value = !isDetailsVisible.value
}

// 切换支付方式
const togglePayment = (payment: 'alipay' | 'wechat') => {
  selectedPayment.value = payment
}

// 处理支付
const handlePayment = async () => {
  if (isPayButtonDisabled.value) return
  
  try {
    isPaying.value = true
    error.value = ''
    
    const response = await fetch('/api/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        items: orderItems.value,
        totalPrice: totalPrice.value,
        paymentMethod: selectedPayment.value
      })
    })
    
    if (!response.ok) {
      throw new Error('支付失败')
    }
    
    const result = await response.json()
    if (result.success) {
      // 支付成功，可以跳转到订单详情页
      jump(`/order/${result.orderId}`)
    } else {
      throw new Error(result.message || '支付失败')
    }
  } catch (err) {
    console.error('支付失败:', err)
    error.value = '支付失败，请重试'
    window.alert('支付失败，请重试')
  } finally {
    isPaying.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-white pb-20">
    <!-- 订单信息 -->
    <div class="bg-white p-4">
      <div class="text-gray-600 text-lg mb-4">订单信息</div>
      
      <!-- 商家名称 -->
      <div class="flex justify-between items-center mb-4 cursor-pointer" @click="toggleDetails">
        <div class="flex items-center">
          {{ businessName }}
          <i class="fa fa-caret-down ml-1" :class="{ 'rotate-180': !isDetailsVisible }"></i>
        </div>
        <span class="text-[#ff4e00]">¥{{ totalPrice }}</span>
      </div>

      <!-- 订单详情 -->
      <div v-show="isDetailsVisible" class="space-y-2">
        <div v-for="item in orderItems" :key="item.name" class="flex justify-between text-gray-600">
          <div>{{ item.name }} × {{ item.quantity }}</div>
          <div>¥{{ item.price * item.quantity }}</div>
        </div>
        <div class="flex justify-between text-gray-600">
          <div>配送费</div>
          <div>¥{{ deliveryFee }}</div>
        </div>
      </div>
    </div>

    <!-- 支付方式 -->
    <div class="bg-white mt-4 p-4">
      <div class="space-y-4">
        <!-- 支付宝 -->
        <div class="flex items-center justify-between cursor-pointer" @click="togglePayment('alipay')">
          <div class="flex items-center">
            <img src="@/assets/image/alipay.png" alt="支付宝" class="w-full h-8">
          </div>
          <div class="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center"
               :class="{ 'border-green-500': selectedPayment === 'alipay' }">
            <div v-if="selectedPayment === 'alipay'" class="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
        </div>

        <!-- 微信支付 -->
        <div class="flex items-center justify-between cursor-pointer" @click="togglePayment('wechat')">
          <div class="flex items-center">
            <img src="@/assets/image/wechat.png" alt="微信支付" class="w-full h-8">
          </div>
          <div class="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center"
               :class="{ 'border-green-500': selectedPayment === 'wechat' }">
            <div v-if="selectedPayment === 'wechat'" class="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="bg-red-100 text-red-600 p-4 mt-4 text-center">
      {{ error }}
    </div>

    <!-- 确认支付按钮 -->
    <div class="bg-white mt-5 flex justify-center items-center h-5">
      <button 
        class="h-12 w-90 bg-[#2FD878] text-white py-3 rounded-md text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="isPayButtonDisabled"
        @click="handlePayment"
      >
        {{ isPaying ? '支付中...' : '确认支付' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.3s ease;
}

.fa-caret-down {
  transition: transform 0.3s ease;
}
</style>