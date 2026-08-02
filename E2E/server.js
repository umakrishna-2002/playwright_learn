const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// --- DATABASE SETUP (SQLite) ---
const db = new sqlite3.Database('./app.db', (err) => {
  if (err) console.error('Database connection error:', err);
  else console.log('Connected to SQLite database (app.db).');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    username TEXT UNIQUE,
    password TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    itemName TEXT,
    paymentMethod TEXT,
    bankName TEXT,
    cardNumber TEXT,
    status TEXT
  )`);
});

// --- API ENDPOINTS ---

// Register User
app.post('/api/register', (req, res) => {
  const { email, username, password, confirmPassword } = req.body;

  if (!email || !username || !password || !confirmPassword) {
    return res.status(400).json({ error: 'All fields marked with (*) are mandatory.' });
  }

  // Username validation: At least 4 characters
  if (username.length < 4) {
    return res.status(400).json({ error: 'Username must be at least 4 characters long.' });
  }

  // Password length validation: More than 5 characters (6+)
  if (password.length <= 5) {
    return res.status(400).json({ error: 'Password is to short' });
  }

  // Password uppercase validation
  if (!/[A-Z]/.test(password)) {
    return res.status(400).json({ error: 'Password must contain at least one capital letter.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  db.run('INSERT INTO users (email, username, password) VALUES (?, ?, ?)', [email, username, password], function (err) {
    if (err) return res.status(400).json({ error: 'User or Email already exists' });
    res.status(201).json({ id: this.lastID, username, message: 'Account created successfully' });
  });
});

// Login User
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'Invalid credentials' });
    res.status(200).json({ message: 'Login successful', username: user.username });
  });
});

// Create Order / Checkout
app.post('/api/checkout', (req, res) => {
  const { username, itemName, paymentMethod, nameOnCard, bankName, cardNumber, cvv } = req.body;

  if (!nameOnCard || !bankName || !cardNumber || !cvv) {
    return res.status(400).json({ error: 'Please fill in all mandatory card/bank details.' });
  }
  if (cardNumber.length !== 10 || isNaN(cardNumber)) {
    return res.status(400).json({ error: 'Card number must be exactly 10 digits.' });
  }
  if (cvv.length !== 3 || isNaN(cvv)) {
    return res.status(400).json({ error: 'CVV must be exactly 3 digits.' });
  }

  db.run('INSERT INTO orders (username, itemName, paymentMethod, bankName, cardNumber, status) VALUES (?, ?, ?, ?, ?, ?)',
    [username, itemName, paymentMethod, bankName, cardNumber, 'PAID'], function (err) {
    if (err) return res.status(500).json({ error: 'Failed to complete payment' });
    res.status(201).json({ orderId: this.lastID, itemName, paymentMethod, status: 'PAID' });
  });
});

// Reset Database (For Testing Teardown)
app.post('/api/test/reset', (req, res) => {
  db.serialize(() => {
    db.run('DELETE FROM users');
    db.run('DELETE FROM orders');
  });
  res.status(200).json({ message: 'Database reset successfully' });
});

// --- SERVE FRONTEND (WILDCARD EXPRESS 5 FIX) ---
app.get('/{*splat}', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>E-Commerce Test Portal</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f6f8; }
        .container { max-width: 900px; margin: 0 auto; background: #fff; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .hidden { display: none !important; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input[type="text"], input[type="password"], input[type="email"], select { width: 100%; padding: 10px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px; }
        button { background-color: #28a745; color: white; padding: 10px 18px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
        button:hover { opacity: 0.9; }
        .btn-secondary { background-color: #007bff; }
        .btn-cart { background-color: #ff9900; color: #111; }
        .link-btn { background: none; border: none; color: #007bff; text-decoration: underline; cursor: pointer; padding: 0; font-size: 14px; margin-top: 10px; display: inline-block; }

        .catalog-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 15px; }
        .search-bar { width: 60%; position: relative; }
        .grid-container { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        .item-card { border: 1px solid #e0e0e0; padding: 15px; border-radius: 6px; background: #fafafa; display: flex; flex-direction: column; justify-content: space-between; }
        .item-card h4 { margin: 0 0 10px 0; color: #333; }
        .item-card p { font-size: 13px; color: #666; margin-bottom: 15px; flex-grow: 1; }
        .item-price { font-size: 16px; font-weight: bold; color: #d9534f; margin-bottom: 10px; }
        .card-actions { display: flex; gap: 10px; }

        .radio-options { margin: 15px 0; }
        .radio-options label { font-weight: normal; margin-right: 20px; cursor: pointer; display: inline-block; }
        .mandatory { color: red; }

        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background-color: #f2f2f2; }

        .dialog-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; }
        .dialog-box { background: white; padding: 20px; border-radius: 8px; text-align: center; width: 300px; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
      </style>
    </head>
    <body>

      <div class="container">

        <!-- PAGE 1: LOGIN -->
        <div id="loginPage">
          <h2>Sign In</h2>
          <div class="form-group">
            <label>Username<span class="mandatory">*</span></label>
            <input type="text" id="loginUsername" placeholder="Enter Username" autocomplete="off" data-test="username-input"/>
          </div>
          <div class="form-group">
            <label>Password<span class="mandatory">*</span></label>
            <input type="password" id="loginPassword" placeholder="Enter Password" autocomplete="new-password" data-test="password-input"/>
          </div>
          <button onclick="handleLogin()" data-test="login-btn">Log In</button>
          <br/>
          <button class="link-btn" onclick="navigateTo('/signup')" data-test="create-account-link">create account</button>
          <p id="loginError" style="color:red;" data-test="login-error"></p>
        </div>

        <!-- PAGE 2: CREATE ACCOUNT -->
        <div id="signupPage" class="hidden">
          <h2>Create New Account</h2>
          <div class="form-group">
            <label>Email<span class="mandatory">*</span></label>
            <input type="email" id="regEmail" placeholder="user@example.com" autocomplete="off" data-test="reg-email-input"/>
          </div>
          <div class="form-group">
            <label>Username (min 4 chars)<span class="mandatory">*</span></label>
            <input type="text" id="regUsername" placeholder="Choose Username" autocomplete="off" data-test="reg-username-input"/>
          </div>
          <div class="form-group">
            <label>Password (min 6 chars, 1 Capital)<span class="mandatory">*</span></label>
            <input type="password" id="regPassword" placeholder="Create Password" autocomplete="new-password" data-test="reg-password-input"/>
          </div>
          <div class="form-group">
            <label>Re-type Password<span class="mandatory">*</span></label>
            <input type="password" id="regConfirmPassword" placeholder="Re-type Password" autocomplete="new-password" data-test="reg-confirm-password-input"/>
          </div>
          <button class="btn-secondary" onclick="handleRegister()" data-test="register-btn">Register Account</button>
          <br/>
          <button class="link-btn" onclick="navigateTo('/')">Back to Sign In</button>
          <p id="regMsg" data-test="register-message"></p>
        </div>

        <!-- PAGE 3: MAIN CATALOG -->
        <div id="mainCatalogPage" class="hidden">
          <div class="catalog-header">
            <div class="search-bar">
              <input type="text" id="searchBox" onkeyup="handleSearch()" placeholder="Search items..." data-test="search-bar"/>
            </div>
            <button class="btn-cart" onclick="navigateTo('/cart')" data-test="view-cart-btn">View Cart (<span id="cartCount">0</span>)</button>
          </div>

          <h3>Catalog Items</h3>
          <div class="grid-container" id="catalogGrid"></div>
        </div>

        <!-- PAGE 4: PAYMENT / CHECKOUT -->
        <div id="paymentPage" class="hidden">
          <h2>Checkout & Payment Options</h2>
          <p>Item Selected: <strong id="checkoutItemTitle" data-test="checkout-item-name"></strong></p>
          <p>Price: <strong id="checkoutItemPrice"></strong></p>

          <div class="radio-options">
            <label><input type="radio" name="paymentType" value="Credit Card" checked data-test="pay-credit"/> Credit Card</label>
            <label><input type="radio" name="paymentType" value="UPI" data-test="pay-upi"/> UPI</label>
            <label><input type="radio" name="paymentType" value="Debit Card" data-test="pay-debit"/> Debit Card</label>
          </div>

          <div class="card-details-form">
            <div class="form-group">
              <label>Name on Card / Account<span class="mandatory">*</span></label>
              <input type="text" id="payName" placeholder="John Doe" data-test="pay-name"/>
            </div>
            <div class="form-group">
              <label>Bank Name<span class="mandatory">*</span></label>
              <input type="text" id="payBank" placeholder="HDFC / SBI / ICICI" data-test="pay-bank"/>
            </div>
            <div class="form-group">
              <label>Card Number (10 Digits)<span class="mandatory">*</span></label>
              <input type="text" id="payCardNo" maxlength="10" placeholder="1234567890" data-test="pay-card-no"/>
            </div>
            <div class="form-group">
              <label>CVV Number (3 Digits)<span class="mandatory">*</span></label>
              <input type="password" id="payCvv" maxlength="3" placeholder="123" data-test="pay-cvv"/>
            </div>
            <button onclick="submitPayment()" data-test="confirm-payment-btn">Confirm Payment</button>
            <button class="link-btn" onclick="navigateTo('/catalog')" style="margin-left: 15px;">Cancel</button>
            <p id="payError" style="color:red;" data-test="pay-error"></p>
          </div>
        </div>

        <!-- PAGE 5: VIEW CART -->
        <div id="cartPage" class="hidden">
          <h2>Your Cart Items</h2>
          <table>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Description</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody id="cartTableBody" data-test="cart-table-body"></tbody>
          </table>
          <br/>
          <button class="btn-secondary" onclick="navigateTo('/catalog')" data-test="back-to-catalog-btn">Continue Shopping</button>
        </div>

      </div>

      <!-- DIALOG MODAL -->
      <div id="alertDialog" class="dialog-overlay hidden">
        <div class="dialog-box">
          <h3 style="color: green;">Added to Cart</h3>
          <p id="dialogMsg">Item successfully added to your shopping cart!</p>
          <button onclick="closeDialog()" data-test="dialog-ok-btn">OK</button>
        </div>
      </div>

      <script>
        var catalogData = [
          { id: 1, name: "Playwright Testing Masterclass", price: "$99", desc: "Complete E2E UI and API automation testing course using JavaScript." },
          { id: 2, name: "Docker Containerization Guide", price: "$49", desc: "Learn Docker files, multi-container compose setups, and networking." },
          { id: 3, name: "Kubernetes Cluster Deployment", price: "$89", desc: "Hands-on guide to production Kubernetes, ingress, and pod scaling." },
          { id: 4, name: "AWS S3 Event Notifications", price: "$39", desc: "Architecting cloud event triggers using Amazon S3 and Lambda." },
          { id: 5, name: "Terraform Infrastructure as Code", price: "$69", desc: "Automate cloud resources cleanly with Terraform modules and state files." },
          { id: 6, name: "Jenkins CI/CD Pipeline Blueprint", price: "$59", desc: "Build automated build and deployment pipelines for modern DevOps." },
          { id: 7, name: "Nginx Reverse Proxy & Load Balancer", price: "$29", desc: "Configure Nginx server blocks, SSL termination, and rate limiting." },
          { id: 8, name: "TCP Networking & Wireshark Secrets", price: "$45", desc: "Analyze raw network packets, TCP handshakes, and socket traffic." },
          { id: 9, name: "SQL & Relational Database Design", price: "$35", desc: "Design complex queries, indexes, and database schema structures." },
          { id: 10, name: "Kiro & AWS CLI Command Pro", price: "$19", desc: "Speed up terminal interactions for managing AWS cloud services." }
        ];

        var currentUser = '';
        var cartItems = [];
        var selectedBuyItem = null;

        var routeMap = {
          '/': 'loginPage',
          '/signup': 'signupPage',
          '/catalog': 'mainCatalogPage',
          '/checkout': 'paymentPage',
          '/cart': 'cartPage'
        };

        function clearLoginForm() {
          document.getElementById('loginUsername').value = '';
          document.getElementById('loginPassword').value = '';
          document.getElementById('loginError').innerText = '';
        }

        function clearSignupForm() {
          document.getElementById('regEmail').value = '';
          document.getElementById('regUsername').value = '';
          document.getElementById('regPassword').value = '';
          document.getElementById('regConfirmPassword').value = '';
          document.getElementById('regMsg').innerText = '';
        }

        function renderRoute(path) {
          var targetPage = routeMap[path] || 'loginPage';
          ['loginPage', 'signupPage', 'mainCatalogPage', 'paymentPage', 'cartPage'].forEach(function(id) {
            document.getElementById(id).classList.add('hidden');
          });
          document.getElementById(targetPage).classList.remove('hidden');

          if (targetPage === 'loginPage') {
            clearLoginForm();
          } else if (targetPage === 'signupPage') {
            clearSignupForm();
          } else if (targetPage === 'mainCatalogPage') {
            renderCatalog(catalogData);
          }
        }

        function navigateTo(path) {
          window.history.pushState({}, '', path);
          renderRoute(path);
        }

        window.onpopstate = function() {
          renderRoute(window.location.pathname);
        };

        function renderCatalog(items) {
          var grid = document.getElementById('catalogGrid');
          grid.innerHTML = '';
          items.forEach(function(item) {
            grid.innerHTML +=
              '<div class="item-card" data-test="item-card">' +
                '<div>' +
                  '<h4 data-test="item-name">' + item.name + '</h4>' +
                  '<p>' + item.desc + '</p>' +
                '</div>' +
                '<div>' +
                  '<div class="item-price">' + item.price + '</div>' +
                  '<div class="card-actions">' +
                    '<button onclick="triggerBuyNow(' + item.id + ')" data-test="buy-now-btn">Buy Now</button>' +
                    '<button class="btn-cart" onclick="addToCart(' + item.id + ')" data-test="add-to-cart-btn">Add to Cart</button>' +
                  '</div>' +
                '</div>' +
              '</div>';
          });
        }

        function handleSearch() {
          var query = document.getElementById('searchBox').value.toLowerCase();
          var filtered = catalogData.filter(function(item) {
            return item.name.toLowerCase().indexOf(query) !== -1 || item.desc.toLowerCase().indexOf(query) !== -1;
          });
          renderCatalog(filtered);
        }

        async function handleLogin() {
          var u = document.getElementById('loginUsername').value;
          var p = document.getElementById('loginPassword').value;

          var res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: u, password: p })
          });

          var data = await res.json();
          if (res.ok) {
            currentUser = u;
            navigateTo('/catalog');
          } else {
            document.getElementById('loginError').innerText = data.error || 'Login failed';
          }
        }

        async function handleRegister() {
          var e = document.getElementById('regEmail').value;
          var u = document.getElementById('regUsername').value;
          var p = document.getElementById('regPassword').value;
          var cp = document.getElementById('regConfirmPassword').value;

          var res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: e, username: u, password: p, confirmPassword: cp })
          });

          var data = await res.json();
          var msg = document.getElementById('regMsg');
          if (res.ok) {
            msg.style.color = 'green';
            msg.innerText = 'Account created! Redirecting to Sign In...';
            setTimeout(function() {
              navigateTo('/');
            }, 1200);
          } else {
            msg.style.color = 'red';
            msg.innerText = data.error || 'Registration failed';
          }
        }

        function addToCart(itemId) {
          var item = catalogData.find(function(i) { return i.id === itemId; });
          cartItems.push(item);
          document.getElementById('cartCount').innerText = cartItems.length;

          var tbody = document.getElementById('cartTableBody');
          tbody.innerHTML +=
            '<tr data-test="cart-row">' +
              '<td>' + item.name + '</td>' +
              '<td>' + item.desc + '</td>' +
              '<td>' + item.price + '</td>' +
            '</tr>';

          document.getElementById('alertDialog').classList.remove('hidden');
        }

        function closeDialog() {
          document.getElementById('alertDialog').classList.add('hidden');
        }

        function triggerBuyNow(itemId) {
          selectedBuyItem = catalogData.find(function(i) { return i.id === itemId; });
          document.getElementById('checkoutItemTitle').innerText = selectedBuyItem.name;
          document.getElementById('checkoutItemPrice').innerText = selectedBuyItem.price;
          navigateTo('/checkout');
        }

        async function submitPayment() {
          var payType = document.querySelector('input[name="paymentType"]:checked').value;
          var name = document.getElementById('payName').value;
          var bank = document.getElementById('payBank').value;
          var cardNo = document.getElementById('payCardNo').value;
          var cvv = document.getElementById('payCvv').value;

          var res = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: currentUser,
              itemName: selectedBuyItem ? selectedBuyItem.name : 'Unknown Item',
              paymentMethod: payType,
              nameOnCard: name,
              bankName: bank,
              cardNumber: cardNo,
              cvv: cvv
            })
          });

          var data = await res.json();
          if (res.ok) {
            alert('Payment Successful! Order #' + data.orderId + ' confirmed.');
            navigateTo('/catalog');
          } else {
            document.getElementById('payError').innerText = data.error || 'Payment failed';
          }
        }

        renderRoute(window.location.pathname);
      </script>
    </body>
    </html>
  `);
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running with updated validation & fresh navigation at http://localhost:${PORT}`));
