<template>
  <div class="content-left" :style="leftPaneStyle">
    <div class="content-left-bottom">
      <LeftPaneHeader :is-loading="isLoading" :payment-details="paymentDetails" />
      <div class="spacer"></div>
      <LeftPaneFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
import LeftPaneHeader from "@/components/leftPane/LeftPaneHeader.vue";
import LeftPaneFooter from "@/components/leftPane/LeftPaneFooter.vue";
import type PaymentDetails from "@/core/types/PaymentDetails";
import { computed, inject, toRefs, type Ref } from 'vue';

const props = defineProps({
  isLoading: {
    type: Boolean,
    required: false,
  },
});

const { isLoading } = toRefs(props);
const paymentDetails = inject<Ref<PaymentDetails>>('paymentRequestDetails');

const leftPaneStyle = computed(() => {
  const themeColor = paymentDetails?.value?.merchantThemeDetails?.colorCode ?? 'var(--primary-900)';
  return {
    backgroundColor: themeColor,
    transition: 'background-color 0.7s ease',
  };
});
</script>

<style scoped>
.content-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 100%),
    url('@/assets/images/left_pane_background.svg');
  background-size: cover, cover;
  background-position: center, center;
  background-repeat: no-repeat;
  border-top-left-radius: 16px;
  border-bottom-left-radius: 16px;
  max-width: 50%;
}

.spacer {
  flex: 1;
  min-height: 20px;
}

.content-left-bottom {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background-position: 120% 105%;
  background-repeat: no-repeat;
  padding: 20px;
  overflow: hidden;
}
</style>