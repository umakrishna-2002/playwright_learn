class RegisterPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.locator('[data-test="register-email"]');
    this.usernameInput = page.locator('[data-test="register-username"]');
    this.passwordInput = page.locator('[data-test="register-password"]');
    this.confirmPasswordInput = page.locator('[data-test="register-confirm-password"]');
    this.registerBtn = page.locator('[data-test="register-submit-btn"]');
    this.loginLink = page.locator('[data-test="goto-login-link"]');
  }

  async registerUser(user) {
    await this.emailInput.fill(user.email);
    await this.usernameInput.fill(user.username);
    await this.passwordInput.fill(user.password);
    await this.confirmPasswordInput.fill(user.confirmPassword);
    await this.registerBtn.click();
  }

  async navigateToLogin() {
    await this.loginLink.click();
  }
}

module.exports = { RegisterPage };
