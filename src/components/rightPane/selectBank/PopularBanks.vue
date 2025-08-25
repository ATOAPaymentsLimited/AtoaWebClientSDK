<template>
  <div class="bank-list-container">
    <div class="bank-list">
      <TransitionGroup name="bank-list" tag="div" class="transition-container">
        <div
          v-if="searchQuery"
          class="banks-list"
        >
          <p
            class="title"
            :class="{ searching: searchQuery }"
          >
            {{ title }}
          </p>
          <div
            v-if="filteredBanks.length === 0 && searchQuery"
            class="empty-state"
          >
            <p class="empty-text">No results</p>
            <p class="empty-description">
              No results for "{{ searchQuery }}" in banks. Try using
              different keywords.
            </p>
          </div>
        </div>
          <div class="popular-banks" v-if="filteredBanks.length">
            <div class="popular-banks-grid">
              <div 
                v-for="bank in filteredBanks" 
                :key="bank.id" 
                class="popular-bank-item"
                :class="{ 'selected': isSelected(bank) }" 
                @click="handleBankSelect(bank)"
              >
                <div class="bank-logo-container">
                  <div class="bank-logo">
                    <img 
                      :src="getBankLogo(bank)" 
                      :alt="bank.name" 
                      class="logo-image" 
                      :style="{ opacity: bank.enabled ? 1 : 0.5 }"
                    >
                  </div>
                  <div class="warning-icon" v-if="!bank.enabled">
                    <div class="warning-icon-container">
                      <img src="@/assets/images/error_filled.svg" alt="Warning" class="warning-image">
                    </div>
                  </div>
                </div>
                <span 
                  class="bank-name" 
                  :style="{ opacity: bank.enabled ? 1 : 0.5 }"
                >
                  {{ bank.name }}
                </span>
              </div>
            </div>
          </div>
      </TransitionGroup>
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
  selectedType: 'personal' | 'business' | 'all',
  searchQuery?: string,
}>();

const emit = defineEmits<{
  (e: 'select', bank: BankData): void;
  (e: 'showOverlay', bank: BankData): void;
}>();

const paymentDetails = inject<Ref<PaymentDetails>>('paymentRequestDetails');
const paymentAmount = computed(() => paymentDetails?.value?.amount?.amount || 0);

const filteredBanks = computed(() => {
  return props.banks
    .filter(bank => {
      // When searching, show all banks regardless of type
      if (props.searchQuery) {
        const matchesSearch = bank.fullName.toLowerCase().includes(props.searchQuery.toLowerCase());
        return bank.popularBank && ((bank.transactionAmountLimit ?? DEFAULT_TRANSACTION_LIMIT) >= paymentAmount.value) && matchesSearch;
      }
      
      // When not searching, filter by selected type
      if (props.selectedType === 'all') {
        return bank.popularBank && ((bank.transactionAmountLimit ?? DEFAULT_TRANSACTION_LIMIT) >= paymentAmount.value);
      }
      // Otherwise, filter by type as before
      const matchesType = props.selectedType === 'business' ? bank.businessBank : !bank.businessBank;
      return matchesType && bank.popularBank && ((bank.transactionAmountLimit ?? DEFAULT_TRANSACTION_LIMIT) >= paymentAmount.value);
    })
    .sort((a, b) => a.orderBy - b.orderBy);
});

const title = computed(() => {
  if (props.searchQuery) {
    return filteredBanks.value.length === 0 ? "NO RESULTS" : "RESULTS";
  }
  return "ALL BANKS";
});

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
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px 16px;
  justify-content: space-between;
}

.popular-bank-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.bank-logo-container {
  width: 100%;
  position: relative;
}

.bank-logo {
  position: relative;
  padding: 0px;
  min-height: 60px;
  height: 100%;
  min-width: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--base-white);
  border: 1px solid var(--grey-200);
  border-radius: 12px;
  box-sizing: border-box;
  width: 100%;
}

.warning-icon {
  position: absolute;
  top: 3px;
  right: 4px;
  display: flex;
  align-items: center;

  .warning-icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--base-white);
    border-radius: 100%;
    padding: 2px;
  }
}

.warning-image {
  width: 16px;
  height: 16px;
}

.logo-image {
  max-width: 42px;
  max-height: 42px;
  object-fit: contain;
}

.bank-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--grey-900);
  text-align: center;
  margin-top: 8px;
}

.popular-bank-item.selected .bank-logo {
  border: 2px solid var(--base-black);
}

.popular-bank-item.selected .bank-name {
  font-weight: 700;
}

.banks-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;

  &.remove-height {
    min-height: 100%;
    height: 50dvh;
  }

  .title {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 1.2px;
    color: var(--grey-500);
    margin: 12px 0 18.5px;

    &.searching {
      margin: 8px 0;
    }
  }
}

.empty-state {
  max-width: 340px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center ;
  text-align: center;
  gap: 12px;
  flex: 1;
  padding: 32px 0;
  margin: 0 auto;

  .empty-text {
    font-size: 16px;
    font-weight: 700;
    color: var(--grey-700);
  }

  .empty-description {
    font-size: 14px;
    color: var(--grey-500);
    text-align: center;
    max-width: 100%;
    word-wrap: break-word;
    overflow-wrap: break-word;
    padding: 0 16px;
  }
}
</style>