<template>
  <div class="bank-tabs" :class="{ 'no-tabs': !shouldShowTabs }">
    <template v-if="shouldShowTabs">
      <button v-for="tab in tabs" :key="tab.id" class="tab-button" :class="{ active: modelValue === tab.id }"
        @click="$emit('update:modelValue', tab.id)">
        {{ tab.label }}
      </button>
      <div class="tab-indicator" :style="{ transform: `translateX(${modelValue === 'personal' ? '0' : '100%'})` }"></div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { inject, watch, type Ref } from 'vue';
import type BankData from '@/core/types/BankData';
import type LastPaymentBankDetails from '@/core/types/LastPaymentBankDetails';
import type PaymentDetails from '@/core/types/PaymentDetails';
import { DEFAULT_TRANSACTION_LIMIT } from '@/core/utils/constants';

const tabs = [
  { id: 'personal' as const, label: 'Personal Banks' },
  { id: 'business' as const, label: 'Business Banks' }
] as const;

const props = defineProps<{
  modelValue: 'personal' | 'business'
  banks: BankData[]
  showTabs?: boolean
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: 'personal' | 'business'): void
  (e: 'bankSelected', bank: BankData): void
}>();

const lastPaymentBankDetails = inject<Ref<LastPaymentBankDetails | undefined>>('lastPaymentBankDetails');
const paymentDetails = inject<Ref<PaymentDetails>>('paymentRequestDetails');

// Default to showing tabs if not specified
const shouldShowTabs = props.showTabs ?? true;

if (lastPaymentBankDetails) {
  watch(lastPaymentBankDetails, (newValue) => {
    if (newValue && props.banks.length > 0) {
      handlePreselectedBank();
    }
  });
}

watch(() => props.banks, (newValue) => {
  if (newValue && newValue.length > 0 && lastPaymentBankDetails?.value) {
    handlePreselectedBank();
  }
});

const handlePreselectedBank = () => {
  if (!props.banks || props.banks.length === 0 || !lastPaymentBankDetails?.value) {
    return;
  }
  
  const bank = props.banks.find((bank: BankData) => bank.id === lastPaymentBankDetails?.value?.institutionId);

  if (bank && bank.enabled && (bank.transactionAmountLimit ?? DEFAULT_TRANSACTION_LIMIT) >= (paymentDetails?.value.amount.amount ?? 0)) {
    emit('bankSelected', bank);
    if (lastPaymentBankDetails?.value) {
      lastPaymentBankDetails.value = undefined;
    }
  }
};
</script>

<style scoped>
.bank-tabs {
  position: relative;
  display: flex;
  background: var(--grey-50);
  border-radius: 12px;
  padding: 8px;
  margin: 12px 0 0;
}

.bank-tabs.no-tabs {
  display: none;
}

.tab-button {
  flex: 1;
  padding: 8px 16px;
  border: none;
  background: none;
  font-size: 13px;
  font-weight: 500;
  color: var(--grey-600);
  cursor: pointer;
  position: relative;
  z-index: 1;
  transition: color 0.3s ease;
  font-family: inherit;
}

.tab-button.active {
  color: var(--base-black);
  font-weight: 700;
}

.tab-indicator {
  position: absolute;
  left: 4px;
  top: 4px;
  width: calc(50% - 4px);
  height: calc(100% - 8px);
  background: white;
  border-radius: 10px;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
</style>