class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.locator('[data-test="username-input"]');
    this.passwordInput = page.locator('[data-test="password-input"]');
    this.loginBtn = page.locator('[data-test="login-btn"]');
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginBtn.click();
  }
}

module.exports = { LoginPage };
