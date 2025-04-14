<template>
  <div class="atoa-pay-custom-rounded-chip" :style="{ backgroundColor, fontWeight }">
    <img v-if="leftImage" :src="leftImage" class="custom-content-left" />
    <span class="atoa-pay-sdk-chip-text" :style="{ color }">{{ text }}</span>
    <img v-if="rightImage" :src="rightImage" class="custom-content-right" />
  </div>
</template>

<script setup lang="ts">
defineProps({
  leftImage: {
    type: String,
    default: null,
  },
  rightImage: {
    type: String,
    default: null,
  },
  text: {
    type: String,
    default: "",
  },
  backgroundColor: {
    type: String,
    default: "var(--base-white)",
  },
  fontWeight: {
    type: String,
    default: "500",
  },
  color: {
    type: String,
    default: "var(--base-black)",
  },
});
</script>

<style>
.atoa-pay-sdk-chip-text {
  font-size: 12px;
  font-weight: inherit;
}

.atoa-pay-custom-rounded-chip {
  border-radius: 100px;
  display: flex;
  align-items: center;
  padding: 6px 12px;
}

.custom-content-right {
  margin-left: 4px;
}

.custom-content-left {
  margin-right: 4px;
}
</style>