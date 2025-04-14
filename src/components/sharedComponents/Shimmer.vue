<template>
  <div class="shimmer" :style="shimmerStyles">
    <div class="shimmer-animation" :style="shimmerAnimationStyles"></div>
    <div v-if="imageUrl">
      <img :src="atoaPrimaryLogo" :style="imageStyles" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import atoaPrimaryLogo from '@/assets/images/atoa_logo_primary.svg';

const props = defineProps({
  width: {
    type: [String, Number],
    default: "100%",
  },
  height: {
    type: [String, Number],
    default: "20px",
  },
  imageUrl: {
    type: String,
    required: false,
  },
  backgroundColor: {
    type: String,
    required: false,
  },
  shimmerColor: {
    type: String,
    required: false,
  }
});

const shimmerStyles = computed(() => ({
  width: typeof props.width === "number" ? `${props.width}px` : props.width,
  height: typeof props.height === "number" ? `${props.height}px` : props.height,
  backgroundColor: props.backgroundColor,
}));

const shimmerAnimationStyles = computed(() => ({
  background: `
    linear-gradient(90deg,
    rgba(255, 255, 255, 0) 0%,
    ${props.shimmerColor ?? 'var(--grey-100)'} 50%,
    rgba(255, 255, 255, 0) 100%)`
}));

const imageStyles = computed(() => ({
  width: typeof props.width === "number" ? `${props.width}px` : props.width,
  height: typeof props.height === "number" ? `${props.height}px` : props.height,
}));
</script>

<style>
.shimmer {
  position: relative;
  background: var(--grey-50);
  border-radius: 6px;
  overflow: hidden;
}

.shimmer-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg,
      rgba(255, 255, 255, 0) 0%,
      var(--grey-100) 50%,
      rgba(255, 255, 255, 0) 100%,
    );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}
</style>