<template>
  <div class="explainer-shimmer" style="height: 100%">
    <div v-if="isMobileWidth" class="mobile-container">
      <Shimmer width="75px" height="30px" image-url="@/assets/images/atoa_logo_primary.svg"
        background-color="var(--base-white)" :show-alternate-shimmer="true" />
    </div>
    <div v-else>
      <div class="shimmer-center">
        <Shimmer width="100%" height="40px" />
        <Shimmer width="60%" height="40px" />
      </div>

      <div class="explainer-steps-shimmer">
        <div class="steps-shimmer" v-for="i in 3" :key="i">
          <Shimmer width="40px" height="40px" />
          <div class="steps-shimmer-column">
            <Shimmer width="100px" height="15px" />
            <Shimmer width="100px" height="15px" />
          </div>
        </div>
      </div>

      <div class="shimmer-center">
        <Shimmer width="80%" height="40px" />
        <Shimmer width="30%" height="20px" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Shimmer from '@/components/sharedComponents/Shimmer.vue';
import { inject, type ComputedRef } from 'vue';

const isMobileWidth = inject<ComputedRef<boolean>>('isMobileWidth');
</script>

<style scoped>
.explainer-shimmer {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px 0px;
}

.mobile-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.shimmer-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.explainer-steps-shimmer {
  margin: 32px 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0;
}

.steps-shimmer {
  display: flex;
  align-items: flex-start;
  margin: 20px 0px;
  width: 100%;
}

.steps-shimmer-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-left: 12px;
}
</style>