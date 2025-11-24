// Data Import Manager Logic

// DOM Elements
const uploadZone = document.getElementById('upload-zone');
const fileInput = document.getElementById('file-input');
const processingSection = document.getElementById('processing-section');
const previewSection = document.getElementById('preview-section');
const actionSection = document.getElementById('action-section');
const errorSection = document.getElementById('error-section');
const confirmationModal = document.getElementById('confirmation-modal');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const githubUrlInput = document.getElementById('github-url-input');
const loadGithubBtn = document.getElementById('load-github-btn');

// State
let currentFile = null;
let processingComplete = false;
let parsedData = [];

// Mobile Menu Toggle
if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

// Convert GitHub blob URL to raw content URL
function convertToRawUrl(githubUrl) {
    if (!githubUrl) return null;

    // Handle different GitHub URL formats
    const blobPattern = /github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)/;
    const rawPattern = /raw\.githubusercontent\.com/;

    if (rawPattern.test(githubUrl)) {
        return githubUrl; // Already a raw URL
    }

    const match = githubUrl.match(blobPattern);
    if (match) {
        const [, user, repo, branch, path] = match;
        return `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${path}`;
    }

    return null;
}

// Load file from GitHub
async function loadFromGithub(url) {
    try {
        const rawUrl = convertToRawUrl(url);
        if (!rawUrl) {
            showError('Invalid GitHub URL. Please use a valid GitHub file URL.');
            return;
        }

        // Show processing
        processingSection.classList.remove('hidden');
        errorSection.classList.add('hidden');

        // Update file info
        const fileName = url.split('/').pop();
        document.getElementById('file-name').textContent = fileName;
        document.getElementById('file-size').textContent = 'Loading...';
        document.getElementById('total-rows').textContent = 'Calculating...';

        const response = await fetch(rawUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.statusText}`);
        }

        const text = await response.text();
        const blob = new Blob([text], { type: 'text/csv' });
        const file = new File([blob], fileName, { type: 'text/csv' });

        currentFile = file;
        startProcessing(file);
    } catch (error) {
        console.error('Error loading from GitHub:', error);
        showError(`Failed to load file from GitHub: ${error.message}`);
    }
}

// Auto-load checkpoint.csv on page load if URL is in localStorage
window.addEventListener('DOMContentLoaded', () => {
    const savedGithubUrl = localStorage.getItem('githubRepoUrl');
    if (savedGithubUrl && githubUrlInput) {
        githubUrlInput.value = savedGithubUrl;
        // Try to auto-load checkpoint.csv
        const checkpointUrl = savedGithubUrl.includes('checkpoint.csv')
            ? savedGithubUrl
            : savedGithubUrl.replace(/\/[^\/]*$/, '/checkpoint.csv');

        // Attempt to load, but don't show error if file doesn't exist
        fetch(convertToRawUrl(checkpointUrl))
            .then(response => {
                if (response.ok) {
                    loadFromGithub(checkpointUrl);
                }
            })
            .catch(() => {
                // Silently fail if checkpoint.csv doesn't exist
            });
    }
});

// GitHub load button handler
if (loadGithubBtn) {
    loadGithubBtn.addEventListener('click', () => {
        const url = githubUrlInput.value.trim();
        if (!url) {
            showError('Please enter a GitHub URL.');
            return;
        }

        // Save URL to localStorage for future visits
        localStorage.setItem('githubRepoUrl', url);
        loadFromGithub(url);
    });
}

// Upload Zone Drag & Drop
if (uploadZone) {
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('drag-over');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('drag-over');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    });

    uploadZone.addEventListener('click', () => {
        fileInput.click();
    });
}

if (fileInput) {
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });
}

// File Upload Handler
function handleFileUpload(file) {
    if (!file.name.endsWith('.csv')) {
        showError('Invalid file format. Please select a CSV file.');
        return;
    }

    currentFile = file;
    startProcessing(file);
}

// Start Processing
function startProcessing(file) {
    // Hide upload zone, show processing
    processingSection.classList.remove('hidden');
    errorSection.classList.add('hidden');

    // Update file info
    document.getElementById('file-name').textContent = file.name;
    document.getElementById('file-size').textContent = (file.size / (1024 * 1024)).toFixed(2) + ' MB';

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target.result;

            // 1. Parsing
            updateProgress('parsing', 0);
            parsedData = parseCSV(text); // Using shared function
            updateProgress('parsing', 100);

            document.getElementById('total-rows').textContent = parsedData.length.toLocaleString();

            // 2. Validation
            updateProgress('validation', 0);
            // Basic validation already done in parseCSV (headers)
            if (parsedData.length === 0) {
                throw new Error("No valid data found in CSV.");
            }
            updateProgress('validation', 100);

            // 3. Import (Saving)
            updateProgress('import', 0);
            // Simulate a short delay for UX
            setTimeout(() => {
                updateProgress('import', 100);
                completeProcessing();
            }, 500);

        } catch (err) {
            showError(err.message);
        }
    };
    reader.readAsText(file);
}

function updateProgress(type, value) {
    const progressBar = document.getElementById(`${type}-progress`);
    const percentage = document.getElementById(`${type}-percentage`);
    if (progressBar && percentage) {
        progressBar.style.width = value + '%';
        percentage.textContent = value + '%';
    }
}

// Complete Processing
function completeProcessing() {
    const statusBadge = document.getElementById('status-badge');
    statusBadge.className = 'status-badge success';
    statusBadge.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        <span>Processing complete</span>
    `;

    // Show Preview
    showPreview(parsedData.slice(0, 10));

    previewSection.classList.remove('hidden');
    actionSection.classList.remove('hidden');
    processingComplete = true;
}

function showPreview(data) {
    const tbody = document.getElementById('preview-table-body');
    tbody.innerHTML = '';

    data.forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="font-mono">${index + 1}</td>
            <td class="font-medium text-text-primary">${row.architecture}</td>
            <td class="font-mono">${row.year}</td>
            <td class="font-mono">${row.publications}</td>
            <td>${row.field_name}</td>
        `;
        tbody.appendChild(tr);
    });

    const validCount = document.getElementById('valid-rows-count');
    if (validCount) validCount.textContent = parsedData.length.toLocaleString();
}

// Show Error
function showError(message) {
    errorSection.classList.remove('hidden');
    processingSection.classList.add('hidden');
    previewSection.classList.add('hidden');
    actionSection.classList.add('hidden');
    document.getElementById('error-message').textContent = message;
}

// Action Buttons
document.getElementById('confirm-import-btn').addEventListener('click', async () => {
    if (processingComplete && parsedData.length > 0) {
        try {
            // Show saving state
            const btn = document.getElementById('confirm-import-btn');
            const originalText = btn.innerHTML;
            btn.innerHTML = 'Saving...';
            btn.disabled = true;

            await saveToIndexedDB(parsedData); // Using shared function
            window.location.href = 'network_visualization.html';
        } catch (e) {
            console.error(e);
            showError("Failed to save data to database. " + e.message);
            const btn = document.getElementById('confirm-import-btn');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
});

document.getElementById('replace-dataset-btn').addEventListener('click', () => {
    showConfirmationModal('Are you sure you want to replace the current dataset? This action cannot be undone.', () => {
        fileInput.click();
    });
});

document.getElementById('cancel-import-btn').addEventListener('click', () => {
    showConfirmationModal('Are you sure you want to cancel the import? The loaded data will be lost.', () => {
        resetUpload();
    });
});

document.getElementById('retry-upload-btn').addEventListener('click', () => {
    resetUpload();
});

// Modal Functions
function showConfirmationModal(message, onConfirm) {
    document.getElementById('modal-message').textContent = message;
    confirmationModal.classList.add('show');

    const confirmBtn = document.getElementById('modal-confirm-btn');
    const cancelBtn = document.getElementById('modal-cancel-btn');

    // Remove old listeners to avoid duplicates
    const newConfirmBtn = confirmBtn.cloneNode(true);
    const newCancelBtn = cancelBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

    newConfirmBtn.addEventListener('click', () => {
        onConfirm();
        hideConfirmationModal();
    });

    newCancelBtn.addEventListener('click', () => {
        hideConfirmationModal();
    });
}

function hideConfirmationModal() {
    confirmationModal.classList.remove('show');
}

// Reset Upload
function resetUpload() {
    processingSection.classList.add('hidden');
    previewSection.classList.add('hidden');
    actionSection.classList.add('hidden');
    errorSection.classList.add('hidden');
    currentFile = null;
    processingComplete = false;
    parsedData = [];
    fileInput.value = '';

    // Reset progress bars
    updateProgress('parsing', 0);
    updateProgress('validation', 0);
    updateProgress('import', 0);

    const statusBadge = document.getElementById('status-badge');
    statusBadge.className = 'status-badge processing';
    statusBadge.innerHTML = `
        <div class="spinner-small"></div>
        <span>Processing...</span>
    `;
}

// Close modal on outside click
confirmationModal.addEventListener('click', (e) => {
    if (e.target === confirmationModal) {
        hideConfirmationModal();
    }
});
