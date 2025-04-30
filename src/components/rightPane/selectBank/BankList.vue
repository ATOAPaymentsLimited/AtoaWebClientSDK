<template>
  <div class="bank-list-container">
    <h2 class="section-title"> {{ !searchQuery ? 'ALL BANKS' : 'RESULTS' }} </h2>
    <div class="bank-list">
      <TransitionGroup name="bank-list" tag="div" class="transition-container">
        <div class="no-results-container" v-if="searchQuery && filteredBanks.length === 0">
          <div class="no-results-title">
            No results
          </div>
          <div class="no-results-message">
            {{ `No results for "${searchQuery}" in banks. Try using different keywords.` }}
          </div>
        </div>
        <template v-else>
          <BankCard v-for="bank in filteredEligibleBanks" :key="bank.id" :bank="bank"
            :is-selected="selectedBank?.id === bank.id" @select="$emit('select', $event)"
            @show-overlay="(bankData) => emit('showOverlay', bankData)" />

          <div v-if="ineligibleBanks.length > 0" class="ineligible-banks-section">
            <div class="ineligible-warning">
              <img src="@/assets/images/icon_info_filled.svg" alt="Warning" class="warning-icon" />
              <span>Some banks listed below might not handle the payments of <span class="warning-amount-text-bold">£{{ formatAmount(paymentAmount) }}</span></span>
            </div>
            <BankCard :disabled="true" v-for="bank in ineligibleBanks" :key="bank.id" :bank="bank"
              :is-selected="selectedBank?.id === bank.id" @select="$emit('select', $event)"
              @show-overlay="(bankData) => emit('showOverlay', bankData)" />
          </div>
        </template>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, type Ref } from 'vue';
import type BankData from '@/core/types/BankData';
import BankCard from '@/components/rightPane/selectBank/BankCard.vue';
import type PaymentDetails from '@/core/types/PaymentDetails';
import { DEFAULT_TRANSACTION_LIMIT } from '@/core/utils/constants';

const props = defineProps<{
  banks: BankData[],
  searchQuery: string,
  selectedType: 'personal' | 'business',
  selectedBank?: BankData,
  isSearching: boolean,
}>();

const emit = defineEmits<{
  (e: 'select', bank: BankData): void,
  (e: 'showOverlay', bank: BankData): void
}>();

const paymentDetails = inject<Ref<PaymentDetails>>('paymentRequestDetails');
const paymentAmount = computed(() => paymentDetails?.value?.amount?.amount || 0);

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('en-GB').format(amount);
};

const filteredBanks = computed(() => {
  return props.banks
    .filter(bank => {
      const matchesType = props.isSearching ? true : props.selectedType === 'business' ? bank.businessBank : !bank.businessBank;
      const matchesSearch = props.searchQuery
        ? bank.fullName.toLowerCase().includes(props.searchQuery.toLowerCase())
        : true;
      return matchesType && matchesSearch;
    })
    .sort((a, b) => {
      return a.fullName.localeCompare(b.fullName);
    });
});

const ineligibleBanks = computed(() => {
  return filteredBanks.value.filter(bank => (bank.transactionAmountLimit ?? DEFAULT_TRANSACTION_LIMIT) < paymentAmount.value);
});

const filteredEligibleBanks = computed(() => {
  return filteredBanks.value.filter(bank => (bank.transactionAmountLimit ?? DEFAULT_TRANSACTION_LIMIT) >= paymentAmount.value);
});
</script>

<style scoped>
.bank-list-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: visible; /* Allow content to flow without scrollbar */
}

.transition-container {
  height: 100%;
}

.section-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--grey-500);
  margin: 12px 0;
  letter-spacing: 1.2px;
  flex-shrink: 0;
}

.bank-list {
  display: flex;
  flex-direction: column;
  overflow: visible;
  padding-right: 0;
  height: 100%;
}

/* Remove all scrollbar styling */
.bank-list::-webkit-scrollbar {
  display: none;
}

.no-results-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.no-results-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--base-black);
}

.no-results-message {
  font-size: 14px;
  color: var(--grey-500);
  text-align: center;
  max-width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
  padding: 0 16px;
}

.ineligible-banks-section {
  margin-top: 24px;
}

.ineligible-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: var(--error-subtle);
  border-radius: 8px;
  margin-bottom: 16px;
  color: var(--error-darker);
  font-size: 12px;
  font-weight: 500;
  height: 150%;
}

.warning-icon {
  width: 20px;
  height: 20px;
}

.warning-amount-text-bold {
  font-weight: 700;
}

:deep(.bank-card) {
  margin-bottom: 8px;
}

:deep(.bank-card:last-child) {
  margin-bottom: 0;
}

.bank-list-move,
.bank-list-enter-active,
.bank-list-leave-active {
  transition: all 0.3s ease;
}

.bank-list-enter-from,
.bank-list-leave-to {
  opacity: 0;
}

.bank-list-leave-active {
  position: absolute;
}
</style>