<template>
  <span class="quick-secure-chip">
    <img :src="quickModeIconGreen" alt="" class="chip-icon" />
    Quick and secure
  </span>
</template>

<script setup lang="ts">
import quickModeIconGreen from "@/assets/images/icon_quick_mode_green.svg";
</script>

<style scoped>
.quick-secure-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: #e8f5ee;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 600;
  color: #1b7d4b;
  white-space: nowrap;
  flex-shrink: 0;
}

.chip-icon {
  width: 14px;
  height: 14px;
}
</style>