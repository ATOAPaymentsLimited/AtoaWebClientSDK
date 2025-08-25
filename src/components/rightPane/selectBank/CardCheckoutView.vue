<template>
  <div class="scrollable-content pay-by-card-container">
    <div v-if="isDesktop" class="header-options">
      <div class="back-arrow-container" @click="goBack">
        <img
          src="@/assets/images/forward.svg"
          alt="back-arrow"
          width="10px"
          height="10px"
          style="transform: rotate(360deg)"
        />
      </div>
      <span class="body-1 bold">Pay by card</span>
      <div style="width: 32px" />
    </div>
    <!-- <PayByBankCard
      v-if="!loadingCardCheckout && !showCardError && !paymentSuccess"
      @switch-to-bank="goBack"
    /> -->
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
      <div
        v-show="!loadingCardCheckout && !showCardError"
        class="rapyd-checkout-container"
        id="rapyd-checkout"
      ></div>
      <!-- <CardError v-if="showCardError" @retry="handleRetry" /> -->
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, nextTick } from "vue";
// import PayByBankCard from "@/components/PaymentMethod/PayByBankCard.vue";
// import CardError from "./CardError.vue";

// TypeScript declaration for RapydCheckoutToolkit
declare global {
  interface Window {
    RapydCheckoutToolkit: any;
  }
}

const emit = defineEmits(["goBack", "cardCheckoutClosed"]);

const loadingCardCheckout = ref(false);
const rapydCheckout = ref<any>(null);
const windowWidth = ref(window.innerWidth);
const showCardError = ref(false);
// const paymentSuccess = ref(false);

// Extract state from stores
// const { totalAmountWithTip } = storeToRefs(paymentStore);
// const { cardCheckoutId, cardCheckoutLoading } = storeToRefs(cardStore);

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

const goBack = () => {
  emit("cardCheckoutClosed");
};

// const handleRetry = () => {
//   showCardError.value = false;
//   emit("cardCheckoutClosed");
//   initializePayment();
// };

const setupRapydEventListeners = () => {
  loadingCardCheckout.value = true;

  window.addEventListener("onLoading", (event: any) => {
    loadingCardCheckout.value = event.detail.loading;
  });

//   window.addEventListener("onCheckoutPaymentSuccess", (event: any) => {
//     // handlePaymentSuccess(event);
//   });

//   window.addEventListener("onCheckoutFailure", (event: any) => {
//     // handlePaymentFailure(event);
//   });

//   window.addEventListener("onCheckoutPaymentFailure", (event: any) => {
//     // handlePaymentFailure(event);
//   });

  // cardStore.initializeListeners = true;
};

const initializePayment = async () => {
  try {
    // if (!cardCheckoutId.value) {
    //   throw new Error("No card checkout ID available");
    // }

    // Initialize Rapyd checkout with real data from secure auth
    if (window.RapydCheckoutToolkit) {
      rapydCheckout.value = new window.RapydCheckoutToolkit({
        pay_button_text: "Pay Now",
        pay_button_color: "#e42444",
        id: "checkout_e01ce72a883a693b4deb40f41b52e6b5", // ✅ Use prop instead of API call
        amount: 20, // ✅ Use local amount calculation
        currency: "GBP",
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

      rapydCheckout.value.displayCheckout();
    } else {
      throw new Error("RapydCheckoutToolkit not loaded");
    }
  } catch (error) {
    emit("cardCheckoutClosed");
  }
};

// const handlePaymentSuccess = (event: any) => {
//   // Use real payment data from the event or fallback to stored data
//   const paymentIdempotencyId = event.detail?.metadata?.paymentIdempotencyId;
//   paymentSuccess.value = true;
//   // Navigate to transaction details with real payment ID
//   router.replace({
//     name: "transaction-details",
//     query: {
//       ...route.query,
//       paymentIdempotencyId: paymentIdempotencyId,
//       status: "SUCCESS",
//     },
//   });
// };

// const handlePaymentFailure = (event: any) => {
//   // Track failed payment
//   const { source } = route.query;
//   Analytics.trackClickEvent("Payment Failure", route.name?.toString(), {
//     paymentRequestSource: `${source}`,
//     amount: totalAmountWithTip.value,
//     error: event.detail.error,
//   });

//   showCardError.value = true;
// };

// Initialize card checkout
// const initCardCheckout = () => {
//   showCardError.value = false;

//   // Track the click event
//   const { source } = route.query;
//   Analytics.trackClickEvent("Pay by Card", route.name?.toString(), {
//     paymentRequestSource: `${source}`,
//     amount: totalAmountWithTip.value,
//     merchantId: paymentStore.paymentDetails?.merchantId,
//   });

//   // Initialize payment after view is updated
//   nextTick(() => {
//     initializePayment();
//   });
// };

onMounted(() => {
//   if (!cardStore.initializeListeners) {
    setupRapydEventListeners();
    nextTick(() => {
      initializePayment();
    })
//   }
});

// watch(
//   cardCheckoutId,
//   (newVal, oldVal) => {
//     if (newVal && newVal !== oldVal) {
//       // Clean up Rapyd checkout if it exists
//       if (rapydCheckout.value) {
//         try {
//           rapydCheckout.value.closeCheckout();
//         } catch (error) {
//           // Silent cleanup
//         }
//         rapydCheckout.value = null;
//       }
//       initCardCheckout();
//     }
//   },
//   { immediate: true }
// );
</script>

<style scoped>

.pay-by-card-container {
  width: 343px;
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

:deep(iframe) {
  max-height: 590px !important;
  min-height: 590px !important;
  width: 100% !important;
  max-width: 100% !important;
  min-width: 400px !important;
  box-sizing: border-box !important;
  margin-left: 0 !important;

  &[style*="width"] {
    width: 100% !important;
  }

  @media only screen and (max-width: 525px) {
    width: calc(100% + 64px) !important;
    margin-left: 0px !important;
  }
}

:deep(#rapyd-checkout) {
  width: 100% !important;
  max-width: 100% !important;
}

:deep(#rapyd-checkout *[style*="width"]) {
  max-width: 100% !important;
}
</style>
