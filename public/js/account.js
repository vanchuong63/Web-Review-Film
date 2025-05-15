document.addEventListener('DOMContentLoaded', function() {
    const profileForm = document.getElementById('profileForm');
    const editButton = document.querySelector('.edit-button');
    const saveButton = document.querySelector('.save-button');
    const inputs = profileForm.querySelectorAll('input');
    const imageUpload = document.getElementById('imageUpload');
    const profileImage = document.getElementById('profileImage');

    // Disable tất cả input ban đầu
    inputs.forEach(input => input.disabled = true);

    // Xử lý nút chỉnh sửa
    editButton.addEventListener('click', function() {
        inputs.forEach(input => input.disabled = false);
        editButton.style.display = 'none';
        saveButton.style.display = 'block';
    });

    // Xử lý upload ảnh
    imageUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                profileImage.src = e.target.result;
            }
            reader.readAsDataURL(file);
        }
    });

    // Xử lý lưu thông tin
    profileForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            const formData = new FormData(profileForm);
            const response = await fetch('/api/auth/update-profile', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                alert('Cập nhật thông tin thành công!');
                inputs.forEach(input => input.disabled = true);
                editButton.style.display = 'block';
                saveButton.style.display = 'none';
            } else {
                throw new Error('Lỗi cập nhật thông tin');
            }
        } catch (error) {
            alert('Có lỗi xảy ra: ' + error.message);
        }
    });
});