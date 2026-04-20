<template>
  <div class="view-all-button" @click="$emit('click')">
    <div class="view-all-content">
      <div class="bank-icons-preview">
        <div
          v-for="(bank, index) in previewBanks.slice(0, 4)"
          :key="bank.id"
          class="mini-bank-icon"
          :style="{ zIndex: index + 1, left: `${index * 12}px` }"
        >
          <img :src="getBankIcon(bank)" :alt="bank.name" loading="lazy" />
        </div>
      </div>
    </div>
    <div class="view-all-text">
      <span class="view-all-label">View all</span>
      <img
        src="@/assets/images/icon_drop_down.svg"
        alt="View all"
        class="chevron-icon"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type BankData from "@/core/types/BankData";
import { getBankIcon } from "@/core/types/BankData";

defineProps<{
  previewBanks: BankData[];
}>();

defineEmits<{
  (e: "click"): void;
}>();
</script>

<style scoped>
.view-all-button {
  cursor: pointer;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.view-all-content {
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--grey-200);
  border-radius: 12px;
  background-color: var(--base-white);
  transition: all 0.2s ease-in-out;
  box-sizing: border-box;
  margin-bottom: 8px;
}

.view-all-content:hover {
  background-color: var(--grey-50, #f5f5f5);
}

.bank-icons-preview {
  position: relative;
  left: -6px;
  width: 44px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mini-bank-icon {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--base-white);
}

.mini-bank-icon img {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.view-all-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.view-all-label {
  color: var(--grey-500);
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.5;
}

.chevron-icon {
  width: 12px;
  height: 12px;
}
</style>
