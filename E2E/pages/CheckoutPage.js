class CheckoutPage {
  constructor(page) {
    this.page = page;
    this.nameInput = page.locator('[data-test="pay-name"]');
    this.bankInput = page.locator('[data-test="pay-bank"]');
    this.cardNoInput = page.locator('[data-test="pay-card-no"]');
    this.cvvInput = page.locator('[data-test="pay-cvv"]');
    this.confirmPayBtn = page.locator('[data-test="confirm-payment-btn"]');
  }

  async completePayment(details) {
    await this.nameInput.fill(details.name);
    await this.bankInput.fill(details.bank);
    await this.cardNoInput.fill(details.cardNo);
    await this.cvvInput.fill(details.cvv);
    await this.confirmPayBtn.click();
  }
}

module.exports = { CheckoutPage };
