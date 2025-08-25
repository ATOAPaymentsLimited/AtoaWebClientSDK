<template>
  <div class="choose-payment-method">
    <div class="header-container">
      <div class="header-section">
        <div class="title">
          <p class="title-txt">Pay by bank</p>
          <div class="tag">
            <FlashIcon color="#2A7E62" width="10" height="10" />
            <p>Quick and secure</p>
          </div>
        </div>
        <p class="view-all" @click="emit('viewAllBanks')">
          View all
        </p>
      </div>
      <div class="info-message" v-if="isMobile()">
        <img src="@/assets/images/icon_info.svg" height="16px" width="16px" />
        <span
          >Ensure the selected bank's app is installed on your phone.</span
        >
      </div>
    </div>

    <div class="content" :class="{'mobile': isMobileWidth}">
      <BankTabs 
        ref="bankTabsRef"
        v-model="selectedType" 
        :banks="banksList"
        :show-tabs="true"
        @bank-selected="handleBankSelect" />
      <PopularBanks 
        :banks="banksList" 
        :selected-type="selectedType" 
        :selected-bank="props.selectedBank"
        @select="handleBankSelect" 
        @show-overlay="(bankData) => emit('show-overlay', bankData)" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, inject, watch, type ComputedRef, type Ref } from 'vue';
import { isMobile } from '@/core/utils/common';
import FlashIcon from '@/components/sharedComponents/FlashIcon.vue';
import BankTabs from "@/components/rightPane/selectBank/BankTabs.vue";
import PopularBanks from '@/components/rightPane/selectBank/PopularBanks.vue';
import type BankData from '@/core/types/BankData';
import type LastPaymentBankDetails from '@/core/types/LastPaymentBankDetails';
import type PaymentDetails from '@/core/types/PaymentDetails';
import { DEFAULT_TRANSACTION_LIMIT } from '@/core/utils/constants';

const emit = defineEmits<{
  (e: 'viewAllBanks'): void
  (e: 'select-bank', bank: BankData): void
  (e: 'show-overlay', bank: BankData): void
}>();

const props = defineProps({
  selectedBankId: {
    type: String,
    required: false,
  },
  selectedBank: {
    type: Object as () => BankData | undefined,
    required: false,
  }
});

const selectedType = ref<'personal' | 'business'>('personal');
const banksList = inject<BankData[]>('banksList', []);

const isMobileWidth = inject<ComputedRef<boolean>>('isMobileWidth');
const bankTabsRef = ref();
const lastPaymentBankDetails = inject<Ref<LastPaymentBankDetails | undefined>>('lastPaymentBankDetails');
const paymentDetails = inject<Ref<PaymentDetails>>('paymentRequestDetails');

if (lastPaymentBankDetails) {
  watch(lastPaymentBankDetails, (newValue) => {
    if (newValue && banksList.length > 0) {
      handlePreselectedBank();
    }
  });
}

watch(banksList, (newValue) => {
  if (newValue && newValue.length > 0) {
    // Handle preselection from lastPaymentBankDetails if available
    if (lastPaymentBankDetails?.value) {
      handlePreselectedBank();
    }
    
    // Handle preselection from props.selectedBankId if available
    if (props.selectedBankId !== undefined) {
      const bank = newValue.find((bank) => props.selectedBankId == bank.id);
      if (bank !== undefined) {
        // selectedBank.value = bank; // This line is removed as selectedBank is now a prop
        emit('select-bank', bank);
      }
    }
  }
});

const handlePreselectedBank = () => {
  if (!banksList || banksList.length === 0 || !lastPaymentBankDetails?.value) {
    return;
  }
  
  const bank = banksList.find((bank: BankData) => bank.id === lastPaymentBankDetails?.value?.institutionId);

  if (bank && bank.enabled && (bank.transactionAmountLimit ?? DEFAULT_TRANSACTION_LIMIT) >= (paymentDetails?.value.amount.amount ?? 0)) {
    // selectedBank.value = bank; // This line is removed as selectedBank is now a prop
    emit('select-bank', bank);
    if (lastPaymentBankDetails?.value) {
      lastPaymentBankDetails.value = undefined;
    }
  }
};

const handleBankSelect = (bank: BankData) => {
  emit('select-bank', bank);
};
</script>

<style scoped>
.choose-payment-method {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-bottom: 16px;
}

.header-container {
  p {
    margin: 0;
  }
}

.header-section {
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
}

.title {
  display: flex;
  align-items: center;
  gap: 8px;

  .title-txt {
    font-size: 14px;
    font-weight: 700;
    line-height: 150%;
    color: var(--base-black);
  }
}

.tag {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px 8px;
  background-color: var(--positive-subtle);
  border-radius: 50px;

  p {
    color: var(--positive-darker);
    font-size: 10px;
    font-weight: 600;
    margin: 2px 0;
  }
}

.view-all {
  font-size: 14px;
  font-weight: 700;
  color: var(--primary-500);
  cursor: pointer;
  text-decoration: underline;
  text-decoration-style: dotted;
  text-decoration-color: var(--primary-500);
  text-underline-offset: 3px;
}

.info-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: var(--info-subtle);
  border-radius: 8px;
  margin: 20px 0 0;

  span {
    color: var(--info-darker);
    font-size: 11px;
    font-weight: 500;
    line-height: 160%;
  }
}

.search-container {
  margin-bottom: 24px;
}

.search-input {
  background: var(--grey-50);
  border-radius: 100px;
  border: 1px solid var(--grey-200);
  padding: 10px 16px;
  height: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  margin-right: 36px;

  &.mobile {
    margin-right: 0px;
  }
}

.search-input.border-active {
  border: 1px solid var(--grey-300);
}

.search-icon {
  color: var(--grey-400);
  font-size: 20px;
}

.clear-icon {
  cursor: pointer;
  width: 12px;
  height: 16px;
  opacity: 0.6;
  object-fit: contain;
}

.clear-icon:hover {
  opacity: 1;
}

.input-container {
  position: relative;
  width: 100%;
}

.input-container input {
  border: none;
  background: none;
  width: 100%;
  height: 100%;
  font-size: 13px;
  color: var(--base-black);
  outline: none;
  font-family: inherit;
}

.input-container input::placeholder {
  color: transparent;
}

.placeholder-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  pointer-events: none;
}

.static-text {
  color: var(--grey-400);
  font-size: 13px;
}

.animated-text {
  margin-left: 4px;
  display: flex;
  align-items: center;
}

.search-input.border-active .placeholder-overlay {
  display: none;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  /* padding-right: 24px; */
  padding-bottom: 24px;
  /* margin-right: 8px; */
  position: relative;

  &.mobile {
    padding-right: 0px;
    margin-right: 0px;
  }
}

.content::-webkit-scrollbar {
  width: 4px;
  background: transparent;
  border-radius: 48px;
}

.content::-webkit-scrollbar-track {
  background: transparent;
}

.content::-webkit-scrollbar-thumb {
  background-color: var(--grey-200);
  border-radius: 3px;
}

.content::-webkit-scrollbar-thumb:hover {
  background-color: var(--grey-300);
}

.loading-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: 24px;
}

.loading-animation {
  width: 150px;
  height: 100px;
  transform: scale(2);
  aspect-ratio: 1/1;
  object-fit: contain;
}

.loading-text {
  color: var(--grey-600);
  font-size: 16px;
  font-weight: 500;
  margin: 0;
}

.banks-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  flex-grow: 1;
}

:deep(.bank-list) {
  padding-right: 0;
}

.error-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px;
}

.error-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--base-black);
  margin: 0;
}

.error-message {
  font-size: 14px;
  color: var(--grey-500);
  margin: 12px 0px;
}

.retry-button {
  font-family: inherit;
  background: none;
  border: none;
  color: var(--primary-500);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  padding: 8px 16px;
  text-decoration: underline;
  text-decoration-style: dotted;
  text-underline-offset: 8px;
}

.retry-button:hover {
  opacity: 0.8;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

@media (max-width: 768px) {
  .choose-payment-method {
    padding-right: 0px;
    min-height: 70vh;
  }
}
</style>