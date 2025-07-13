<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isFixed = ref(false)

const handleScroll = () => {
  // 获取滚动距离
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
  // 获取视口宽度
  const viewportWidth = document.documentElement.clientWidth
  // 当滚动距离大于视口宽度的12%时，固定搜索框
  isFixed.value = scrollTop > viewportWidth * 0.12
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div>
    <!-- 顶部搜索区域 -->
    <!-- 地址栏 -->
    <div class="flex items-center bg-blue-4 h-12% w-full p-x-4 p-y-2.5">
      <i class="i-carbon-location text-white text-5"></i>
      <span class="text-white text-4 font-bold ml-2">沈阳市规划大厦</span>
      <i class="fa fa-caret-down text-white ml-1"></i>
    </div>

    <!-- 搜索框 -->
    <div 
      class="search bg-blue-4 w-full p-x-4 p-y-1.5 transition-all duration-300"
      :class="[isFixed ? 'fixed top-0 left-0 z-50' : '']"
    >
      <div class="bg-white rounded-1 mt-1 p-1.5 flex items-center">
        <i class="fa fa-search text-gray-400 mr-2"></i>
        <input type="text" placeholder="搜索商家、商品名称" class="w-full outline-none text-gray-600 text-3.5">
      </div>
    </div>

    <!-- 占位元素，防止固定定位后页面跳动 -->
    <div v-if="isFixed" class="h-[52px]"></div>
  </div>
</template>

<style scoped>
.search {
  transition: all 0.3s ease;
}

/* 固定状态下的样式 */
.search.fixed {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>