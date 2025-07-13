<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Business {
  id: number
  name: string
  image: string
  description: string
  score: number
  deliveryFees: number
  miniDeliveryFee: number
  monthSold: number
}

const businesses = ref<Business[]>([])

// base64 转换为图片URL
const convertBase64ToUrl = (base64String: string) => {
  // 如果已经是完整的 data URL，直接返回
  if (base64String.startsWith('data:image')) {
    return base64String
  }
  // 否则添加前缀
  return `data:image/png;base64,${base64String}`
}

const getBusinessList = async () => {
  try {
    const response = await fetch('http://localhost:80/api/business/list')
    const data = await response.json()
    // 处理每个商家的图片
    businesses.value = data.map((business: Business) => ({
      ...business,
      image: convertBase64ToUrl(business.image)
    }))
  } catch (error) {
    console.error('获取商家列表失败:', error)
  }
}

// 根据评分生成星星
const getStars = (score: number) => {
  const fullStars = Math.floor(score); // 完整星星数
  const hasHalfStar = score % 1 >= 0.5; // 是否有半星
  const emptyStars = 5 - Math.ceil(score); // 空星星数
  
  return {
    full: '★'.repeat(fullStars),
    half: hasHalfStar ? '★' : '',
    empty: '★'.repeat(emptyStars)
  }
}

onMounted(() => {
  getBusinessList()
})
</script>

<template>
  <div class="p-4">
    <div v-for="business in businesses" 
         :key="business.id" 
         class="flex p-y-4 border-b border-gray-100">
      <!-- 商家图片 -->
      <div class="w-20 h-20 mr-3">
        <img :src="business.image" 
             :alt="business.name"
             class="w-full h-full object-cover rounded-1">
      </div>
      
      <!-- 商家信息 -->
      <div class="flex-1">
        <!-- 配送距离和时间 -->
        <div class="flex items-center mb-1">
          <span class="text-3 text-gray-600">3.22km | 30分钟</span>
          <span class="text-blue-500 text-3 ml-2">蜂鸟专送</span>
        </div>
        
        <!-- 商家名称 -->
        <h3 class="text-4 font-bold mb-2">{{ business.name }}</h3>
        
        <!-- 评分和月售 -->
        <div class="flex items-center mb-2 text-3 text-gray-600">
          <div class="flex items-center mr-3">
            <div class="stars">
              <span class="text-yellow-400">{{ getStars(business.score).full }}</span>
              <span class="text-yellow-300">{{ getStars(business.score).half }}</span>
              <span class="text-gray-200">{{ getStars(business.score).empty }}</span>
            </div>
            <span class="ml-1">{{ business.score }}</span>
          </div>
          <span>月售{{ business.monthSold }}单</span>
        </div>
        
        <!-- 配送信息 -->
        <div class="text-3 text-gray-600 mb-2">
          <span>¥{{ business.miniDeliveryFee }}起送</span>
          <span class="m-x-2 text-gray-300">|</span>
          <span>配送费¥{{ business.deliveryFees }}</span>
        </div>
        
        <!-- 商家描述 -->
        <div class="text-3 text-gray-400">
          {{ business.description }}
        </div>

        <!-- 活动信息 -->
        <div class="mt-2">
          <div class="flex items-center text-3 mb-1">
            <span class="bg-green-500 text-white p-x-1 rounded text-2 mr-1">新</span>
            <span class="text-gray-600">饿了么新用户首单减9元</span>
          </div>
          <div class="flex items-center text-3">
            <span class="bg-orange-500 text-white p-x-1 rounded text-2 mr-1">特</span>
            <span class="text-gray-600">特价商品5元起</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 如果有特殊的样式需求可以在这里添加 */
.stars {
  font-family: Arial, sans-serif;
  display: inline-flex;
  align-items: center;
}
</style>