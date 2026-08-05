E2E Testing for an application for UI and API's using POM model.

- An UI application is made to test UI and few API endpoints to test or automates the complete user journeys. 

The E-commerce application contains a login and signup page, where the older user can sign In and new user can able to create anew account, the application contains search bar, the application can able to recommend things when we type in the search bar. 

 - The application has few products "to buy" and "add to cart". where you can able to buy the products by few adding few payment details, and can list all the products you want to buy later.


   <h2><b>E2E UI Testing </b></h2>

   Test cases has been written using POM (Page Object Model).

    - The application is hosted locally.
Sent a HTTP request to clean up all the database, to avoid unnecessary errors.


Uses Date.now(), to create a unique email and username (e.g., ui_shopper_1715000000000) so the registration step never fails due to duplicate accounts.  
- User Registration.
 
Opens the browser to the /register page.

Calls "registerPage.registerUser()", which fills out the sign-up form using newUser details and submits it.

Navigates to /login and fills in the newly created credentials.

- Alert Handling: Submitting Payment Details (UI)
 
Assertion: Verifies that upon successful login, the application automatically redirects the browser to ${APP_URL}/catalog.

- Shopping & Cart Verification (UI)
 
 Clicks the "Add to Cart" button for the first product displayed on the catalog page.

Assertion: Verifies that the cart button UI updates its counter text to show '1' item.

- Proceeding to Checkout (UI)
 
Clicks the "Buy Now" button on the product.

Assertion: Verifies that the browser navigates to the ${APP_URL}/checkout page.

- Alert Handling: Submitting Payment Details (UI)
Alert Listener: Sets up an event listener (page.once('dialog', ...)). If a browser popup alert appears during payment submission (e.g., "Payment Successful!"), Playwright automatically dismisses it so the test doesn't freeze.

Submit Payment: Calls checkoutPage.completePayment() to type the payment details into the form and submit the order.

- Final Redirection Assertion
Final Assertion: Asserts that after checkout completes, the web application redirects the user back to the ${APP_URL}/catalog page.



$$\text{Reset DB (API)} \rightarrow \text{Register} \rightarrow \text{Login} \rightarrow \text{Add Item to Cart} \rightarrow \text{Checkout} \rightarrow \text{Pay} \rightarrow \text{Verify Return to Catalog}$$
