<template>
  <ExplainerUIShimmer v-if="isLoading" />
  <div v-else class="explainer-ui">
    <div class="bank-logos-container">
      <img :src="atoaBrandLogo" alt="AtoA" class="atoa-brand-logo" />
      <img :src="explainerUiLoadingDots" class="loading-dots">
      <div class="bank-logos-stack">
        <img v-if="banksList[0]" :src="getBankLogo(banksList[0])" class="bank-logo" />
        <img v-if="banksList[1]" :src="getBankLogo(banksList[1])" class="bank-logo" />
        <img v-if="banksList[2]" :src="getBankLogo(banksList[2])" class="bank-logo" />
        <div v-if="banksList?.length > 3" class="bank-logo">+{{ banksList.length - 3 }}</div>
      </div>
    </div>
    <ExplainerSteps />
    <div class="trust-badge">
      <img :src="atoaShieldIcon">
      <span class="trust-text">Trusted by thousands of businesses in the UK</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs, inject } from 'vue'
import atoaBrandLogo from "@/assets/images/atoa_brand_logo.svg";
import atoaShieldIcon from "@/assets/images/icon_check_shield.svg";
import explainerUiLoadingDots from '@/assets/images/loading_dots.svg';
import ExplainerSteps from '@/components/rightPane/explainer/ExplainerSteps.vue';
import ExplainerUIShimmer from '@/components/rightPane/explainer/ExplainerUIShimmer.vue';
import { getBankLogo } from '@/core/types/BankData';
import type BankData from '@/core/types/BankData';

const props = defineProps({
  isLoading: {
    type: Boolean,
    required: false,
  },
});

const { isLoading } = toRefs(props);

const banksList = inject<BankData[]>('banksList', []);
</script>

<style scoped>

.bank-logos-container {
  display: flex;
  align-items: center;
  margin-left: 10%;
  padding: 40px;
}

.bank-logos-stack {
  position: relative;
  width: fit-content;
  padding: 8px;
}

.bank-logo {
  width: 40px;
  height: 40px;
  position: absolute;
  border: 1.25px solid var(--grey-100);
  object-fit: contain;
  background: white;
  border-radius: 50%;
  position: absolute;
}

.bank-logo:nth-child(1) {
  position: relative;
}

.bank-logo:nth-child(2) {
  left: 40px;
}

.bank-logo:nth-child(3) {
  left: 78px;
}

.bank-logo:nth-child(4) {
  left: 114px;
  bottom: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--base-black);
}

.atoa-brand-logo {
  width: 40px;
  height: 40px;
}

.trust-badge {
  margin: 24px 0;
  padding: 16px;
  background-color: var(--positive-subtle);
  border-radius: 10px;
  display: flex;
  align-items: center;
}

.trust-badge img {
  height: 20px;
  width: 20px;
  margin-right: 8px;
}

.loading-dots {
  padding-left: 12px;
  padding-right: 4px;
}

.trust-text {
  color: var(--positive-darker);
  font-weight: 600;
  font-size: 12px;
}

@media (max-width: 1024px) {
  .bank-logos-container {
    display: flex;
    padding-right: 126px;
    justify-content: center;
  }
}
</style>