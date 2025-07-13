<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

// 定义商家接口
interface Business {
  id: number
  businessName: string
  image: string
  description: string
  score: number
  deliveryFees: number
  miniDeliveryFee: number
  monthSold: number
}

const router = useRouter()
const route = useRoute()
// 修改为单个商家的ref
const business = ref<Business | null>(null)

// base64 转换为图片URL
const convertBase64ToUrl = (base64String: string): string => {
  if (base64String.startsWith('data:image')) {
    return base64String
  }
  return `data:image/png;base64,${base64String}`
}

// 添加格式化月销量的函数
const formatMonthSold = (sold: number): string => {
  if (sold >= 10000) {
    return `${(sold / 10000).toFixed(1)}万`
  }
  return sold.toString()
}

// getBusinessList 改为 getBusinessInfo
const getBusinessInfo = async (): Promise<void> => {
  try {
    const businessId = route.params.id
    if (!businessId) {
      throw new Error('商家ID不存在')
    }
    const response = await fetch(`http://localhost:80/api/business/list`)
    const data = (await response.json())["data"]
    const targetBusiness = data.find((b: Business) => b.id === Number(businessId))
    if (!targetBusiness) {
      throw new Error('未找到该商家')
    }
    business.value = {
      ...targetBusiness,
      image: convertBase64ToUrl(targetBusiness.image)
    }
  } catch (error) {
    console.error('获取商家信息失败:', error)
    business.value = null // 显式设置为 null
  }
}

onMounted(() => {
  getBusinessInfo()
})
</script>

<template>
  <div class="business-info" v-if="business">
    <div class="flex justify-center items-center ">
      <!-- 商家图片 -->
      <div class="relative w-30 h-30 mb-3">
        <img :src="business.image"
             :alt="business.businessName"
             class="w-full h-full object-cover rounded">
        <div class="absolute top-0 left-0 bg-green-500 text-white text-xs px-1 rounded-tl">新店</div>
      </div>
  </div>
    <!-- 商家信息 -->
    <div class="text-center">
      <h3 class="text-lg font-medium mb-1">{{ business.businessName }}</h3>
      <div class="flex items-center justify-center text-sm text-gray-600 mb-1">
        <span class="mr-2">评分 {{ business.score }}</span>
        <span>月售 {{ formatMonthSold(business.monthSold) }}</span>
      </div>
      <div class="text-sm text-gray-600">
        <span>¥{{ business.miniDeliveryFee }} 起送</span>
        <span class="mx-2">|</span>
        <span>配送费 ¥{{ business.deliveryFees }}</span>
      </div>
      <div class="text-sm text-gray-500 mt-1">{{ business.description }}</div>
    </div>
  </div>
</template>

<style scoped>
.business-list {
  background: #fff;
}

.business-item {
  cursor: pointer;
}

.business-item:hover {
  background-color: #f9f9f9;
}

.business-item:last-child {
  border-bottom: none;
}
</style>