- Storage State.
- Multi-tab.
- Validating downloads.

<b>Storage State:</b> Saves the browser authentication data- like cookies, local-storage into JSON file after logging in once. Tests can then reuse this saved state to skip the login UI, speeding up test execution. 
- This avoids repeated logins, helps to achieve faster execution, reduce the server for consistent sessions.    

Will save the credentials in "auth.json". which can be called to execute any other testcases for an application.
  ` await page.context().storageState({ path: 'auth.json' });`

<h2><b>Downloading </b></h2>
We generally use `waitForEvent()` method used to pause script execution until a specific browser event occurs like download, popup, dialog etc.

How it works?

  `const downloadPromise = this.page.waitForEvent('download');`
- Set the trap (waitForEvent): This will turn on the Playwright radar, i.e., this tells playwright there might be an download going to start at any second.

- Then clicking on the button `await this.downloadButton.click(); ` the website will prepare the file and website then flings the file at your browser.

- `const download = await downloadPromise;` playwright catches file in mid-air, (browser shouts incoming file). I t will stop the script & wait until file is fully downloaded into a temporary folder inside playwright environment.

   ```
       const downloadPromise = this.page.waitForEvent('download');
       await this.downloadButton.click();  // click the download trigger
       const download = await downloadPromise; // wait for the download to complete
    ```

  <h2><b> Multi-Tab:</b></h2> New page event in the same browser context using an existing page context. 
```
  // Wait for new page event while clicking link with target="_blank"
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('#candidatePortfolioLink').click(),
    ]);
 ```       

Two parallel actions, one event: You're setting up the listener (waitForEvent) before triggering the user action (click). Promise.all binds them together so Playwright never misses the event due to a race condition.

Same Browser Context: context.waitForEvent('page') listens for tabs within the same browser context, which is why your authentication state (auth.json) automatically transfers over to the new tab without requiring another login.

The "Radar" Analogy: Calling waitForEvent sets up Playwright's listener radar. When the click fires and the browser emits the event (whether it's page, download, or dialog), the radar catches it and assigns the resulting object (newPage, download, etc.) directly to your variable.
