<script setup lang="ts">

</script>

<template>
  <div class=" bg-white p-4">
    <div class="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden">
      <!-- 左侧文字内容 -->
      <div class="absolute left-4 top-4 z-10">
        <h2 class="text-6 font-bold mb-2">品质套餐</h2>
        <p class="text-gray-600 text-3.5 mb-4">搭配齐全吃得好</p>
        <div class="text-orange-500 text-3.5 flex items-center">
          立即抢购 
          <i class="i-carbon-chevron-right ml-1"></i>
        </div>
      </div>

      <!-- 右侧图片 -->
      <div class="absolute right-0 top-0 h-full w-120">
        <img 
          src="@/assets/image/index_banner.png"
          alt="品质套餐" 
          class="h-100% w-100% object-cover"
        >
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 如果需要自定义样式可以在这里添加 */
</style>