class InventoryPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.title = page.getByText('Products');
    this.itemPrices = page.locator('.inventory_item_price');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.cartBadge = page.locator('.shopping_cart_badge');
  }

  async addBackpackToCart() {
    await this.page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  }

  async sortByPriceLowToHigh() {
    await this.sortDropdown.selectOption('lohi');
  }
}

module.exports = { InventoryPage };
