<script setup lang="ts">
import { useCartStore } from '@/stores/cart'
import { useRouter } from 'vue-router'

const cartStore = useCartStore()
const router = useRouter()

const goToOrder = () => {
  if (cartStore.totalQuantity > 0) {
    const order = cartStore.createOrder()
    if (order) {
      router.push('/order')
    } else {
      alert('创建订单失败，请重试')
    }
  }
}
</script>

<template>
  <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2">
    <div class="flex items-center justify-between">
      <!-- 左侧购物车图标和价格 -->
      <div class="flex items-center">
        <div class="relative mr-4">
          <i class="fa fa-shopping-cart text-2xl text-gray-400"></i>
          <span v-if="cartStore.totalQuantity > 0" 
                class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {{ cartStore.totalQuantity }}
          </span>
        </div>
        <div class="text-gray-600">
          <span v-if="cartStore.totalPrice > 0" class="text-red-500 font-bold">¥{{ cartStore.totalPrice.toFixed(2) }}</span>
          <span v-else class="text-gray-400">未选购商品</span>
        </div>
      </div>

      <!-- 右侧结算按钮 -->
      <button 
        @click="goToOrder"
        :class="[
          'px-6 py-2 rounded-full text-white',
          cartStore.totalQuantity > 0 ? 'bg-blue-500' : 'bg-gray-300'
        ]"
        :disabled="cartStore.totalQuantity === 0">
        去结算
      </button>
    </div>
  </div>
</template>

<style scoped>
.fa-shopping-cart {
  font-size: 24px;
}
</style>