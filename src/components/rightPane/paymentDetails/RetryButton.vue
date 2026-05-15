<template>
  <button class="retry-button" type="button" @click="$emit('retry')">
    <img class="retry-icon" src="@/assets/images/icon_refresh_white.svg" alt="" />
    Retry again
  </button>
</template>

<script setup lang="ts">
defineEmits<{
  (e: 'retry'): void;
}>();
</script>

<style scoped>
.retry-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  align-self: center;
  margin: 4px 0 16px;
  padding: 16px 32px;
  background-color: var(--base-black);
  color: var(--base-white);
  border: none;
  border-radius: 999px;
  font-family: inherit;
  font-size: 16px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.retry-button:hover {
  opacity: 0.85;
}

.retry-icon {
  width: 18px;
  height: auto;
  flex-shrink: 0;
}
</style>
