<template>
  <script type="application/javascript" defer src="qrcode.vue.browser.min.js"></script>

  <link rel="preload" as="image" href="https://atoa-gifs.s3.eu-west-2.amazonaws.com/animated_grid.gif"
    fetchpriority="high" type="image/gif">
  <link rel="preload" as="image" href="https://atoa-gifs.s3.eu-west-2.amazonaws.com/loading_dots.gif"
    fetchpriority="high" type="image/gif">
  <link rel="preload" as="image" href="https://atoa-gifs.s3.eu-west-2.amazonaws.com/icon_processing.gif"
    fetchpriority="high" type="image/gif">
  <link rel="preload" as="image" href="https://atoa-gifs.s3.eu-west-2.amazonaws.com/payment_success.gif"
    fetchpriority="high" type="image/gif">
  <link rel="preload" as="image" href="https://atoa-gifs.s3.eu-west-2.amazonaws.com/scan_qr_mobile.gif"
    fetchpriority="high" type="image/gif">
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <div class="sdk-dialog-container" ref="dialogContainer">
    <div class="sdk-dialog" role="dialog" aria-modal="true">
      <PaymentDialog />
    </div>
  </div>
</template>

<script setup lang="ts">
// TypeScript declaration for RapydCheckoutToolkit
declare global {
  interface Window {
    RapydCheckoutToolkit: any;
  }
}

import { onErrorCaptured, onMounted, provide, ref } from 'vue';
import PaymentDialog from '@/components/PaymentDialog.vue';
import { sdkTheme } from "@/assets/colors/colors";
import type {
  SdkOptions,
} from '@/core/types/SdkOptions';
import { AtoaPayWebSDKError } from '@/core/types/Error';
import { loadFigtreeFont } from '@/core/utils/common';

const dialogContainer = ref<HTMLElement | null>(null);

// Function to load Rapyd script
const loadRapydScript = () => {
  // Check if script is already loaded
  if (window.RapydCheckoutToolkit || document.querySelector('script[src*="rapyd"]')) {
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://sandboxcheckouttoolkit.rapyd.net';
  script.async = true;
  script.defer = true;
  
  document.head.appendChild(script);
};

const props = defineProps<SdkOptions>();

provide('environment', props.environment);
provide('paymentRequestId', props.paymentRequestId);
provide('customerDetails', props.customerDetails);
provide('errorHandler', props.onError);
provide('paymentStatusChangeHandler', props.onPaymentStatusChange);
provide('cancelPaymentHandler', props.onUserCancel);
provide('closeHandler', props.onClose);

onErrorCaptured((error, instance) => {
  if (props.onError) {
    props.onError(new AtoaPayWebSDKError(
      error.message || String(error),
      {
        componentName: instance?.$options?.name || 'Dialog',
        name: 'Atoa Pay SDK Error'
      }
    ));
  }

  // Return false to prevent error from propagating
  return false;
});

onMounted(() => {
  loadFigtreeFont();
  loadRapydScript();

  Object.entries(sdkTheme).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--${key}`, String(value));
  });
});
</script>

<style>
.sdk-dialog-container {
  font-family: 'Figtree', sans-serif;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

</style>