class CatalogPage {
  constructor(page) {
    this.page = page;
    this.addToCartBtns = page.locator('[data-test="add-to-cart-btn"]');
    this.dialogOkBtn = page.locator('[data-test="dialog-ok-btn"]');
    this.viewCartBtn = page.locator('[data-test="view-cart-btn"]');
    this.buyNowBtns = page.locator('[data-test="buy-now-btn"]');
  }

  async addFirstItemToCart() {
    await this.addToCartBtns.first().click();
    await this.dialogOkBtn.click();
  }

  async goToCart() {
    await this.viewCartBtn.click();
  }

  async buyFirstItemNow() {
    await this.buyNowBtns.first().click();
  }
}

module.exports = { CatalogPage };
