// Check for token on page load
window.onload = function() {
    debugger

    const token = localStorage.getItem('token');
    if (!token) {
        // If no token is found, redirect to the login page
        window.location.href = '/ECommerceFE/user/login.html';
    }
};

document.addEventListener('DOMContentLoaded', function() {
    // Check for token on page load
    const token = localStorage.getItem('token');
    if (!token) {
        // If no token is found, redirect to the login page
        window.location.href = '/ECommerceFE/user/login.html';
    }

    // Load sidebar
    loadSidebar();

    // Load page content when sidebar links are clicked
    // document.getElementById('sidebar-container').addEventListener('click', function(event) {
    //     if (event.target.closest('a')) {
    //         event.preventDefault(); // Prevent default link behavior
    //         const page = event.target.closest('a').getAttribute('href'); // Get the href of the clicked link
    //         loadPage(page); // Load the page content
    //     }
    // });
});

// Function to load the sidebar
function loadSidebar() {
    if (!document.getElementById('sidebar-container').innerHTML.trim()) {
        setTimeout(() => {
            fetch('/ECommerceFE/admin/sidebar.html')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.text();
                })
                .then(data => {
                    document.getElementById('sidebar-container').innerHTML = data;

                    // Add the event listener for the logout button
                    document.getElementById('logoutButton').addEventListener('click', async function(event) {
                        event.preventDefault();
                        try {
                            // Clear all login information
                            localStorage.removeItem('token');
                            localStorage.removeItem('currentUser'); // Clear user info

                            // Show success notification
                            NotificationSystem.success('Đăng xuất thành công');

                            // Redirect to the login page
                            window.location.href = '/ECommerceFE/user/login.html';
                        } catch (error) {
                            console.error('Error during logout:', error);
                            NotificationSystem.error('Đã xảy ra lỗi khi đăng xuất');
                        }
                    });
                })
                .catch(error => {
                    console.error('Error loading sidebar:', error);
                });
        }, 100);
    }
}

// Function to load page content
function loadPage(page) {
    fetch(page)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            document.querySelector('.main-content').innerHTML = data; // Update main content
        })
        .catch(error => console.error('Error loading page:', error));
}
