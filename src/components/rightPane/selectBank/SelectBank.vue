<template>
  <div class="select-bank">
    <div class="search-container">
      <div class="search-input" :class="{'border-active': isSearching}">
        <img :src="searchIcon" alt="Search" class="search-icon">
        <div class="input-container">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search your personal bank"
            :class="{'has-placeholder': !isSearching}"
            @click="handleSearchBarClick">
          <div v-if="!isSearching" class="placeholder-overlay">
            <span class="static-text">Search your</span>
            <AnimatedBankType class="animated-text"/>
          </div>
        </div>
        <img v-if="isSearching" src="@/assets/images/icon_close.svg" alt="Clear" class="clear-icon"
          @click="handleSearchBarCloseClick">
      </div>
    </div>

    <div class="content" v-if="isLoading">
      <div class="loading-state">
        <img src="https://atoa-gifs.s3.eu-west-2.amazonaws.com/animated_grid.gif" alt="Loading"
          class="loading-animation">
        <p class="loading-text">Fetching banks</p>
      </div>
    </div>

    <div class="content" v-else-if="banksListFetchError">
      <div class="error-state">
        <p class="error-title">Oops! Something went wrong</p>
        <p class="error-message">An unknown error occurred. We track these errors automatically, Please try again.</p>
        <button class="retry-button" @click="fetchBanksList">Retry</button>
      </div>
    </div>

    <div class="content" v-else>
      <transition name="fade-slide">
        <div v-if="!isSearching">
          <BankTabs v-model="selectedType" />
          <PopularBanks :banks="banks" :selected-type="selectedType" :selected-bank="selectedBank"
            @select="handleBankSelect" @show-overlay="(bankData) => emit('showOverlay', bankData)" />
        </div>
      </transition>
      <div class="banks-container">
        <BankList :banks="banks" :is-searching="isSearching" :search-query="searchQuery" :selected-type="selectedType"
          :selected-bank="selectedBank" @select="handleBankSelect"
          @show-overlay="(bankData) => emit('showOverlay', bankData)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, ref, watch, type Ref } from 'vue';
import searchIcon from '@/assets/images/icon_search.svg';
import { PaymentsService } from '@/core/services/PaymentsService';
import type BankData from '@/core/types/BankData';
import BankTabs from '@/components/rightPane/selectBank/BankTabs.vue';
import PopularBanks from '@/components/rightPane/selectBank/PopularBanks.vue';
import BankList from '@/components/rightPane/selectBank/BankList.vue';
import AnimatedBankType from '@/components/rightPane/selectBank/AnimatedBankType.vue';
import type LastPaymentBankDetails from '@/core/types/LastPaymentBankDetails';
import type PaymentDetails from '@/core/types/PaymentDetails';
import { EnvironmentTypeEnum } from '@/core/types/Environment';
import { DEFAULT_TRANSACTION_LIMIT } from '@/core/utils/constants';

const emit = defineEmits<{
  (e: 'selectBank', bank: BankData): void,
  (e: 'showOverlay', bank: BankData): void
}>();

const props = defineProps({
  selectedBankId: {
    type: String,
    required: false,
  }
});

const searchQuery = ref('');
const isSearching = ref(false);
const isLoading = ref(false);
const banks = ref<BankData[]>([]);
const selectedType = ref<'personal' | 'business'>('personal');
const selectedBank = ref<BankData | undefined>();
const banksListFetchError = ref(false);
const lastPaymentBankDetails = inject<Ref<LastPaymentBankDetails | undefined>>('lastPaymentBankDetails');
const paymentDetails = inject<Ref<PaymentDetails>>('paymentRequestDetails');
const environment = inject<EnvironmentTypeEnum>('environment');
const paymentsService = new PaymentsService();

if (lastPaymentBankDetails) {
  watch(lastPaymentBankDetails, (newValue) => {
    if (newValue) {
      handlePreselectedBank();
    }
  }, { immediate: true });
}

watch(banks, (newValue) => {
  if (newValue) {
    handlePreselectedBank();
  }
}, { immediate: true });

const handleBankSelect = (bank: BankData) => {
  selectedBank.value = bank;
  emit('selectBank', bank);
};

const handleSearchBarClick = () => {
  searchQuery.value = '';
  isSearching.value = true;
}

const handleSearchBarCloseClick = () => {
  searchQuery.value = '';
  isSearching.value = false;
}

onMounted(() => {
  fetchBanksList();
});

async function fetchBanksList() {
  isLoading.value = true;
  banksListFetchError.value = false;

  try {
    banks.value = await paymentsService.fetchConsumerBankInstitutions({
      env: environment ?? EnvironmentTypeEnum.PRODUCTION,
    });

    if (props.selectedBankId !== undefined) {
      const bank = banks.value.find((bank) => props.selectedBankId == bank.id);

      if (bank !== undefined) {
        selectedBank.value = bank;
      }
    }
  } catch (error) {
    banksListFetchError.value = true;
  } finally {
    isLoading.value = false;
  }
}

function handlePreselectedBank() {
  const bank = banks.value?.find((bank: BankData) => bank.id === lastPaymentBankDetails?.value?.institutionId);

  if (bank && bank.enabled && (bank.transactionAmountLimit ?? DEFAULT_TRANSACTION_LIMIT) >= (paymentDetails?.value.amount.amount ?? 0)) {
    handleBankSelect(bank);
    if (lastPaymentBankDetails?.value) {
      lastPaymentBankDetails.value = undefined;
    }
  }
}
</script>

<style scoped>
* {
  margin: 0px;
  padding: 0px;
}

.select-bank {
  padding: 24px 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Keep content within parent boundaries */
  padding-bottom: 16px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--grey-500);
  padding: 8px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
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
}

.search-input.border-active .placeholder-overlay {
  display: none;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* Use auto for natural scrollbar behavior */
  padding-right: 16px;
  padding-bottom: 24px;
  position: relative;
}

/* Scrollbar styling */
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

/* Remove all scrollbar styling */
:deep(.bank-list) {
  padding-right: 0;
}

@media (max-width: 768px) {
  .select-bank {
    padding-right: 0px;
    min-height: 70vh;
  }
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
</style>