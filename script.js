const API_URL = 'https://68484c26ec44b9f349406c8c.mockapi.io/mine/users';
const PAYSTACK_PUBLIC_KEY = 'pk_test_4b6f07b034fb6364157ea394e8dbc4af9465b598'; 
const BACKEND_URL = '/.netlify/functions/send-email'; // Netlify Function endpoint
const API_KEY = 'Babalawo1234!'; // Match Netlify env variable

let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

const BASE_MINING_RATE = 50; // Points per 12h without boost
const MINING_DURATION = 12 * 60 * 60 * 1000; // 12 hours
const BOOST_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days
const USD_TO_NGN = 1500; // Approx. rate
const NGN_PER_100_POINTS = 50; // Redemption rate
const MIN_REDEEM_POINTS = 100;
const MIN_REDEEM_POINTS_THRESHOLD = 4000; // Threshold for redemption notification
const ADMIN_EMAIL = 'ridwansaliu84@gmail.com';

// Boost Tiers
const BOOST_TIERS = {
  basic: { name: 'Basic Boost', costNGN: 1500, miningRate: 100 }, // 100 points/12h
  super: { name: 'Super Boost', costNGN: 3000, miningRate: 200 } // 200 points/12h
};

// Shop Items
const SHOP_ITEMS = {
  neonBadge: { name: 'Neon Badge', cost: 100 },
  starAvatar: { name: 'Star Avatar', cost: 500 }
};

// DOM Elements
const loginSection = document.getElementById('loginSection');
const signupSection = document.getElementById('signupSection');
const gameSection = document.getElementById('gameSection');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const boostForm = document.getElementById('boostForm');
const transferForm = document.getElementById('transferForm');
const redeemForm = document.getElementById('redeemForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const signupEmail = document.getElementById('signupEmail');
const signupPassword = document.getElementById('signupPassword');
const boostType = document.getElementById('boostType');
const transferEmail = document.getElementById('transferEmail');
const transferPoints = document.getElementById('transferPoints');
const redeemPoints = document.getElementById('redeemPoints');
const bankName = document.getElementById('bankName');
const accountNumber = document.getElementById('accountNumber');
const accountName = document.getElementById('accountName');
const loginEmailError = document.getElementById('login-email-error');
const loginPasswordError = document.getElementById('login-password-error');
const loginGeneralError = document.getElementById('login-general-error');
const signupEmailError = document.getElementById('signup-email-error');
const signupPasswordError = document.getElementById('signup-password-error');
const signupGeneralError = document.getElementById('signup-general-error');
const signupVerificationSuccess = document.getElementById('signup-verification-success');
const boostTypeError = document.getElementById('boost-type-error');
const boostError = document.getElementById('boost-error');
const boostSuccess = document.getElementById('boost-success');
const transferEmailError = document.getElementById('transfer-email-error');
const transferPointsError = document.getElementById('transfer-points-error');
const transferSuccess = document.getElementById('transfer-success');
const transferGeneralError = document.getElementById('transfer-error');
const redeemPointsError = document.getElementById('redeem-points-error');
const bankNameError = document.getElementById('bank-name-error');
const accountNumberError = document.getElementById('account-number-error');
const accountNameError = document.getElementById('account-name-error');
const redeemError = document.getElementById('redeem-error');
const redeemSuccess = document.getElementById('redeem-success');
const shopError = document.getElementById('shop-error');
const shopSuccess = document.getElementById('shop-success');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const boostBtn = document.getElementById('boostBtn');
const transferBtn = document.getElementById('transferBtn');
const redeemBtn = document.getElementById('redeemBtn');
const buyNeonBadge = document.getElementById('buyNeonBadge');
const buyStarAvatar = document.getElementById('buyStarAvatar');
const pointsDisplay = document.getElementById('points');
const profilePoints = document.getElementById('profilePoints');
const pendingPoints = document.getElementById('pendingPoints');
const userEmail = document.getElementById('userEmail');
const timerDisplay = document.getElementById('timer');
const mineBtn = document.getElementById('mineBtn');
const leaderboard = document.getElementById('leaderboard');
const purchasedItems = document.getElementById('purchasedItems');
const redemptionHistory = document.getElementById('redemptionHistory');
const boostStatus = document.getElementById('boostStatus');

// Validation Functions
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePassword(password) {
  return password.length >= 6;
}

function validatePoints(points) {
  return points >= MIN_REDEEM_POINTS && Number.isInteger(Number(points)) && points % 100 === 0;
}

function validateBankName(name) {
  return name.trim().length > 0;
}

function validateAccountNumber(number) {
  const re = /^\d{10}$/;
  return re.test(number);
}

function validateAccountName(name) {
  return name.trim().length > 0;
}

function validateBoostType(type) {
  return ['basic', 'super'].includes(type);
}

function showError(element, message) {
  element.textContent = message;
  element.style.display = 'block';
}

function showSuccess(element, message) {
  element.textContent = message;
  element.style.display = 'block';
}

function clearErrors(...elements) {
  elements.forEach(el => {
    el.textContent = '';
    el.style.display = 'none';
  });
}

// Toggle Button Loading State
function toggleButtonLoading(button, isLoading, defaultText, loadingText) {
  if (isLoading) {
    button.classList.add('loading');
    button.disabled = true;
    button.querySelector('.button-text').textContent = loadingText;
  } else {
    button.classList.remove('loading');
    button.disabled = false;
    button.querySelector('.button-text').textContent = defaultText;
  }
}

// Toggle Sections
function showLogin() {
  clearErrors(loginEmailError, loginPasswordError, loginGeneralError, signupEmailError, signupPasswordError, signupGeneralError, signupVerificationSuccess, boostError, boostSuccess, transferEmailError, transferPointsError, transferGeneralError, transferSuccess, shopError, shopSuccess, redeemPointsError, bankNameError, accountNumberError, accountNameError, redeemError, redeemSuccess, boostTypeError);
  loginSection.classList.remove('d-none');
  signupSection.classList.add('d-none');
  gameSection.classList.add('d-none');
}

function showSignup() {
  clearErrors(loginEmailError, loginPasswordError, loginGeneralError, signupEmailError, signupPasswordError, signupGeneralError, signupVerificationSuccess, boostError, boostSuccess, transferEmailError, transferPointsError, transferGeneralError, transferSuccess, shopError, shopSuccess, redeemPointsError, bankNameError, accountNumberError, accountNameError, redeemError, redeemSuccess, boostTypeError);
  signupSection.classList.remove('d-none');
  loginSection.classList.add('d-none');
  gameSection.classList.add('d-none');
}

function showGame() {
  clearErrors(loginEmailError, loginPasswordError, loginGeneralError, signupEmailError, signupPasswordError, signupGeneralError, signupVerificationSuccess, boostError, boostSuccess, transferEmailError, transferPointsError, transferGeneralError, transferSuccess, shopError, shopSuccess, redeemPointsError, bankNameError, accountNumberError, accountNameError, redeemError, redeemSuccess, boostTypeError);
  gameSection.classList.remove('d-none');
  loginSection.classList.add('d-none');
  signupSection.classList.add('d-none');
  updatePointsAndTimer();
  updateLeaderboard();
  updatePurchasedItems();
  updateRedemptionHistory();
  updateBoostStatus();
  if (currentUser) {
    userEmail.textContent = currentUser.email;
    profilePoints.textContent = currentUser.points;
    syncPendingBoosts();
    syncPendingPurchases();
    syncPendingRedemptions();
  }
  document.querySelector('#profile-tab').click();
}

// Check if user is logged in
if (currentUser) {
  showGame();
}

// Sign-Up Handler
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors(signupEmailError, signupPasswordError, signupGeneralError, signupVerificationSuccess);
  toggleButtonLoading(signupBtn, true, 'Sign Up', 'Signing up...');

  const email = signupEmail.value.trim();
  const password = signupPassword.value.trim();

  if (!email) {
    showError(signupEmailError, 'Email is required');
    toggleButtonLoading(signupBtn, false, 'Sign Up', 'Signing up...');
    return;
  }
  if (!validateEmail(email)) {
    showError(signupEmailError, 'Please enter a valid email');
    toggleButtonLoading(signupBtn, false, 'Sign Up', 'Signing up...');
    return;
  }
  if (!password) {
    showError(signupPasswordError, 'Password is required');
    toggleButtonLoading(signupBtn, false, 'Sign Up', 'Signing up...');
    return;
  }
  if (!validatePassword(password)) {
    showError(signupPasswordError, 'Password must be at least 6 characters');
    toggleButtonLoading(signupBtn, false, 'Sign Up', 'Signing up...');
    return;
  }

  try {
    // Check if email exists
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Network error fetching users');
    const users = await response.json();
    const emailExists = users.find(u => u.email === email);
    if (emailExists) {
      showError(signupGeneralError, 'Email already exists');
      toggleButtonLoading(signupBtn, false, 'Sign Up', 'Signing up...');
      return;
    }

    // Create user
    const newUser = {
      email,
      password,
      points: 0,
      miningStartTime: 0,
      miningRate: BASE_MINING_RATE,
      boostExpiry: 0,
      items: [],
      redemptions: []
    };
    const createResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });
    if (!createResponse.ok) throw new Error('Failed to create user');
    const user = await createResponse.json();
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    toggleButtonLoading(signupBtn, false, 'Sign Up', 'Signing up...');
    showSuccess(signupVerificationSuccess, 'Sign-up successful!');
    showGame();
  } catch (error) {
    console.error('Signup error:', error);
    localStorage.setItem('points', 0);
    localStorage.setItem('miningStartTime', 0);
    currentUser = {
      email,
      points: 0,
      miningStartTime: 0,
      miningRate: BASE_MINING_RATE,
      boostExpiry: 0,
      items: [],
      redemptions: []
    };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    toggleButtonLoading(signupBtn, false, 'Sign Up', 'Signing up...');
    showError(signupGeneralError, 'Error signing up. Using local fallback.');
    showGame();
  }
});

// Login Handler
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors(loginEmailError, loginPasswordError, loginGeneralError);
  toggleButtonLoading(loginBtn, true, 'Login', 'Logging in...');

  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();

  if (!email) {
    showError(loginEmailError, 'Email is required');
    toggleButtonLoading(loginBtn, false, 'Login', 'Logging in...');
    return;
  }
  if (!validateEmail(email)) {
    showError(loginEmailError, 'Please enter a valid email');
    toggleButtonLoading(loginBtn, false, 'Login', 'Logging in...');
    return;
  }
  if (!password) {
    showError(loginPasswordError, 'Password is required');
    toggleButtonLoading(loginBtn, false, 'Login', 'Logging in...');
    return;
  }

  try {
    const response = await fetch(`${API_URL}?email=${encodeURIComponent(email)}`);
    if (!response.ok) throw new Error('Network error during login');
    const users = await response.json();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      currentUser = user;
      localStorage.setItem('currentUser', JSON.stringify(user));
      toggleButtonLoading(loginBtn, false, 'Login', 'Logging in...');
      showGame();
      alert('Login successful!');
    } else {
      showError(loginGeneralError, 'Invalid email or password');
      toggleButtonLoading(loginBtn, false, 'Login', 'Logging in...');
    }
  } catch (error) {
    console.error('Login error:', error);
    showError(loginGeneralError, 'Error logging in. Check network.');
    toggleButtonLoading(loginBtn, false, 'Login', 'Logging in...');
  }
});

// Boost Handler
boostForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors(boostTypeError, boostError, boostSuccess);
  toggleButtonLoading(boostBtn, true, 'Buy Boost', 'Processing...');

  if (!currentUser) {
    showError(boostError, 'Please log in to buy a boost.');
    toggleButtonLoading(boostBtn, false, 'Buy Boost', 'Processing...');
    return;
  }

  const type = boostType.value;
  if (!type) {
    showError(boostTypeError, 'Please select a boost type');
    toggleButtonLoading(boostBtn, false, 'Buy Boost', 'Processing...');
    return;
  }
  if (!validateBoostType(type)) {
    showError(boostTypeError, 'Invalid boost type');
    toggleButtonLoading(boostBtn, false, 'Buy Boost', 'Processing...');
    return;
  }

  const boost = BOOST_TIERS[type];
  const amountNGN = boost.costNGN * 100; // Paystack uses kobo
  const email = currentUser.email;

  try {
    const handler = PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email,
      amount: amountNGN,
      currency: 'NGN',
      ref: `VPMG_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      onClose: () => {
        showError(boostError, 'Payment cancelled.');
        toggleButtonLoading(boostBtn, false, 'Buy Boost', 'Processing...');
      },
      callback: async (response) => {
        try {
          const now = Date.now();
          currentUser.miningRate = boost.miningRate;
          currentUser.boostExpiry = currentUser.boostExpiry > now ?
            currentUser.boostExpiry + BOOST_DURATION : now + BOOST_DURATION;
          const updateResponse = await fetch(`${API_URL}/${currentUser.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentUser)
          });
          if (!updateResponse.ok) throw new Error('Failed to apply boost');
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
          updatePointsAndTimer();
          updateBoostStatus();
          showSuccess(boostSuccess, `Purchased ${boost.name}! Mining at ${boost.miningRate} points/12h.`);
          toggleButtonLoading(boostBtn, false, 'Buy Boost', 'Processing...');
          boostForm.reset();
        } catch (error) {
          console.error('Boost error:', error);
          showError(boostError, 'Error applying boost. Try again.');
          toggleButtonLoading(boostBtn, false, 'Buy Boost', 'Processing...');
          localStorage.setItem('pendingBoosts', JSON.stringify({
            email: currentUser.email,
            boostType: type,
            timestamp: Date.now()
          }));
        }
      }
    });
    handler.openIframe();
  } catch (error) {
    console.error('Payment init error:', error);
    showError(boostError, 'Error initiating payment. Try again.');
    toggleButtonLoading(boostBtn, false, 'Buy Boost', 'Processing...');
  }
});

// Sync Pending Boosts
async function syncPendingBoosts() {
  const pending = JSON.parse(localStorage.getItem('pendingBoosts'));
  if (!pending || !currentUser || pending.email !== currentUser.email) return;

  try {
    const boost = BOOST_TIERS[pending.boostType];
    const now = Date.now();
    currentUser.miningRate = boost.miningRate;
    currentUser.boostExpiry = currentUser.boostExpiry > now ?
      currentUser.boostExpiry + BOOST_DURATION : now + BOOST_DURATION;
    const response = await fetch(`${API_URL}/${currentUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentUser)
    });
    if (response.ok) {
      localStorage.removeItem('pendingBoosts');
      updatePointsAndTimer();
      updateBoostStatus();
      showSuccess(boostSuccess, `Synced ${boost.name}!`);
    }
  } catch (error) {
    console.error('Sync boost error:', error);
  }
}

// Update Boost Status
function updateBoostStatus() {
  const now = Date.now();
  if (!currentUser || !currentUser.boostExpiry || currentUser.boostExpiry <= now) {
    currentUser.miningRate = BASE_MINING_RATE;
    currentUser.boostExpiry = 0;
    boostStatus.textContent = 'No active boost.';
    return;
  }
  const expiryDate = new Date(currentUser.boostExpiry).toLocaleString();
  boostStatus.textContent = `Active: ${currentUser.miningRate} points/12h (expires ${expiryDate})`;
}

// Notify Admin of Large Redemption
async function notifyAdminOfRedemption(email, points, amountNGN, bankName, accountNumber, accountName) {
  const notification = {
    to: ADMIN_EMAIL,
    subject: 'Large Redemption Request',
    body: `
      User Redemption Notification
      User Email: ${email}
      Points to Redeem: ${points}
      Amount (NGN): ₦${amountNGN}
      Bank Name: ${bankName}
      Account Number: ${accountNumber}
      Account Name: ${accountName}
      Timestamp: ${new Date().toLocaleString()}
    `,
    timestamp: Date.now()
  };

  try {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify(notification)
    });
    if (!response.ok) throw new Error('Failed to send email');
    console.log('Email sent:', notification);
  } catch (error) {
    console.error('Email error:', error);
    // Fallback to localStorage
    const notifications = JSON.parse(localStorage.getItem('adminNotifications')) || [];
    notifications.push(notification);
    localStorage.setItem('adminNotifications', JSON.stringify(notifications));
  }
}

// Redeem Points Handler
redeemForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors(redeemPointsError, bankNameError, accountNumberError, accountNameError, redeemError, redeemSuccess);
  toggleButtonLoading(redeemBtn, true, 'Redeem', 'Processing...');

  if (!currentUser) {
    showError(redeemError, 'Please log in to redeem.');
    toggleButtonLoading(redeemBtn, false, 'Redeem', 'Processing...');
    return;
  }

  const points = parseInt(redeemPoints.value.trim());
  const bank = bankName.value.trim();
  const accountNum = accountNumber.value.trim();
  const accName = accountName.value.trim();

  if (!points) {
    showError(redeemPointsError, 'Points are required');
    toggleButtonLoading(redeemBtn, false, 'Redeem', 'Processing...');
    return;
  }
  if (!validatePoints(points)) {
    showError(redeemPointsError, 'Points must be at least 100 and a multiple of 100');
    toggleButtonLoading(redeemBtn, false, 'Redeem', 'Processing...');
    return;
  }
  if (points > currentUser.points) {
    showError(redeemPointsError, 'Insufficient points');
    toggleButtonLoading(redeemBtn, false, 'Redeem', 'Processing...');
    return;
  }
  if (points >= MIN_REDEEM_POINTS_THRESHOLD) {
    const amountNGN = (points / 100) * NGN_PER_100_POINTS;
    await notifyAdminOfRedemption(currentUser.email, points, amountNGN, bank, accountNum, accName);
    showSuccess(redeemSuccess, 'Admin notified for large redemption request.');
  }
  if (!bank) {
    showError(bankNameError, 'Bank name is required');
    toggleButtonLoading(redeemBtn, false, 'Redeem', 'Processing...');
    return;
  }
  if (!validateBankName(bank)) {
    showError(bankNameError, 'Please enter a valid bank name');
    toggleButtonLoading(redeemBtn, false, 'Redeem', 'Processing...');
    return;
  }
  if (!accountNum) {
    showError(accountNumberError, 'Account number is required');
    toggleButtonLoading(redeemBtn, false, 'Redeem', 'Processing...');
    return;
  }
  if (!validateAccountNumber(accountNum)) {
    showError(accountNumberError, 'Account number must be 10 digits');
    toggleButtonLoading(redeemBtn, false, 'Redeem', 'Processing...');
    return;
  }
  if (!accName) {
    showError(accountNameError, 'Account name is required');
    toggleButtonLoading(redeemBtn, false, 'Redeem', 'Processing...');
    return;
  }
  if (!validateAccountName(accName)) {
    showError(accountNameError, 'Please enter a valid account name');
    toggleButtonLoading(redeemBtn, false, 'Redeem', 'Processing...');
    return;
  }

  const amountNGN = (points / 100) * NGN_PER_100_POINTS;
  const redemption = {
    points,
    amountNGN,
    bankName: bank,
    accountNumber: accountNum,
    accountName: accName,
    timestamp: new Date().toISOString(),
    status: 'pending'
  };

  try {
    currentUser.points -= points;
    if (!currentUser.redemptions) currentUser.redemptions = [];
    currentUser.redemptions.push(redemption);
    const response = await fetch(`${API_URL}/${currentUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentUser)
    });
    if (!response.ok) throw new Error('Failed to process redemption');
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updatePointsAndTimer();
    updateRedemptionHistory();
    showSuccess(redeemSuccess, `Redemption request for ₦${amountNGN} submitted! Awaiting processing.`);
    toggleButtonLoading(redeemBtn, false, 'Redeem', 'Processing...');
    redeemForm.reset();
    console.log('Redemption details:', redemption);
    alert('Redemption recorded. In production, this would trigger a bank transfer.');
  } catch (error) {
    console.error('Redemption error:', error);
    showError(redeemError, 'Error processing redemption. Try again.');
    toggleButtonLoading(redeemBtn, false, 'Redeem', 'Processing...');
    localStorage.setItem('pendingRedemptions', JSON.stringify({
      email: currentUser.email,
      redemption,
      timestamp: Date.now()
    }));
  }
});

// Sync Pending Redemptions
async function syncPendingRedemptions() {
  const pending = JSON.parse(localStorage.getItem('pendingRedemptions'));
  if (!pending || !currentUser || pending.email !== currentUser.email) return;

  try {
    currentUser.points -= pending.redemption.points;
    if (!currentUser.redemptions) currentUser.redemptions = [];
    currentUser.redemptions.push(pending.redemption);
    const response = await fetch(`${API_URL}/${currentUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentUser)
    });
    if (response.ok) {
      localStorage.removeItem('pendingRedemptions');
      updatePointsAndTimer();
      updateRedemptionHistory();
      showSuccess(redeemSuccess, `Synced redemption for ₦${pending.redemption.amountNGN}!`);
    }
  } catch (error) {
    console.error('Sync redemption error:', error);
  }
}

// Update Redemption History
function updateRedemptionHistory() {
  if (!currentUser || !currentUser.redemptions || currentUser.redemptions.length === 0) {
    redemptionHistory.textContent = 'No redemptions yet.';
    return;
  }
  redemptionHistory.innerHTML = currentUser.redemptions.map(r => `
    <div>₦${r.amountNGN} to ${r.bankName} (${r.accountNumber}) on ${new Date(r.timestamp).toLocaleString()} - ${r.status}</div>
  `).join('');
}

// Purchase Item Handler
async function purchaseItem(itemKey) {
  if (!currentUser) {
    showError(shopError, 'Please log in to purchase.');
    return;
  }

  const item = SHOP_ITEMS[itemKey];
  const button = itemKey === 'neonBadge' ? buyNeonBadge : buyStarAvatar;

  clearErrors(shopError, shopSuccess);
  toggleButtonLoading(button, true, 'Buy', 'Buying...');

  if (currentUser.points < item.cost) {
    showError(shopError, `Insufficient points. Need ${item.cost} points.`);
    toggleButtonLoading(button, false, 'Buy', 'Buying...');
    return;
  }

  if (currentUser.items && currentUser.items.includes(item.name)) {
    showError(shopError, `You already own ${item.name}.`);
    toggleButtonLoading(button, false, 'Buy', 'Buying...');
    return;
  }

  try {
    currentUser.points -= item.cost;
    if (!currentUser.items) currentUser.items = [];
    currentUser.items.push(item.name);
    const response = await fetch(`${API_URL}/${currentUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentUser)
    });
    if (!response.ok) throw new Error('Failed to purchase item');
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updatePointsAndTimer();
    updatePurchasedItems();
    showSuccess(shopSuccess, `Purchased ${item.name} for ${item.cost} points!`);
    toggleButtonLoading(button, false, 'Buy', 'Buying...');
  } catch (error) {
    console.error('Purchase error:', error);
    showError(shopError, 'Error purchasing item. Try again.');
    toggleButtonLoading(button, false, 'Buy', 'Buying...');
    localStorage.setItem('pendingPurchases', JSON.stringify({
      email: currentUser.email,
      item: item.name,
      cost: item.cost,
      timestamp: Date.now()
    }));
  }
}

// Sync Pending Purchases
async function syncPendingPurchases() {
  const pending = JSON.parse(localStorage.getItem('pendingPurchases'));
  if (!pending || !currentUser || pending.email !== currentUser.email) return;

  try {
    currentUser.points -= pending.cost;
    if (!currentUser.items) currentUser.items = [];
    if (!currentUser.items.includes(pending.item)) {
      currentUser.items.push(pending.item);
    }
    const response = await fetch(`${API_URL}/${currentUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentUser)
    });
    if (response.ok) {
      localStorage.removeItem('pendingPurchases');
      updatePointsAndTimer();
      updatePurchasedItems();
      showSuccess(shopSuccess, `Synced purchase: ${pending.item}!`);
    }
  } catch (error) {
    console.error('Sync purchase error:', error);
  }
}

// Update Purchased Items
function updatePurchasedItems() {
  if (!currentUser || !currentUser.items || currentUser.items.length === 0) {
    purchasedItems.textContent = 'No items purchased yet.';
    return;
  }
  purchasedItems.innerHTML = currentUser.items.map(item => `<div>${item}</div>`).join('');
}

// Shop Event Listeners
buyNeonBadge.addEventListener('click', () => purchaseItem('neonBadge'));
buyStarAvatar.addEventListener('click', () => purchaseItem('starAvatar'));

// Transfer Points Handler
transferForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors(transferEmailError, transferPointsError, transferGeneralError, transferSuccess);
  toggleButtonLoading(transferBtn, true, 'Transfer', 'Transferring...');

  const recipientEmail = transferEmail.value.trim();
  const points = parseInt(transferPoints.value.trim());

  if (!recipientEmail) {
    showError(transferEmailError, 'Recipient email is required');
    toggleButtonLoading(transferBtn, false, 'Transfer', 'Transferring...');
    return;
  }
  if (!validateEmail(recipientEmail)) {
    showError(transferEmailError, 'Please enter a valid email');
    toggleButtonLoading(transferBtn, false, 'Transfer', 'Transferring...');
    return;
  }
  if (recipientEmail === currentUser.email) {
    showError(transferEmailError, 'Cannot transfer to yourself');
    toggleButtonLoading(transferBtn, false, 'Transfer', 'Transferring...');
    return;
  }
  if (!points) {
    showError(transferPointsError, 'Points are required');
    toggleButtonLoading(transferBtn, false, 'Transfer', 'Transferring...');
    return;
  }
  if (points <= 0 || !Number.isInteger(points)) {
    showError(transferPointsError, 'Points must be a positive integer');
    toggleButtonLoading(transferBtn, false, 'Transfer', 'Transferring...');
    return;
  }
  if (points > currentUser.points) {
    showError(transferPointsError, 'Insufficient points');
    toggleButtonLoading(transferBtn, false, 'Transfer', 'Transferring...');
    return;
  }

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Network error fetching users');
    const users = await response.json();
    const recipient = users.find(u => u.email === recipientEmail);
    if (!recipient) {
      showError(transferGeneralError, 'Recipient not found');
      toggleButtonLoading(transferBtn, false, 'Transfer', 'Transferring...');
      return;
    }

    currentUser.points -= points;
    const senderResponse = await fetch(`${API_URL}/${currentUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentUser)
    });
    recipient.points += points;
    const recipientResponse = await fetch(`${API_URL}/${recipient.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recipient)
    });
    if (!recipientResponse.ok) throw new Error('Failed to update recipient');

    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    toggleButtonLoading(transferBtn, false, 'Transfer', 'Transferring...');
    updatePointsAndTimer();
    updateLeaderboard();
    showSuccess(transferSuccess, `Transferred ${points} points to ${recipientEmail}!`);
    transferForm.reset();
  } catch (error) {
    console.error('Transfer error:', error);
    showError(transferGeneralError, 'Error transferring points. Try again.');
    toggleButtonLoading(transferBtn, false, 'Transfer', 'Transferring...');
  }
});

// Logout
function logout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  localStorage.removeItem('pendingBoosts');
  localStorage.removeItem('pendingPurchases');
  localStorage.removeItem('pendingRedemptions');
  showLogin();
}

// Mining Status
function getMiningStatus() {
  if (!currentUser || !currentUser.miningStartTime) {
    return { isMining: false, canClaim: false, timeLeft: 0 };
  }
  const now = Date.now();
  const elapsed = now - currentUser.miningStartTime;
  const isMining = elapsed < MINING_DURATION;
  const canClaim = elapsed >= MINING_DURATION;
  const timeLeft = isMining ? MINING_DURATION - elapsed : 0;
  return { isMining, canClaim, timeLeft };
}

// Start Mining
async function startMining() {
  if (!currentUser) {
    alert('Please log in to start mining!');
    return;
  }
  if (getMiningStatus().isMining) {
    alert('Mining is already in progress!');
    return;
  }
  if (getMiningStatus().canClaim) {
    alert('Please claim your mined points first!');
    return;
  }

  currentUser.miningStartTime = Date.now();
  try {
    const response = await fetch(`${API_URL}/${currentUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentUser),
    });
    if (!response.ok) throw new Error('Failed to update mining status');
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updatePointsAndTimer();
    alert('Mining started successfully! Come back in 12 hours to claim points.');
  } catch (error) {
    console.error('Start mining error:', error);
    localStorage.setItem('miningStartTime', currentUser.miningStartTime);
    updatePointsAndTimer();
    showError(loginGeneralError, 'Error starting mining. Using local fallback.');
  }
}

// Claim Points
async function claimPoints() {
  if (!currentUser) {
    alert('Please log in to claim points!');
    return;
  }
  if (!getMiningStatus().canClaim) {
    alert('Mining not complete yet!');
    return;
  }

  const miningRate = currentUser.miningRate || BASE_MINING_RATE;
  currentUser.points += miningRate;
  currentUser.miningStartTime = 0;
  try {
    const response = await fetch(`${API_URL}/${currentUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentUser)
    });
    if (!response.ok) throw new Error('Failed to claim points');
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updatePointsAndTimer();
    updateLeaderboard();
    alert(`Claimed ${miningRate} points! You can start mining again.`);
  } catch (error) {
    console.error('Claim points error:', error);
    localStorage.setItem('points', currentUser.points);
    localStorage.setItem('miningStartTime', currentUser.miningStartTime);
    updatePointsAndTimer();
    showError(loginGeneralError, 'Error claiming points. Using local fallback.');
  }
}

// Update Points and Timer
function updatePointsAndTimer() {
  if (!currentUser) return;
  pointsDisplay.textContent = currentUser.points;
  profilePoints.textContent = currentUser.points;
  const now = Date.now();
  if (currentUser.boostExpiry && currentUser.boostExpiry <= now) {
    currentUser.miningRate = BASE_MINING_RATE;
    currentUser.boostExpiry = 0;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }
  const miningRate = currentUser.miningRate || BASE_MINING_RATE;
  const { isMining, canClaim, timeLeft } = getMiningStatus();

  if (isMining) {
    mineBtn.textContent = 'Mining in Progress';
    mineBtn.disabled = true;
    const hours = Math.floor(timeLeft / (60 * 60 * 1000));
    const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);
    timerDisplay.textContent = `Time left: ${hours}h ${minutes}m ${seconds}s`;
    pendingPoints.textContent = miningRate;
  } else if (canClaim) {
    mineBtn.textContent = 'Claim Reward';
    mineBtn.disabled = false;
    mineBtn.onclick = claimPoints;
    timerDisplay.textContent = 'Ready to claim!';
    pendingPoints.textContent = miningRate;
  } else {
    mineBtn.textContent = 'Start Mining';
    mineBtn.disabled = false;
    mineBtn.onclick = startMining;
    timerDisplay.textContent = 'Ready to mine!';
    pendingPoints.textContent = 0;
  }
}

// Update Leaderboard
async function updateLeaderboard() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch leaderboard');
    const users = await response.json();
    const sortedUsers = users.sort((a, b) => b.points - a.points).slice(0, 5);
    leaderboard.innerHTML = '';
    sortedUsers.forEach((user, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${index + 1}</td><td>${user.email}</td><td>${user.points}</td>`;
      leaderboard.appendChild(row);
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    leaderboard.innerHTML = '<tr><td colspan="3">Error loading leaderboard</td></tr>';
  }
}

// Update timer every second
setInterval(updatePointsAndTimer, 1000);