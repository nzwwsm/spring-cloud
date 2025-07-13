<script setup lang="ts">
import Bottom from "@/components/bottom.vue";
import BusinessListCom from "@/components/BusinessListCom.vue";
</script>

<template>
  <div class = "bg-blue-4 h-7% w-full flex justify-center items-center fixed top-0 z-1000">
    <h1 class="text-center text-1.5xl color-white">商家列表</h1>
  </div>
  <BusinessListCom class="mt-10 pb-12"></BusinessListCom>
  <bottom class="fixed bottom-0"></bottom>
</template>

<style scoped>

</style>