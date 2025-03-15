const API_CONFIG = {
    BASE_URL: 'https://localhost:7175',
    ENDPOINTS: {
        NEWS: '/api/news'
    }
};

async function fetchNews() {
    try {
        const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.NEWS);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const news = await response.json();
        displayNews(news);
    } catch (error) {
        console.error('Error fetching news:', error);
    }
}

function displayNews(news) {
    const newsContainer = document.getElementById('newsTableBody');
    newsContainer.innerHTML = ''; // Clear existing news
    news.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.Title}</td>
            <td>${item.Content}</td>
            <td>${new Date(item.Date).toLocaleDateString()}</td>
            <td>
                <button  class="btn btn-danger" onclick="editNews(${item.Id})">Edit</button>
                <button  class="btn btn-warning" onclick="deleteNews(${item.Id})">Delete</button>
            </td>
        `;
        newsContainer.appendChild(row);
    });
}

// Call fetchNews when the page loads
document.addEventListener('DOMContentLoaded', fetchNews);

document.getElementById('addNewsButton').onclick = function() {
    openNewsModal();
};

function openNewsModal(news = {}) {
    document.getElementById('newsTitle').value = news.title || '';
    document.getElementById('newsContent').value = news.content || '';
    document.getElementById('newsDate').value = news.date ? new Date(news.date).toISOString().split('T')[0] : '';
    // document.getElementById('newsId').value = news.id || '';
    $('#newsModal').modal('show');
}

async function saveNews() {
    const news = {
        Title: document.getElementById('newsTitle').value,
        Content: document.getElementById('newsContent').value,
        Date: new Date(document.getElementById('newsDate').value).toISOString()
    };

    const method = news.Id ? 'PUT' : 'POST';
    const url = news.Id ? `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.NEWS}/${news.Id}` : `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.NEWS}`;

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(news)
        });

        if (response.ok) {
            alert('Bài viết đã được lưu thành công');
            loadNews(); // Reload the news list
            $('#newsModal').modal('hide'); // Hide the modal
        } else {
            const error = await response.text();
            alert('Lỗi khi lưu bài viết: ' + error);
        }
    } catch (error) {
        console.error('Error saving news:', error);
        alert('Đã xảy ra lỗi khi lưu bài viết');
    }
}

async function deleteNews(newsId) {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.NEWS}/${newsId}`, {
        method: 'DELETE'
    });

    if (response.ok) {
        alert('Bài viết đã được xóa thành công');
        loadNews(); // Reload the news list
    } else {
        const error = await response.text();
        alert('Lỗi khi xóa bài viết: ' + error);
    }
}

async function loadNews() {
    try {
        const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.NEWS);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const news = await response.json();
        displayNews(news); // Reuse the displayNews function to show the articles
    } catch (error) {
        console.error('Error loading news:', error);
    }
}

document.getElementById('searchInput').addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    const newsItems = document.querySelectorAll('#newsTableBody tr');

    newsItems.forEach(item => {
        const title = item.querySelector('td:nth-child(2)').textContent.toLowerCase();
        const content = item.querySelector('td:nth-child(7)').textContent.toLowerCase(); // Giả sử nội dung ở cột 7
        if (title.includes(searchTerm) || content.includes(searchTerm)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}); 