export enum ViewType {
  ExplainerView = "ExplainerView",
  PaymentOptionsView = "PaymentOptionsView",
  ChoosePaymentMethodView = "ChoosePaymentMethodView",
  SelectBankView = "SelectBankView",
  PaymentInProgressView = "PaymentInProgressView",
  PaymentStatusView = "PaymentStatusView",
}

export namespace ViewType {
  export const values = (): ViewType[] => {
    return Object.values(ViewType).filter(
      (value) => typeof value === "string"
    ) as ViewType[];
  };
}
