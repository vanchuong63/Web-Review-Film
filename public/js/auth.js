// Authentication & User Management
document.addEventListener('DOMContentLoaded', function() {
    // Find login form if it exists on the page
    const loginForm = document.querySelector('.login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = loginForm.querySelector('input[name="username"]').value;
            const password = loginForm.querySelector('input[name="password"]').value;
            const errorMessage = document.getElementById('error-message');
            
            // Ẩn thông báo lỗi cũ (nếu có)
            errorMessage.style.display = 'none';
            
            // Kiểm tra nhập liệu cơ bản
            if (!username || !password) {
                errorMessage.textContent = 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu';
                errorMessage.style.display = 'block';
                return;
            }
            
            try {
                // Gọi API đăng nhập để xác thực với database
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // Đăng nhập thành công
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('username', username);
                    localStorage.setItem('token', data.token); // Lưu token JWT
                    localStorage.setItem('userId', data.user.id); // Lưu ID người dùng
                    
                    // Chuyển hướng về trang chủ
                    window.location.href = '/index.html';
                } else {
                    // Hiển thị thông báo lỗi
                    errorMessage.textContent = data.message || 'Thông tin đăng nhập không chính xác';
                    errorMessage.style.display = 'block';
                }
            } catch (error) {
                console.error('Lỗi đăng nhập:', error);
                errorMessage.textContent = 'Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.';
                errorMessage.style.display = 'block';
            }
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

// Thêm xử lý form đăng ký
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = registerForm.querySelector('input[name="username"]').value;
        const email = registerForm.querySelector('input[name="email"]').value;
        const password = registerForm.querySelector('input[name="password"]').value;
        const confirmPassword = registerForm.querySelector('input[name="confirm_password"]').value;
        
        // Kiểm tra mật khẩu xác nhận
        if (password !== confirmPassword) {
            alert('Mật khẩu xác nhận không khớp');
            return;
        }
        
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert('Đăng ký thành công!');
                window.location.href = '/login.html';
            } else {
                alert(data.message || 'Đăng ký thất bại');
            }
        } catch (error) {
            console.error('Lỗi:', error);
            alert('Đã có lỗi xảy ra khi đăng ký');
        }
    });
}