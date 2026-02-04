const VIDEO_API = 'https://script.google.com/macros/s/AKfycbwu3vj84TxyHcgc07pCO6lOTqnSLfbE8omfb42VkbAjpvU1URgxwpk0iz0LgagxuAu1NA/exec';
const PROJECT_API = 'https://script.google.com/macros/s/AKfycbwu3vj84TxyHcgc07pCO6lOTqnSLfbE8omfb42VkbAjpvU1URgxwpk0iz0LgagxuAu1NA/exec';

/**
 * 格式化說明文字，處理換行
 */
function formatDesc(text) {
    if (!text) return '無相關說明';
    return String(text).replace(/\r\n|\n/g, '<br>');
}

/**
 * 渲染卡片 HTML
 */
function renderCard(item) {
    const desc = formatDesc(item['說明']);
    const title = item['標題'] || item['名稱'] || '未命名項目';
    
    return `
        <div class="content-card">
            <div>
                <h3 class="card-title">${title}</h3>
                <p class="card-desc">${desc}</p>
            </div>
            <a href="${item['連結']}" target="_blank" rel="noopener noreferrer" class="card-btn">
                查看內容 <span>&rarr;</span>
            </a>
        </div>
    `;
}

/**
 * 從指定 API 載入並顯示內容
 */
async function loadContent(api, containerId, categoryKey) {
    const container = document.getElementById(containerId);
    try {
        const response = await fetch(api);
        if (!response.ok) throw new Error('API 響應失敗');
        
        const json = await response.json();
        
        let dataArray = [];
        if (json.status === 'success' && json.data) {
            if (Array.isArray(json.data)) {
                dataArray = json.data;
            } else if (typeof json.data === 'object') {
                dataArray = json.data[categoryKey] || [];
            }
        } else if (Array.isArray(json)) {
            dataArray = json;
        }
        
        // 過濾出標記為顯示的項目
        const displayData = dataArray.filter(i => 
            i['是否顯示'] === true || 
            i['是否顯示'] === 'true' || 
            i['是否顯示'] === 1 || 
            i['是否顯示'] === 'TRUE'
        );
        
        if (displayData.length === 0) {
            container.innerHTML = '<div class="loader">目前尚無公開內容。</div>';
            return;
        }

        container.innerHTML = displayData.map(i => renderCard(i)).join('');
        
    } catch (error) {
        console.error('載入失敗:', error);
        container.innerHTML = '<div class="loader" style="color: #ff4d4d;">載入失敗 (請檢查 API 或資料內容)</div>';
    }
}

// 當視窗載入完成後開始抓取資料
window.onload = () => {
    window.scrollTo(0, 0); // 確保頁面從頂部開始
    loadContent(VIDEO_API, 'video-list', '影片');
    loadContent(PROJECT_API, 'project-list', '專案');
};