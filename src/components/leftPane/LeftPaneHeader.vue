<template>
  <div class="left-pane-header">
    <template v-if="isLoading">
      <div class="left-pane-payment-details">
        <Shimmer width="40px" height="40px" />
        <Shimmer width="120px" height="30px" />
        <Shimmer width="130px" height="20px" />
        <Shimmer width="80px" height="18px" />
      </div>
    </template>
    <template v-else>
      <PaymentDetailsSection :amount="paymentDetails?.amount?.amount || 0"
        :merchant-business-name="paymentDetails?.merchantBusinessName || ''"
        :store-location-name="paymentDetails?.storeDetails?.locationName" :store-url="paymentDetails?.storeImg || ''" />
    </template>
    <div class="left-pane-amount-breakup" :class="{ 'expanded': isExpanded }" @click="toggleExpand">
      <template v-if="isLoading">
        <div class="amount-details-shimmer">
          <Shimmer width="120px" height="20px" />
          <Shimmer width="20px" height="20px" />
        </div>
      </template>
      <template v-else>
        <div class="amount-breakup-header" :class="{'expanded': isExpanded }">
          <span class="title">Amount breakup</span>
          <span class="chevron" :class="{ 'rotated': isExpanded }">
            <img :src="dropdownIcon" />
          </span>
        </div>
        <AmountBreakup :isExpanded="isExpanded" :payment-details="paymentDetails" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type PropType, toRefs } from "vue";
import dropdownIcon from "@/assets/images/icon_drop_down.svg";
import Shimmer from "@/components/sharedComponents/Shimmer.vue";
import PaymentDetailsSection from "@/components/leftPane/PaymentDetailsSection.vue";
import AmountBreakup from "@/components/leftPane/AmountBreakup.vue";
import type PaymentDetails from "@/core/types/PaymentDetails";

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
  paymentDetails: {
    type: Object as PropType<PaymentDetails>,
    required: false,
  },
});

const { isLoading, paymentDetails } = toRefs(props);
const isExpanded = ref(false);

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};
</script>

<style scoped>
.left-pane-payment-details {
  background-color: var(--base-white);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.left-pane-amount-breakup {
  background-color: var(--base-white);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  margin: 12px 0px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.amount-breakup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  &.expanded {
    margin-bottom: 8px;
  }
}

.title {
  font-size: 12px;
  font-weight: 600;
  color: var(--grey-600);
}

.chevron {
  transition: transform 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.chevron.rotated {
  transform: rotate(180deg);
}

.amount-details-shimmer {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
</style>