class DashboardPage {
  constructor(page) {
    this.page = page;
    this.addEmployeeBtn = page.getByRole('button', { name: '+ Add Employee' });
    this.nameInput = page.getByLabel('Full Name:');
    this.deptInput = page.getByLabel('Department:');
    this.roleInput = page.getByLabel('Role:');
    this.salaryInput = page.getByLabel('Salary ($):');
    this.saveBtn = page.getByRole('button', { name: 'Save' });
    this.reportsLink = page.getByRole('link', { name: 'Reports' });

  }

  async navigate() {
    await this.page.goto('/dashboard.html');
  }
  
  async addEmployee(name, dept, role, salary) {
    await this.addEmployeeBtn.click();
    await this.nameInput.fill(name);
    await this.deptInput.fill(dept);
    await this.roleInput.fill(role);
    await this.salaryInput.fill(salary);
    await this.saveBtn.click();
  }

  async deleteEmployee(name) {
    const row = this.page.getByRole('row').filter({ hasText: name });
    await row.getByRole('button', { name: 'Delete' }).click();
  }
  async goToReports() {
    await this.reportsLink.click();
  }
}

module.exports = { DashboardPage };
