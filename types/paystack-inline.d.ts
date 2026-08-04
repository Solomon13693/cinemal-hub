declare module '@paystack/inline-js' {
  export default class PaystackPop {
    newTransaction(options: {
      key: string
      email?: string
      amount?: number
      accessCode?: string
      reference?: string
      onSuccess?: (response: { reference: string }) => void
      onCancel?: () => void
    }): void
  }
}
