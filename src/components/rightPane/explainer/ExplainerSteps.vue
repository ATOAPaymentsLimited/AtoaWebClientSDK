<template>
  <div class="steps-container">
    <div class="step" v-for="(step, index) in steps" :key="index">
      <div class="step-number">{{ index + 1 }}</div>
      <div class="step-content" v-html="step"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { isMobile } from '@/core/utils/common'

const steps = ref(isMobile() ? [
  'Your <strong>bank app</strong> will open on selection automatically if it\’s installed',
  'You can <strong>login securely</strong> and approve your payment. Your details stay confidential.',
  'Once the payment\’s <strong>confirmed</strong>, we’ll redirect you to the success page.'
] : [
  '<strong>Select the bank</strong> you\'d like to use for making the payment.',
  '<strong>Scan the QR</strong> from your phone to open your <strong>bank app</strong> or visit your <strong>bank website.</strong>',
  'You can <strong>login securely</strong> and <strong>approve</strong> your payment. Your details stay confidential.'
])
</script>

<style scoped>
.steps-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.step {
  display: flex;
  gap: 16px;
  align-items: center;
}

.step-number {
  background: var(--info-subtle);
  color: var(--info-darker);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.step-content {
  font-size: 14px;
  line-height: 1.5;
  color: var(--base-black);
}

.step-content :deep(strong) {
  font-weight: 600;
}
</style>