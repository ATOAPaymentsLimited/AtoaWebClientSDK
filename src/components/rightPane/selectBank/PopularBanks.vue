<template>
  <div class="popular-banks" v-if="popularBanks.length">
    <div class="popular-banks-grid">
      <div v-for="bank in popularBanks" :key="bank.id" class="popular-bank-item"
        :class="{ 'selected': isSelected(bank) }" @click="handleBankSelect(bank)">
        <div class="bank-logo">
          <img :src="getBankLogo(bank)" :alt="bank.name" class="logo-image">
          <div class="warning-icon" v-if="!bank.enabled">
            <img src="@/assets/images/icon_warning.svg" alt="Warning" class="warning-image">
          </div>
          <img v-if="isSelected(bank)" src="@/assets/images/black_check.svg" alt="Selected" class="check-icon">
        </div>
        <span class="bank-name">{{ bank.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, type Ref } from 'vue';
import type BankData from '@/core/types/BankData';
import { DEFAULT_TRANSACTION_LIMIT } from '@/core/utils/constants';
import type PaymentDetails from '@/core/types/PaymentDetails';

const props = defineProps<{
  banks: BankData[],
  selectedBank?: BankData,
  selectedType: 'personal' | 'business',
}>();

const emit = defineEmits<{
  (e: 'select', bank: BankData): void;
  (e: 'showOverlay', bank: BankData): void;
}>();

const paymentDetails = inject<Ref<PaymentDetails>>('paymentRequestDetails');
const paymentAmount = computed(() => paymentDetails?.value?.amount?.amount || 0);

const popularBanks = computed(() =>
  props.banks
    .filter(bank => {
      const matchesType = props.selectedType === 'business' ? bank.businessBank : !bank.businessBank;
      return matchesType && bank.popularBank && ((bank.transactionAmountLimit ?? DEFAULT_TRANSACTION_LIMIT) >= paymentAmount.value);
    })
    .sort((a, b) => a.orderBy - b.orderBy)
);

const getBankLogo = (bank: BankData) => {
  const logoMedia = bank.media.find(m => m.type === 'logo');
  return logoMedia ? logoMedia.source : '';
};

const isSelected = (bank: BankData) => {
  return props.selectedBank?.id === bank.id;
};

const handleBankSelect = (bank: BankData) => {
  if (bank.enabled) {
    emit('select', bank);
  } else {
    emit('showOverlay', bank);
  }
};
</script>

<style scoped>
.popular-banks {
  margin-bottom: 16px;
  flex-shrink: 0;
}

.popular-banks-grid {
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px 16px;
}

.popular-bank-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.bank-logo {
  position: relative;
  padding: 0px 18px;
  height: 60px;
  min-width: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  background: var(--base-white);
  border: 1px solid var(--grey-200);
  border-radius: 12px;
}

.warning-icon {
  position: absolute;
  top: 4px;
  right: 4px;
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

.logo-image {
  max-width: 34px;
  max-height: 34px;
  object-fit: contain;
}

.bank-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--grey-500);
  text-align: center;
}

.popular-bank-item.selected .bank-logo {
  border: 2px solid var(--base-black);
}

.check-icon {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>