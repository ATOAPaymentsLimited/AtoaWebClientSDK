<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    fill="none"
    :class="classes"
    :style="[styles, { display: 'block' }]"
    :width="width"
    :height="height"
  >
    <mask
      id="mask0_6350_23045"
      style="mask-type: alpha"
      maskUnits="userSpaceOnUse"
      x="0"
      y="0"
      width="48"
      height="48"
    >
      <rect width="48" height="48" fill="#D9D9D9" />
    </mask>
    <g mask="url(#mask0_6350_23045)">
      <path
        d="M24.5 26C25.0667 26 25.542 25.808 25.926 25.424C26.3087 25.0413 26.5 24.5667 26.5 24V15.95C26.5 15.3833 26.3087 14.9167 25.926 14.55C25.542 14.1833 25.0667 14 24.5 14C23.9333 14 23.4587 14.1913 23.076 14.574C22.692 14.958 22.5 15.4333 22.5 16V24.05C22.5 24.6167 22.692 25.0833 23.076 25.45C23.4587 25.8167 23.9333 26 24.5 26ZM24.5 34C25.0667 34 25.542 33.808 25.926 33.424C26.3087 33.0413 26.5 32.5667 26.5 32C26.5 31.4333 26.3087 30.958 25.926 30.574C25.542 30.1913 25.0667 30 24.5 30C23.9333 30 23.4587 30.1913 23.076 30.574C22.692 30.958 22.5 31.4333 22.5 32C22.5 32.5667 22.692 33.0413 23.076 33.424C23.4587 33.808 23.9333 34 24.5 34ZM24.5 44C21.7333 44 19.1333 43.4747 16.7 42.424C14.2667 41.3747 12.15 39.95 10.35 38.15C8.55 36.35 7.12533 34.2333 6.076 31.8C5.02533 29.3667 4.5 26.7667 4.5 24C4.5 21.2333 5.02533 18.6333 6.076 16.2C7.12533 13.7667 8.55 11.65 10.35 9.85C12.15 8.05 14.2667 6.62467 16.7 5.574C19.1333 4.52467 21.7333 4 24.5 4C27.2667 4 29.8667 4.52467 32.3 5.574C34.7333 6.62467 36.85 8.05 38.65 9.85C40.45 11.65 41.8747 13.7667 42.924 16.2C43.9747 18.6333 44.5 21.2333 44.5 24C44.5 26.7667 43.9747 29.3667 42.924 31.8C41.8747 34.2333 40.45 36.35 38.65 38.15C36.85 39.95 34.7333 41.3747 32.3 42.424C29.8667 43.4747 27.2667 44 24.5 44ZM24.5 40C28.9333 40 32.7087 38.442 35.826 35.326C38.942 32.2087 40.5 28.4333 40.5 24C40.5 19.5667 38.942 15.7913 35.826 12.674C32.7087 9.558 28.9333 8 24.5 8C20.0667 8 16.292 9.558 13.176 12.674C10.0587 15.7913 8.5 19.5667 8.5 24C8.5 28.4333 10.0587 32.2087 13.176 35.326C16.292 38.442 20.0667 40 24.5 40Z"
        :fill="color"
      />
    </g>
  </svg>
</template>

<script setup lang="ts">
import { computed } from "vue";

defineOptions({
  name: "ErrorIcon",
});

const props = defineProps({
  color: {
    type: String,
    default: "#f0963b",
  },
  height: {
    type: [Number, String],
    default: null,
  },
  width: {
    type: [Number, String],
    default: null,
  },
  className: {
    type: String,
    default: "",
  },
});

const classes = computed(() => props.className || "");

const styles = computed(() => {
  const stylesObj: Record<string, string> = {};

  if (props.height) {
    stylesObj.height =
      typeof props.height === "number" ? `${props.height}px` : props.height;
  }

  if (props.width) {
    stylesObj.width =
      typeof props.width === "number" ? `${props.width}px` : props.width;
  }

  return stylesObj;
});
</script>
