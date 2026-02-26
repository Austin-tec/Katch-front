// Select UI elements
const catchBtn = document.querySelector('.btn-main');
const urlInput = document.querySelector('input');
const previewContainer = document.getElementById('preview-container');

// YOUR LIVE RAILWAY BACKEND URL
const BASE_URL = 'https://web-production-bdb55.up.railway.app';

// 1. PRIMARY ACTION: Get Preview
catchBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();

    if (!url) {
        alert("Please paste a link first!");
        return;
    }

    // Update button state
    const originalText = catchBtn.innerHTML;
    catchBtn.innerHTML = 'Catching...';
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
            // Show preview area
            previewContainer.style.display = 'block';
            document.getElementById('video-title').innerText = data.title;
            document.getElementById('video-thumb').src = data.thumbnail;
            
            // Setup the Video Player
            const player = document.getElementById('video-player');
            player.src = data.video_url;
            player.style.display = 'block';

            // Configure the "Confirm" button
            const confirmBtn = document.getElementById('confirmDownload');
            confirmBtn.onclick = () => executeDownload(url);

            catchBtn.innerHTML = "Found it!";
        } else {
            throw new Error(data.error || "Failed to fetch info");
        }
    } catch (error) {
        console.error("Fetch error:", error);
        alert("Connection Failed. The server might be starting up—please try again in 10 seconds.");
        catchBtn.innerHTML = "Try Again";
    } finally {
        catchBtn.disabled = false;
        setTimeout(() => { catchBtn.innerHTML = originalText; }, 3000);
    }
});

// 2. SECONDARY ACTION: Execute Cloud Download
async function executeDownload(url) {
    const confirmBtn = document.getElementById('confirmDownload');
    const originalBtnText = confirmBtn.innerText;
    
    confirmBtn.innerText = "Downloading to browser...";
    confirmBtn.disabled = true;

    try {
        const response = await fetch(`${BASE_URL}/download`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url })
        });

        if (response.ok) {
            // This part is crucial for Cloud hosting:
            // We receive the file as a 'blob' (binary data)
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            
            // Create a temporary link to trigger the save dialog
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = "katch_video.mp4"; 
            document.body.appendChild(a);
            a.click();
            a.remove();

            confirmBtn.style.background = "green";
            confirmBtn.innerText = "Download Started!";
            urlInput.value = ""; 
        } else {
            const errorData = await response.json();
            alert("Download Error: " + errorData.error);
            confirmBtn.innerText = "Retry Download";
        }
    } catch (error) {
        alert("Lost connection to the server!");
        confirmBtn.innerText = "Error";
    } finally {
        confirmBtn.disabled = false;
        setTimeout(() => { 
            confirmBtn.innerText = originalBtnText;
            confirmBtn.style.background = ""; 
        }, 5000);
    }
}
