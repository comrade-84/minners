const API_URL = 'https://68484c26ec44b9f349406c8c.mockapi.io/mine/users';
const PAYSTACK_PUBLIC_KEY = 'pk_test_4b6f07b034fb6364157ea394e8dbc4af9465b598'; 

let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

const POINTS_PER_CYCLE = 50;
const MINING_DURATION = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
const POINTS_PER_DOLLAR = 100;
const USD_TO_NGN = 1500; // Approx. rate, adjust as needed

// DOM Elements
const loginSection = document.getElementById('loginSection');
const signupSection = document.getElementById('signupSection');
const gameSection = document.getElementById('gameSection');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const rechargeForm = document.getElementById('rechargeForm');
const transferForm = document.getElementById('transferForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const signupEmail = document.getElementById('signupEmail');
const signupPassword = document.getElementById('signupPassword');
const rechargeAmount = document.getElementById('rechargeAmount');
const transferEmail = document.getElementById('transferEmail');
const transferPoints = document.getElementById('transferPoints');
const loginEmailError = document.getElementById('login-email-error');
const loginPasswordError = document.getElementById('login-password-error');
const loginGeneralError = document.getElementById('login-general-error');
const signupEmailError = document.getElementById('signup-email-error');
const signupPasswordError = document.getElementById('signup-password-error');
const signupGeneralError = document.getElementById('signup-general-error');
const signupVerificationSuccess = document.getElementById('signup-verification-success');
const rechargeError = document.getElementById('recharge-error');
const rechargeSuccess = document.getElementById('recharge-success');
const transferEmailError = document.getElementById('transfer-email-error');
const transferPointsError = document.getElementById('transfer-points-error');
const transferSuccess = document.getElementById('transfer-success');
const transferGeneralError = document.getElementById('transfer-general-error');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const rechargeBtn = document.getElementById('rechargeBtn');
const transferBtn = document.getElementById('transferBtn');
const pointsDisplay = document.getElementById('points');
const profilePoints = document.getElementById('profilePoints');
const pendingPoints = document.getElementById('pendingPoints');
const userEmail = document.getElementById('userEmail');
const timerDisplay = document.getElementById('timer');
const mineBtn = document.getElementById('mineBtn');
const leaderboard = document.getElementById('leaderboard');

// Validation Functions
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePassword(password) {
  return password.length >= 6;
}

function validatePoints(points) {
  return points > 0 && Number.isInteger(Number(points));
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
  clearErrors(loginEmailError, loginPasswordError, loginGeneralError, signupEmailError, signupPasswordError, signupGeneralError, signupVerificationSuccess, rechargeError, rechargeSuccess, transferEmailError, transferPointsError, transferGeneralError, transferSuccess);
  loginSection.classList.remove('d-none');
  signupSection.classList.add('d-none');
  gameSection.classList.add('d-none');
}

function showSignup() {
  clearErrors(loginEmailError, loginPasswordError, loginGeneralError, signupEmailError, signupPasswordError, signupGeneralError, signupVerificationSuccess, rechargeError, rechargeSuccess, transferEmailError, transferPointsError, transferGeneralError, transferSuccess);
  signupSection.classList.remove('d-none');
  loginSection.classList.add('d-none');
  gameSection.classList.add('d-none');
}

function showGame() {
  clearErrors(loginEmailError, loginPasswordError, loginGeneralError, signupEmailError, signupPasswordError, signupGeneralError, signupVerificationSuccess, rechargeError, rechargeSuccess, transferEmailError, transferPointsError, transferGeneralError, transferSuccess);
  gameSection.classList.remove('d-none');
  loginSection.classList.add('d-none');
  signupSection.classList.add('d-none');
  updatePointsAndTimer();
  updateLeaderboard();
  if (currentUser) {
    userEmail.textContent = currentUser.email;
    profilePoints.textContent = currentUser.points;
    syncPendingPoints();
  }
  document.querySelector('#profile-tab').click();
}

// Check if user is logged in
if (currentUser) {
  showGame();
}

// Sign-Up Handler (Bypassed NeverBounce)
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
    const newUser = { email, password, points: 0, miningStartTime: 0 };
    const createResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
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
    currentUser = { email, points: 0, miningStartTime: 0 };
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

// Recharge Handler
rechargeForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors(rechargeError, rechargeSuccess);
  toggleButtonLoading(rechargeBtn, true, 'Pay Now', 'Processing...');

  if (!currentUser) {
    showError(rechargeError, 'Please log in to recharge.');
    toggleButtonLoading(rechargeBtn, false, 'Pay Now', 'Processing...');
    return;
  }

  const amountUSD = parseFloat(rechargeAmount.value);
  if (!amountUSD || amountUSD !== 1) {
    showError(rechargeError, 'Amount must be $1.');
    toggleButtonLoading(rechargeBtn, false, 'Pay Now', 'Processing...');
    return;
  }

  const amountNGN = amountUSD * USD_TO_NGN * 100; // Paystack uses kobo
  const email = currentUser.email;

  try {
    const handler = PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: email,
      amount: amountNGN,
      currency: 'NGN',
      ref: `VPMG_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      onClose: () => {
        showError(rechargeError, 'Payment cancelled.');
        toggleButtonLoading(rechargeBtn, false, 'Pay Now', 'Processing...');
      },
      callback: async (response) => {
        try {
          // Verify payment (optional for testing)
          // In production, use server-side verification with sk_test_xxx
          currentUser.points += amountUSD * POINTS_PER_DOLLAR;
          const updateResponse = await fetch(`${API_URL}/${currentUser.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentUser),
          });
          if (!updateResponse.ok) throw new Error('Failed to update points.');
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
          updatePointsAndTimer();
          showSuccess(rechargeSuccess, `Recharged ${amountUSD * POINTS_PER_DOLLAR} points!`);
          toggleButtonLoading(rechargeBtn, false, 'Pay Now', 'Processing...');
          rechargeForm.reset();
        } catch (error) {
          console.error('Recharge error:', error);
          showError(rechargeError, 'Error processing payment. Points not credited.');
          toggleButtonLoading(rechargeBtn, false, 'Pay Now', 'Processing...');
          localStorage.setItem('pendingPoints', JSON.stringify({
            email: currentUser.email,
            points: amountUSD * POINTS_PER_DOLLAR,
            timestamp: Date.now(),
          }));
        }
      },
    });
    handler.openIframe();
  } catch (error) {
    console.error('Payment init error:', error);
    showError(rechargeError, 'Error initiating payment. Try again.');
    toggleButtonLoading(rechargeBtn, false, 'Pay Now', 'Processing...');
  }
});

// Sync Pending Points
async function syncPendingPoints() {
  const pending = JSON.parse(localStorage.getItem('pendingPoints'));
  if (!pending || !currentUser || pending.email !== currentUser.email) return;

  try {
    currentUser.points += pending.points;
    const response = await fetch(`${API_URL}/${currentUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentUser),
    });
    if (response.ok) {
      localStorage.removeItem('pendingPoints');
      updatePointsAndTimer();
      showSuccess(rechargeSuccess, `Synced ${pending.points} pending points!`);
    }
  } catch (error) {
    console.error('Sync error:', error);
  }
}

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
  if (!validatePoints(points)) {
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
      body: JSON.stringify(currentUser),
    });
    if (!senderResponse.ok) throw new Error('Failed to update sender');

    recipient.points += points;
    const recipientResponse = await fetch(`${API_URL}/${recipient.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recipient),
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
  localStorage.removeItem('pendingPoints');
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
    alert('Mining already in progress!');
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
    alert('Mining started! Come back in 12 hours to claim 50 points.');
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

  currentUser.points += POINTS_PER_CYCLE;
  currentUser.miningStartTime = 0;
  try {
    const response = await fetch(`${API_URL}/${currentUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentUser),
    });
    if (!response.ok) throw new Error('Failed to claim points');
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updatePointsAndTimer();
    updateLeaderboard();
    alert(`Claimed ${POINTS_PER_CYCLE} points! You can start mining again.`);
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
  const { isMining, canClaim, timeLeft } = getMiningStatus();

  if (isMining) {
    mineBtn.textContent = 'Mining in Progress';
    mineBtn.disabled = true;
    const hours = Math.floor(timeLeft / (60 * 60 * 1000));
    const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);
    timerDisplay.textContent = `Time left: ${hours}h ${minutes}m ${seconds}s`;
    pendingPoints.textContent = POINTS_PER_CYCLE;
  } else if (canClaim) {
    mineBtn.textContent = 'Claim Points';
    mineBtn.disabled = false;
    mineBtn.onclick = claimPoints;
    timerDisplay.textContent = 'Ready to claim!';
    pendingPoints.textContent = POINTS_PER_CYCLE;
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