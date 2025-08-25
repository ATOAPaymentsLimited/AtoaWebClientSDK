<template>
  <div>
    <div
      class="pay-by-card-button"
      :style="{
        cursor: 'pointer',
      }"
      @click="emitCardPaymentSelected()"
    >
      <p class="title-txt">Card payment options</p>
      <!-- <CustomLoaderSpinner
        color="#171717"
        :hasMargin="false"
      /> -->
      <div class="card-icons-container">
        <div class="card-icons">
          <img
            src="@/assets/images/mastercard.svg"
            alt="mastercard"
            class="mastercard-icon"
          />
        </div>
        <div class="card-icons">
          <img
            src="@/assets/images/visa-brandmark-blue.svg"
            alt="visa"
            class="visa-icon"
          />
        </div>
        <div class="card-icons">
          <img
            src="@/assets/images/apple_pay.svg"
            alt="apple_pay"
            class="apple_pay-icon"
          />
        </div>
        <div class="card-icons">
          <img src="@/assets/images/g_pay.svg" alt="g_pay" class="g_pay-icon" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// import CustomLoaderSpinner from "@/components/CustomLoaderSpinner.vue";

// Define emits
const emit = defineEmits(["cardPaymentSelected"]);

// Methods
const emitCardPaymentSelected = () => {
  emit("cardPaymentSelected");
};
</script>

<style scoped>

.pay-by-card-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 12px;
  border-radius: 12px;
  border: 1px solid var(--grey-200);
  cursor: pointer;

  .title-txt {
    font-size: 14px;
    font-weight: 700;
    line-height: 150%;
    color: var(--base-black);
    padding: 0;
    margin: 0;
  }
}

.card-icons-container {
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-icons {
  display: flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  height: 20px;
  padding: 0 4px;
  border: 1.25px solid var(--grey-200);
  border-radius: 4px;
}
</style>
