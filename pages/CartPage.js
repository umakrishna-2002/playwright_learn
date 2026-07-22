class SauceDemoPage {
    constructor(page) {
        this.page = page;
     /*
        going into the page and getting the elements from the page using locators and storing them in variables to use them in the test cases.
     */

        this.nameInput = page.getByPlaceholder('Username');
        this.passInput = page.getByPlaceholder('Password');
        this.loginButton = page.getByRole('button', { name: 'Login' });
/*
adding the items into the cart by ciclking on the add to cart button. 
*/
        this.backpackaddtoCartButton =page.locator('[data-test="add-to-cart-sauce-labs-backpack"]');
        this.bikelightaddtoCartButton = page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]');
        this.cartButton = page.locator('.shopping_cart_badge');
    }
    async navigate() {                     //function to go into the website 
        await this.page.goto('https://www.saucedemo.com/');
    }
    async login(username,password) {     //filling the login details and clicking in the login button action
        await this.nameInput.fill(username);
        await this.passInput.fill(password);
        await this.loginButton.click();
    }
    async addBackpackToCart() {   //fucntion to add the items into the cart.  
        await this.backpackaddtoCartButton.click();   
       await this.bikelightaddtoCartButton.click();
    }
    }

    module.exports = { SauceDemoPage };

