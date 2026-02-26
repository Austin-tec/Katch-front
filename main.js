// 1. SELECT UI ELEMENTS
const catchBtn = document.getElementById('catch-btn');
const urlInput = document.getElementById('video-url-input');
const previewContainer = document.getElementById('preview-container');

// 2. YOUR LIVE BACKEND URL (RAILWAY)
const BASE_URL = 'https://web-production-bdb55.up.railway.app';

// 3. GET PREVIEW LOGIC
catchBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();

    if (!url) {
        alert("Please paste a link first!");
        return;
    }

    // UI Feedback
    const originalText = catchBtn.innerHTML;
    catchBtn.innerHTML = '<span class="spinner"></span> Catching...';
    catchBtn.disabled = true;

    try {
        // Fetch metadata from Railway
        const response = await fetch(`${BASE_URL}/get_info`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url })
        });

        const data = await response.json();

        if (response.ok) {
            // Show preview card
            previewContainer.style.display = 'block';
            document.getElementById('video-title').innerText = data.title;
            document.getElementById('video-thumb').src = data.thumbnail;
            
            // Setup Video Player
            const player = document.getElementById('video-player');
            player.src = data.video_url;
            player.style.display = 'block';

            // Connect the "Download Now" button
            const confirmBtn = document.getElementById('confirmDownload');
            confirmBtn.onclick = () => executeDownload(url);

            catchBtn.innerHTML = "Found it!";
        } else {
            throw new Error(data.error || "Failed to fetch info");
        }
    } catch (error) {
        console.error("Fetch error:", error);
        alert("Connection Failed. The server might be waking up—please try again in 10 seconds.");
        catchBtn.innerHTML = "Try Again";
    } finally {
        catchBtn.disabled = false;
        setTimeout(() => { catchBtn.innerHTML = originalText; }, 3000);
    }
});

// 4. ACTUAL DOWNLOAD LOGIC (BLOB METHOD)
async function executeDownload(url) {
    const confirmBtn = document.getElementById('confirmDownload');
    const originalBtnText = confirmBtn.innerText;
    
    confirmBtn.innerText = "Downloading...";
    confirmBtn.disabled = true;

    try {
        const response = await fetch(`${BASE_URL}/download`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url })
        });

        if (response.ok) {
            // Receive file as a 'blob' (binary data)
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            
            // Create a temporary link to trigger the save dialog
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = downloadUrl;
            a.download = "katch_video.mp4"; 
            document.body.appendChild(a);
            a.click();
            
            // Clean up
            window.URL.revokeObjectURL(downloadUrl);
            a.remove();

            confirmBtn.style.background = "#10b981"; // Success Green
            confirmBtn.innerText = "Saved!";
        } else {
            const errorData = await response.json();
            alert("Download Error: " + errorData.error);
        }
    } catch (error) {
        alert("Lost connection to the server!");
    } finally {
        confirmBtn.disabled = false;
        setTimeout(() => { 
            confirmBtn.innerText = originalBtnText;
            confirmBtn.style.background = ""; 
        }, 5000);
    }
}
