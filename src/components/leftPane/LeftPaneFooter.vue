<template>
  <div class="left-pane-footer">
    <div class="payment-dialog-badges">
      <RoundedChip text="Powered by" :rightImage="atoaLogo" />
    </div>
    <TrustBadges />
    <div class="footer-help-section">
      <div class="footer-help-text" :style="{
        color: paymentDetails?.merchantThemeDetails?.foregroundColor
      }"> By continuing, you agreed to Atoa’s <a href="https://paywithatoa.co.uk/terms/" class="footer-link" target="_blank">Terms of Service</a> and <a href="https://paywithatoa.co.uk/atoa-business-privacy-policy/" class="footer-link" target="_blank">Privacy Policy</a>.
      </div>
      <div class="footer-help-text" :style="{
        color: paymentDetails?.merchantThemeDetails?.foregroundColor
      }">Issues with your payment? <a href="https://help.paywithatoa.co.uk/hc/atoa-help-center/en"
          class="footer-link-underline" target="_blank">Get
          help now.</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import RoundedChip from "@/components/sharedComponents/RoundedChip.vue";
import atoaLogo from "@/assets/images/atoa_logo.svg";
import type PaymentDetails from "@/core/types/PaymentDetails";
import { inject, type Ref } from "vue";
import TrustBadges from "./TrustBadges.vue";

const paymentDetails = inject<Ref<PaymentDetails>>('paymentRequestDetails');
</script>

<style scoped>
.payment-dialog-badges {
  display: flex;
  gap: 8px;
  justify-content: left;
}

.footer-help-section {
  margin-top: 20px;
}

.footer-link {
  color: inherit;
  text-decoration: none;
  font-weight: 600;
  font-size: 11px;
}

.footer-link-underline {
  color: inherit;
  text-decoration: underline dotted;
  font-weight: 600;
  font-size: 11px;
}

.footer-help-text {
  color: var(--base-white);
  font-size: 11px;
  margin-top: 4px;
  line-height: 160%;
}
</style>