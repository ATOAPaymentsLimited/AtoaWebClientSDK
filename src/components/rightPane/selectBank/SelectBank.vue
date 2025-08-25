<template>
  <div class="select-bank">
    <div class="search-container">
      <div class="search-input" :class="{'border-active': isSearching, 'mobile': isMobileWidth}">
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

    <div class="content" :class="{'mobile': isMobileWidth}">
      <BankTabs 
        v-if="searchQuery.length === 0"
        ref="bankTabsRef"
        v-model="selectedType" 
        :banks="banksList ?? []"
        :show-tabs="true"
        @bank-selected="handleBankSelect" />
      
      <PopularBanks :banks="banksList ?? []" :search-query="searchQuery" :selected-type="selectedType" :selected-bank="selectedBank"
        @select="handleBankSelect" @show-overlay="(bankData) => emit('showOverlay', bankData)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, ref, type ComputedRef, type Ref, provide } from 'vue';
import type BankData from '@/core/types/BankData';
import BankTabs from '@/components/rightPane/selectBank/BankTabs.vue';
import PopularBanks from '@/components/rightPane/selectBank/PopularBanks.vue';
import AnimatedBankType from '@/components/rightPane/selectBank/AnimatedBankType.vue';
import searchIcon from '@/assets/images/icon_search.svg';

const emit = defineEmits<{
  (e: 'selectBank', bank: BankData): void,
  (e: 'showOverlay', bank: BankData): void
}>();

defineProps({
  selectedBank: {
    type: Object as () => BankData | undefined,
    required: false,
  }
});

const searchQuery = ref('');
const isSearching = ref(false);
const banksList = inject<Ref<BankData[]>>('banksList');
const selectedType = ref<'personal' | 'business'>('personal');
const isMobileWidth = inject<ComputedRef<boolean>>('isMobileWidth');
const bankTabsRef = ref();

provide('banksList', banksList);

const handleBankSelect = (bank: BankData) => {
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
  overflow: hidden;
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
  margin-bottom: 12px;
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
  overflow-y: auto; /* Use auto for natural scrollbar behavior */
  padding-right: 24px;
  padding-bottom: 24px;
  margin-right: 8px;
  position: relative;

  &.mobile {
    padding-right: 0px;
    margin-right: 0px;
  }
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