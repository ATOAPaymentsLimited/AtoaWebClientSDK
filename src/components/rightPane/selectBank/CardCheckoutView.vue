<template>
  <div class="scrollable-content pay-by-card-container">
    <div
      :style="{ height: showCardError ? '100%' : '70%' }"
      :class="cardCheckoutContainerClass"
    >
      <div
        v-if="loadingCardCheckout"
        class="card-loading-container"
      >
        <div class="loading-spinner"></div>
      </div>
      <CardError v-if="showCardError" @retry="handleRetry" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, nextTick, onUnmounted, inject, type Ref } from "vue";
import CardError from "@/components/rightPane/selectBank/CardError.vue";

// TypeScript declaration for RapydCheckoutToolkit
declare global {
  interface Window {
    RapydCheckoutToolkit: any;
  }
}

const props = defineProps<{
  totalAmountWithTip: number;
  currency: string;
}>();

const emit = defineEmits(["goBack", "cardCheckoutClosed", "paymentSuccess", "paymentFailure"]);

// Inject cardCheckoutId from PaymentDialog.vue
const injectedCardCheckoutId = inject<Ref<string | null>>('cardCheckoutId');
const loadingCardCheckout = ref(false);
const rapydCheckout = ref<any>(null);
const windowWidth = ref(window.innerWidth);
const showCardError = ref(false);
const paymentSuccess = ref(false);

const isDesktop = computed(() => windowWidth.value > 640);

const cardCheckoutContainerClass = computed(() => {
  if (
    isDesktop &&
    !loadingCardCheckout.value &&
    !showCardError.value
  ) {
    return "card-checkout-container";
  }
  return "";
});

const handleRetry = () => {
  showCardError.value = false;
  emit("cardCheckoutClosed");
  initializePayment();
};

const setupRapydEventListeners = () => {
  loadingCardCheckout.value = true;

  window.addEventListener("onLoading", (event: any) => {
    loadingCardCheckout.value = event.detail.loading;
  });

  window.addEventListener("onCheckoutPaymentSuccess", (event: any) => {
    handlePaymentSuccess(event);
  });

  window.addEventListener("onCheckoutFailure", (event: any) => {
    handlePaymentFailure(event);
  });

  window.addEventListener("onCheckoutPaymentFailure", (event: any) => {
    handlePaymentFailure(event);
  });
};

const createPortalContainer = () => {
  // Remove existing container if it exists
  const existingContainer = document.getElementById('rapyd-checkout');
  if (existingContainer) {
    existingContainer.remove();
  }

  // Create container in main document
  const portalContainer = document.createElement('div');
  portalContainer.id = 'rapyd-checkout';
  portalContainer.className = 'rapyd-checkout-container';
  
  // Set exact dimensions to match your component
  portalContainer.style.cssText = `
    position: absolute;
    width: 425px;
    min-height: 400px;
    z-index: 10000;
    background: transparent;
    overflow: hidden; /* Prevent scrolling */
    box-sizing: border-box; /* Include border in width calculation */
  `;
  
  document.body.appendChild(portalContainer);

  // Apply iframe styles directly to the portal container
  // This will affect any iframes that get injected later
  const style = document.createElement('style');
  style.textContent = `
    
    #rapyd-checkout iframe {
      max-height: 590px !important;
      min-height: 590px !important;
      width: 100% !important;
      max-width: 100% !important;
      min-width: 450px !important;
      box-sizing: border-box !important;
      border: none !important;
    }
    
    #rapyd-checkout iframe[style*="width"] {
      width: 100% !important;
    }
    
    @media only screen and (max-width: 525px) {
      #rapyd-checkout iframe {
        width: calc(100% + 64px) !important;
        margin-left: 0px !important;
      }
    }
    
    #rapyd-checkout *[style*="width"] {
      max-width: 100% !important;
    }
  `;
  
  // Add the style to the document head
  document.head.appendChild(style);
  
  // Position it to match your component's location exactly
  positionPortalContainer(portalContainer);
  
  return portalContainer;
};

const positionPortalContainer = (portalContainer: HTMLElement) => {
  // Find your Vue component in the shadow DOM
  const shadowRoot = document.querySelector('atoa-pay-sdk-dialog')?.shadowRoot;
  if (shadowRoot) {
    const componentElement = shadowRoot.querySelector('.pay-by-card-container');
    if (componentElement) {
      const rect = componentElement.getBoundingClientRect();
      
      // Position the portal container exactly over your component
      portalContainer.style.top = rect.top + 'px';
      portalContainer.style.left = rect.left + 'px';
    }
  }
};

const initializePayment = async () => {
  try {
    const checkoutId = injectedCardCheckoutId?.value;
    
    if (!checkoutId) {
      throw new Error("No card checkout ID available");
    }

    // Create portal container in main document for UI testing
    const portalContainer = createPortalContainer();
    console.log("Static container created for UI testing");

    if (!window.RapydCheckoutToolkit) {
      let attempts = 0;
      const maxAttempts = 100;
      
      while (!window.RapydCheckoutToolkit && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      if (!window.RapydCheckoutToolkit) {
        throw new Error("RapydCheckoutToolkit not loaded after waiting");
      }
    }

    // Initialize Rapyd with container during construction
    rapydCheckout.value = new window.RapydCheckoutToolkit({
      pay_button_text: "Pay Now",
      pay_button_color: "#e42444",
      id: checkoutId,
      amount: props.totalAmountWithTip,
      currency: props.currency,
      container: portalContainer,
      style: {
        submit: {
          base: {
            color: "white",
            padding: 0,
          },
        },
        body: {
          boxShadow: "none",
          padding: 0,
        },
        container: {
          padding: 0,
          margin: 0,
        },
        div: {
          padding: 0,
          margin: 0,
        },
      },
    });
    
    // Call displayCheckout without parameters
    rapydCheckout.value.displayCheckout();
    
    // Hide loader after successful container creation
    loadingCardCheckout.value = false;
    
  } catch (error) {
    loadingCardCheckout.value = false;
    emit("cardCheckoutClosed");
  }
};

const handlePaymentSuccess = (event: any) => {
  const paymentIdempotencyId = event.detail?.metadata?.paymentIdempotencyId;
  paymentSuccess.value = true;
  
  emit("paymentSuccess", {
    paymentIdempotencyId,
    amount: props.totalAmountWithTip,
    currency: props.currency,
    status: "SUCCESS"
  });
};

const handlePaymentFailure = (event: any) => {
  showCardError.value = true;
  
  emit("paymentFailure", {
    error: event.detail?.error,
    amount: props.totalAmountWithTip,
    currency: props.currency
  });
};

onMounted(() => {
  setupRapydEventListeners();

  if (injectedCardCheckoutId?.value) {
    nextTick(() => {
      initializePayment();
    });
  }
  
  // Handle window resize to reposition portal
  const handleResize = () => {
    const portalContainer = document.getElementById('rapyd-checkout');
    if (portalContainer) {
      positionPortalContainer(portalContainer);
    }
  };
  
  window.addEventListener('resize', handleResize);
  
  // Cleanup resize listener
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
  });
});

// Cleanup on component unmount
onUnmounted(() => {
  // Remove portal container
  const portalContainer = document.getElementById('rapyd-checkout-portal');
  if (portalContainer) {
    portalContainer.remove();
  }
  
  // Close checkout if it exists
  if (rapydCheckout.value) {
    try {
      rapydCheckout.value.closeCheckout();
    } catch (error) {
      console.warn("Error closing checkout:", error);
    }
  }
});
</script>

<style>

.pay-by-card-container {
  width: 100%;
  height: 100%;
  margin: 0 auto;
}

@media (max-width: 525px) {
  .pay-by-card-container{
    padding-top: 64px;
  }
}

.header-options {
  width: 420px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0 16px;

  .back-arrow-container {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--grey-50);
    cursor: pointer;
    width: 32px;
    height: 32px;
    border-radius: 100%;

    img {
      transform: rotate(90deg);
    }
  }
}

.card-checkout-container {
  margin-left: 0px;
}

.rapyd-checkout-container {
  width: 100%;
  min-height: 400px;
}

.card-loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 60px 20px;
  gap: 16px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #e42444;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
