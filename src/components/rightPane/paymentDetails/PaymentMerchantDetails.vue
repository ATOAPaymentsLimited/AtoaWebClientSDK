<template>
  <div class="payment-merchant-details">
    <div class="store-image">
      <img :src="!storeUrl ? storeImagePlaceholder : storeUrl" height="40px" width="40px" />
    </div>
    <div class="merchant-business-name">
      <span class="merchant-business-name-prefix">To </span>
      <span class="merchant-business-name-value">{{ merchantBusinessName }}</span>
    </div>
    <div class="store-location-name" v-if="storeLocationName && storeLocationName !== 'DEFAULT'">
      <span class="store-location-name-value">{{ storeLocationName }}</span>
    </div>
    <div class="payment-amount">
      <span class="payment-amount-bold">£{{ props.amount.toFixed(2) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import storeImagePlaceholder from "@/assets/images/store_image_placeholder.svg";

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
</script>

<style scoped>
.payment-merchant-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 32px;
  margin-bottom: 20px;
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
  margin-top: 16px;
  color: var(--base-black);
}

.payment-amount .payment-amount-bold {
  font-weight: 800;
  font-size: 20px;
}

.merchant-business-name {
  margin-top: 12px;
  font-size: 14px;
  color: var(--base-black);
  max-width: 80%;
  text-align: center;
  word-wrap: break-word;
}

.merchant-business-name .merchant-business-name-value {
  font-weight: 700;
  display: inline;
  max-width: 100%;
  white-space: normal;
}

.store-location-name {
  margin-top: 4px;
  color: var(--grey-500);
  font-size: 12px;
}
</style>