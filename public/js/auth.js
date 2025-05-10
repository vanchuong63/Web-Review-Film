// Authentication & User Management
document.addEventListener('DOMContentLoaded', function() {
    // Find login form if it exists on the page
    const loginForm = document.querySelector('.login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = loginForm.querySelector('input[type="text"]').value;
            const password = loginForm.querySelector('input[type="password"]').value;
            
            // Simple validation
            if (!username || !password) {
                alert('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu');
                return;
            }
            
            // For demo purposes - simulate login success
            // In a real application, this would make an API call to verify credentials
            console.log('Login attempt:', { username, password });
            
            // Store login status in localStorage
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', username);
            
            // Redirect to homepage after successful login
            window.location.href = '/index.html';
        });
    }
    
    // Check login status
    function checkLoginStatus() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const username = localStorage.getItem('username');
        
        // Update UI based on login status
        const profileText = document.querySelector('.profile-text');
        const dropdownMenu = document.querySelector('.dropdown-menu');
        
        if (profileText && dropdownMenu) {
            if (isLoggedIn && username) {
                // User is logged in
                profileText.textContent = username;
                
                // Update dropdown menu
                dropdownMenu.innerHTML = `
                    <a href="account.html" class="dropdown-item"><i class="fas fa-user"></i> Tài khoản</a>
                    <a href="#" class="dropdown-item"><i class="fas fa-cog"></i> Cài đặt</a>
                    <div class="dropdown-divider"></div>
                    <a href="#" class="dropdown-item logout-btn"><i class="fas fa-sign-out-alt"></i> Đăng xuất</a>
                `;
                
                // Add logout functionality
                const logoutBtn = dropdownMenu.querySelector('.logout-btn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        localStorage.removeItem('isLoggedIn');
                        localStorage.removeItem('username');
                        window.location.reload();
                    });
                }
            } else {
                // User is not logged in
                profileText.textContent = 'Profile';
                
                // Ensure dropdown has login/register options
                if (!dropdownMenu.querySelector('a[href="login.html"]')) {
                    dropdownMenu.innerHTML = `
                        <a href="login.html" class="dropdown-item"><i class="fas fa-sign-in-alt"></i> Đăng nhập</a>
                        <a href="register.html" class="dropdown-item"><i class="fas fa-user-plus"></i> Đăng ký</a>
                        <div class="dropdown-divider"></div>
                        <a href="account.html" class="dropdown-item"><i class="fas fa-user"></i> Tài khoản</a>
                        <a href="#" class="dropdown-item"><i class="fas fa-cog"></i> Cài đặt</a>
                    `;
                }
            }
        }
    }
    
    // Check login status when page loads
    checkLoginStatus();
}); 