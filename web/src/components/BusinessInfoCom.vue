<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'

interface Commodity {
  id: number
  commodityName: string
  commodityDescription: string
  image: string
  price: number
  quantity?: number // 用于购物车数量
  category?: string
}

const cartStore = useCartStore()
const route = useRoute()
const router = useRouter()
const commodities = ref<Commodity[]>([])
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')
const sortBy = ref('default')

// 计算购物车总价
const cartTotal = computed(() => {
  return cartStore.items.reduce((total, item) => total + item.price * item.quantity, 0)
})

// 过滤和排序后的商品
const filteredCommodities = computed(() => {
  let result = [...commodities.value]
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(item => 
      item.commodityName.toLowerCase().includes(query) ||
      item.commodityDescription.toLowerCase().includes(query)
    )
  }
  
  // 排序
  switch (sortBy.value) {
    case 'price-asc':
      result.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      result.sort((a, b) => b.price - a.price)
      break
    default:
      // 保持默认顺序
      break
  }
  
  return result
})

// 按分类组织的商品
const categorizedCommodities = computed(() => {
  const categories = new Map<string, Commodity[]>()
  
  // 如果没有商品，返回空数组
  if (filteredCommodities.value.length === 0) {
    return []
  }
  
  // 检查是否所有商品都有分类
  const allHaveCategory = filteredCommodities.value.every(item => item.category)
  
  // 如果所有商品都有分类，就不需要"全部商品"分类
  if (!allHaveCategory) {
    categories.set('全部商品', [])
  }
  
  filteredCommodities.value.forEach(commodity => {
    const category = commodity.category || '全部商品'
    if (!categories.has(category)) {
      categories.set(category, [])
    }
    categories.get(category)?.push(commodity)
  })
  
  // 过滤掉空的分类
  return Array.from(categories.entries())
    .filter(([_, items]) => items.length > 0)
    .map(([category, items]) => ({
      category,
      items
    }))
})

// base64 转换为图片URL
const convertBase64ToUrl = (base64String: string) => {
  if (!base64String) return ''
  if (base64String.startsWith('data:image')) {
    return base64String
  }
  return `data:image/png;base64,${base64String}`
}

const getCommodityList = async () => {
  loading.value = true
  error.value = ''

  try {
    // 先检查登录状态
    const token = localStorage.getItem('token')
    if (!token) {
      error.value = '请先登录'
      loading.value = false
      return
    }

    const businessId = route.params.id
    if (!businessId) {
      error.value = '获取商品列表失败'
      loading.value = false
      return
    }

    const url = `http://localhost:80/api/commodity/list/${businessId}`
    console.log('请求URL:', url)

    const response = await fetch(url, {
      headers: {
        'Authorization': token
      }
    })

    if (!response.ok) {
      error.value = '获取商品列表失败'
      loading.value = false
      return
    }

    const data = (await response.json())["data"]
    console.log('API返回的原始数据:', data)

    if (!Array.isArray(data)) {
      error.value = '获取商品列表失败'
      loading.value = false
      return
    }

    commodities.value = data.map((item: Commodity) => ({
      ...item,
      image: convertBase64ToUrl(item.image),
      quantity: 0
    }))
    console.log('处理后的商品数据:', commodities.value)

  } catch (err) {
    console.error('获取商品列表失败:', err)
    error.value = '获取商品列表失败'
  } finally {
    loading.value = false
  }
}

// 修改增加商品数量的方法
const increaseQuantity = (commodity: Commodity) => {
  cartStore.addItem({
    id: commodity.id,
    commodityName: commodity.commodityName,
    price: commodity.price,
    quantity: 1,
    image: commodity.image
  })
}

// 修改减少商品数量的方法
const decreaseQuantity = (commodity: Commodity) => {
  cartStore.removeItem(commodity.id)
}

// 获取商品在购物车中的数量
const getCartQuantity = (commodityId: number) => {
  const item = cartStore.items.find(item => item.id === commodityId)
  return item ? item.quantity : 0
}

// 跳转到购物车
const goToCart = () => {
  router.push('/cart')
}

onMounted(() => {
  const businessId = Number(route.params.id)
  cartStore.setBusinessId(businessId)
  getCommodityList()
})

// 监听搜索和排序变化
watch([searchQuery, sortBy], () => {
  // 可以在这里添加额外的处理逻辑
})
</script>

<template>
  <div class="commodity-list pb-10">
    

    <!-- 加载状态 -->
    <div v-if="loading" class="text-center py-4 text-gray-500">
      加载中...
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="text-center py-4 text-red-500">
      {{ error }}
    </div>

    <!-- 商品列表 -->
    <template v-else>
      <!-- 按分类显示商品 -->
      <div v-for="category in categorizedCommodities" :key="category.category" class="category-section">
        <h3 class="category-title px-4 py-2 bg-gray-50 text-gray-700 font-medium">
          {{ category.category }}
        </h3>
        
        <div class="category-items">
          <div v-for="commodity in category.items" 
               :key="commodity.id" 
               class="commodity-item flex p-4 border-b border-gray-100">
        <!-- 商品图片 -->
            <div class="w-24 h-24 mr-4">
              <img :src="commodity.image" 
                   :alt="commodity.commodityName"
               class="w-full h-full object-cover rounded">
        </div>

        <!-- 商品信息 -->
        <div class="flex-1">
              <h3 class="text-lg font-medium mb-1">{{ commodity.commodityName }}</h3>
              <p class="text-gray-500 text-sm mb-2">{{ commodity.commodityDescription }}</p>
              <div class="flex items-center justify-between">
                <span class="text-red-500 font-medium">¥{{ commodity.price.toFixed(2) }}</span>

                <!-- 数量控制 -->
        <div class="flex items-center">
          <button
                    v-if="getCartQuantity(commodity.id) > 0"
                    @click.stop="decreaseQuantity(commodity)"
                    class="w-6 h-6 flex items-center justify-center bg-blue-500 text-white rounded-full"
                  >
                    -
          </button>
                  <span v-if="getCartQuantity(commodity.id) > 0" class="mx-2">
                    {{ getCartQuantity(commodity.id) }}
          </span>
          <button
                    @click.stop="increaseQuantity(commodity)"
                    class="w-6 h-6 flex items-center justify-center bg-blue-500 text-white rounded-full"
                  >
                    +
          </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 购物车总价 -->
    <div v-if="cartTotal > 0" 
         class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex items-center justify-between">
      <div class="text-lg font-medium">
        总计: <span class="text-red-500">¥{{ cartTotal.toFixed(2) }}</span>
      </div>
      <button 
        @click="goToCart"
        class="checkout-btn px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
      >
        去结算
      </button>
    </div>
  </div>
</template>

<style scoped>
.commodity-list {
  padding-bottom: 60px; /* 为底部购物车留出空间 */
}

.category-title {
  position: sticky;
  top: 0;
  z-index: 10;
}

.commodity-item {
  transition: background-color 0.2s;
}

.commodity-item:hover {
  background-color: #f9f9f9;
}

.search-input:focus,
.sort-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}
</style>