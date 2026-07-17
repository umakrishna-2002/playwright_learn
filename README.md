# playwright_learn
Learning about testing with playwright (API and UI testings)

**Testing** : The  process of evaluating and verifying that an application functions correctly, securely, and efficiently according to its business requirements.

**Benfits of testing**: 

1. Serves as documentation on how the code should work.
2. Reduce the stress of releasing the new features.
3. Gives you confidence to refactor and improve the code.

   

```text
               /   \
              /     \
             / E2E   \
            /---------\
           /Integration\
          /-------------\
         / Unit Testing  \
        /________________ \
```

- The pyramid reprsents many Unit test, few Integration test and less E2E tests.

  **Unit Testing**: Testing every single unit of the code, function, method or class in the complete isolation.

  **Integration Testing**: Test to know how well the componets are working together. (ex: API endpoints correctly reads form and write to the database)

  **End-to-End testing** : Check hoe the entire system is working together. Simulate real user behaviour, they interact with the application throught he same interface as user do.

  - Clicking forms
  - filling forms
  - Navigation pages.
 
    **PLAYWRIGHT**: ENables reliable web automation for testing, scripting and AI agents.

    - The code written in playwright will make the browser automatically open website, click on buttons, fill the forms and extract the information.
    - Does the tedous taks faster which will be too slow, to expensive by human.
   

      **Features of Playwright**
      - Free and open source.
      - Multi-Browser, multi-language, Multi-OS.
      - Easy setup and configure.
      - Can do functional and API testing.
      - Can test parllely by running playwright on multiple web broswers).
      - Supports CI/CD and Dockerization.
     
Playwright strictly follows **Naming Rules**


- **Folder**: Must be named "tests/"
- **Test files**: "test_payment.py"
- **Test Function**: Must start with **test_** i.e., (def test_valid_checkout():).


**Playwright with Pytest**: way to write E2E browser automation tests in python. 



