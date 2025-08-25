
<template>
  <footer class="trust-badges-footer">
    <div class="footer-badges">
      <div class="badge">
        <img
          src="@/assets/images/lock-with-tick.svg"
          alt="ISO 27001 and SOC2 Secure"
        />
        <span
          >ISO 27001 and<br />
          SOC2 Secure</span
        >
      </div>
      <div class="badge">
        <img
          src="@/assets/images/uk_flag.svg"
          alt="Processed by UK Banks"
        />
        <span>Processed by UK Banks</span>
      </div>
      <div class="badge">
        <img src="@/assets/images/fca-shield.svg" alt="Authorised by the FCA" />
        <span>Authorised by the FCA</span>
      </div>
    </div>
  </footer>
</template>

<style>

.color-grey-500 {
  color: white;
}

.trust-badges-footer {
  width: 100%;
  max-width: 343px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.footer-badges {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
}

.badge {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 32%;

  img {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }

  span {
    font-size: 9px;
    max-width: 60px;
    color: white;
  }
}
</style>
