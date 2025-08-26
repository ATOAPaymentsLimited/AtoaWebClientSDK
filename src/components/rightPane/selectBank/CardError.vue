<template>
  <div class="error-msg">
    <ErrorIcon color="#97A6B2" width="48" height="48" />
    <h2 class="title">Payment failed</h2>
    <p style="padding: 0 1rem" class="message">
      We couldn’t process this payment. There might be an issue with the card.
      Please try again or use a different payment method.
    </p>
    <button
      class="retry-button"
      style="margin-top: 24px"
      @click="retry"
    >
      <img
        src="@/assets/images/refresh-white.svg"
        alt="refresh"
        width="20"
        height="20"
        style="margin-right: 8px"
      />
      Retry
    </button>
  </div>
</template>

<script setup lang="ts">
import ErrorIcon from "@/components/sharedComponents/ErrorIcon.vue";

const emit = defineEmits(["retry"]);

const retry = () => {
  emit("retry");
};
</script>

<style scoped>

.error-msg {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  height: 100%;
  max-width: 420px;
  margin: 0 auto;
  color: var(--grey-900);
  text-align: center;

  .title {
    font-size: 20px;
    font-weight: 800;
    margin-top: 24px;
  }

  .message {
    margin-top: 12px;
    font-size: 14px;
    color: var(--grey-500);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 32px;

    :nth-child(1) {
      color: var(--base-black);
    }
  }
}

.retry-button {
  height: 48px;
  padding: 0 24px;
  font-size: 14px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: var(--base-black);
  color: var(--base-white);
}
</style>
