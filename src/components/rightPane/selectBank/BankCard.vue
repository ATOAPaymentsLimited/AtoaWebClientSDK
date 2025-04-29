<template>
  <div class="bank-card" :class="{ disabled }" @click="handleClick">
    <div class="bank-logo">
      <img :src="bankLogo" :alt="bank.name" class="logo-image">
    </div>
    <div class="bank-info">
      <div class="bank-name-row">
        <span class="bank-name">{{ bank.fullName }}</span>
        <div class="warning-icon" v-if="!bank.enabled">
          <img src="@/assets/images/icon_warning.svg" alt="Warning" class="warning-image">
        </div>
      </div>
    </div>
    <div class="radio-checkbox" :class="{ selected: isSelected }">
      <img v-if="isSelected" src="@/assets/images/black_check.svg" alt="Selected" class="checkmark">
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type BankData from '@/core/types/BankData';

const props = defineProps<{
  bank: BankData;
  isSelected?: boolean;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'select', bank: BankData): void;
  (e: 'showOverlay', bank: BankData): void;
}>();

const bankLogo = computed(() => {
  const logoMedia = props.bank.media.find(m => m.type === 'logo');
  return logoMedia ? logoMedia.source : '';
});

const handleClick = () => {
  if (props.disabled) return;
  
  if (props.bank.enabled) {
    emit('select', props.bank);
  } else {
    // Emit event to show overlay in parent component
    emit('showOverlay', props.bank);
  }
};
</script>

<style scoped>
.bank-card {
  display: flex;
  align-items: center;
  padding: 16px 0px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;
}

.bank-logo {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  border: 1px solid var(--grey-100);
  border-radius: 6px;
}

.logo-image {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.bank-info {
  flex: 1;
}

.bank-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bank-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--grey-600);
}

.warning-icon {
  display: flex;
  align-items: center;
  padding: 2px 4px;
  background-color: var(--error-subtle);
  border-radius: 16px;
}

.warning-image {
  width: 16px;
  height: 16px;
}

.radio-checkbox {
  width: 20px;
  height: 20px;
  border: 1px solid var(--grey-300);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 16px;
}

.radio-checkbox.selected {
  border: none;
}

.bank-card:hover:not(.disabled) .radio-checkbox:not(.selected) {
  border-color: var(--grey-400);
}

.checkmark {
  width: 100%;
  height: 100%;
}

.bank-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>