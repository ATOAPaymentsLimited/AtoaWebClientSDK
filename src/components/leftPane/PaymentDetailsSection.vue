<template>
  <div class="payment-details-section">
    <div class="store-image">
      <img :src="!storeUrl ? storeImagePlaceholder : storeUrl" height="40px" width="40px" />
    </div>
    <div class="payment-amount">
      <span class="payment-amount-bold">Pay £{{ splitAmount[0] }}.</span>
      <span class="payment-amount-normal">{{ splitAmount[1].toString().padStart(2, '0') }}</span>
    </div>
    <div class="merchant-business-name">
      <span class="merchant-business-name-prefix">To </span>
      <span class="merchant-business-name-value">{{ merchantBusinessName }}</span>
    </div>
    <div class="store-location-name" v-if="storeLocationName">
      <span class="store-location-name-value">{{ storeLocationName }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import storeImagePlaceholder from "@/assets/images/store_image_placeholder.svg";
import { splitDouble } from "@/core/utils/common";
import { computed } from 'vue';

const props = defineProps({
  storeUrl: {
    type: String,
    required: false,
  },
  amount: {
    type: Number,
    required: true,
  },
  merchantBusinessName: {
    type: String,
    required: true,
  },
  storeLocationName: {
    type: String,
    required: false,
  }
});

const splitAmount = computed(() => {
  return splitDouble(props.amount);
});
</script>

<style scoped>
.payment-details-section {
  background-color: var(--base-white);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.store-image {
  border: 1px solid var(--grey-100);
  border-radius: 6px;
  width: 40px;
  height: 40px;
}

.store-image img {
  border-radius: 6px;
  object-fit: cover;
  width: 100%;
  height: 100%;
}

.payment-amount {
  margin-top: 20px;
  margin-bottom: 12px;
}

.payment-amount .payment-amount-bold {
  font-weight: 800;
  size: 20px;
  color: var(--base-black);
}

.payment-amount .payment-amount-normal {
  font-weight: 400;
  size: 20px;
  color: var(--base-black);
}

.merchant-business-name {
  font-size: 14px;
  color: var(--base-black);
  width: 100%;
}

.merchant-business-name .merchant-business-name-value {
  font-weight: 700;
  color: var(--base-black);
  word-wrap: break-word;
}

.store-location-name {
  margin-top: 4px;
  color: var(--grey-500);
  font-size: 12px;
  width: 100%;
}

.store-location-name .store-location-name-value {
  word-wrap: break-word;
}
</style>