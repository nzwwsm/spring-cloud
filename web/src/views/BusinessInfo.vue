<script setup lang="ts">
import Bottom from "@/components/bottom.vue";
import BusinessInfoCom from "@/components/BusinessInfoCom.vue";
import BusinessHeader from "@/components/BusinessHeader.vue";
import BusinessBottom from "@/components/BusinessBottom.vue";



</script>

<template>
  <div class="bg-blue-4 h-7% w-full flex justify-center items-center fixed top-0 z-1000">
    <h1 class="text-center text-1.5xl color-white">商家信息</h1>
  </div>
  <BusinessHeader class="mt-15"></BusinessHeader>
  <BusinessInfoCom></BusinessInfoCom>
  <BusinessBottom></BusinessBottom>
</template>

<style scoped>

</style>