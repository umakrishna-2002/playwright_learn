const { test, expect } = require('@playwright/test');
const  { SauceDemoPage } = require('../pages/CartPage');


// Adding all the test scenario's to test the website 
test.describe('SauceDemo Shopping Cart', () => {
    test('Ading items into the cart', async ({ page }) => {

        //First test case: testing if the items are added into the cart or not
        // Initialize the page object remote control
        const saucePage = new SauceDemoPage(page);

        //Go to the website and login with the creditinals  
        await saucePage.navigate();
        await saucePage.login('standard_user','secret_sauce');

        await saucePage.addBackpackToCart();  //Adding the items into the cart

        // Assertion step: checking if the no.of items added to the cart or not.
        await expect(saucePage.cartButton).toBeVisible();
        await expect(saucePage.cartButton).toHaveText('2');
    });
 });

