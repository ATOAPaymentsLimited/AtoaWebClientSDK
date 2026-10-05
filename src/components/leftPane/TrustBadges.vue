
<template>
  <footer class="trust-badges-footer">
    <div class="footer-badges">
      <div class="badge" v-for="badge in badges" :key="badge.key">
        <img :src="badge.icon" :alt="badge.label" />
        <span>{{ badge.label }}</span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed, inject, type Ref } from "vue";
import type PaymentDetails from "@/core/types/PaymentDetails";
import { resolveTrustBadges } from "@/core/utils/regionalContent";

const paymentDetails = inject<Ref<PaymentDetails | undefined>>(
  "paymentRequestDetails"
);

const badges = computed(() => resolveTrustBadges(paymentDetails?.value));
</script>

<style>

.color-grey-500 {
  color: white;
}

.trust-badges-footer {
  width: 100%;
  max-width: 343px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.footer-badges {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
}

.badge {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 32%;

  img {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }

  span {
    font-size: 9px;
    max-width: 60px;
    color: white;
  }
}
</style>
