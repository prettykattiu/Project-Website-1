function showRegister() {
    document.getElementById('loginBox').classList.add('hidden');
    document.getElementById('registerBox').classList.remove('hidden');
}

function showLogin() {
    document.getElementById('registerBox').classList.add('hidden');
    document.getElementById('loginBox').classList.remove('hidden');
}

// Register function
async function register() {
    const username = document.getElementById('registerUsername').value; // Update to 'registerUsername'
    const firstname = document.getElementById('firstname').value;
    const lastname = document.getElementById('lastname').value;
    const password = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    console.log('Username being sent:', username); // Ensure username is being sent

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, firstname, lastname, password })
        });

        const data = await response.json();
        if (response.status === 201) {
            alert('User registered successfully');
            showLogin();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error(error);
        alert('Error registering user');
    }
}


// Login function
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.status === 200) {
            alert('Login successful');
            window.location.href = '/dashboard'; // Redirect to dashboard
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error(error);
        alert('Error logging in');
    }
}
