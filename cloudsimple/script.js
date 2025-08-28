// Global state
let currentUser = null;
let documents = [];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    // Check if user is logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showDashboard();
        loadUserDocuments();
    } else {
        showLandingPage();
    }
}

function setupEventListeners() {
    // Auth forms
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('signupForm').addEventListener('submit', handleSignup);
    document.getElementById('uploadForm').addEventListener('submit', handleUpload);
    
    // Search functionality
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    
    // Upload area drag and drop
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    fileInput.addEventListener('change', handleFileSelect);
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.classList.remove('active');
        }
    });
}

// Page Navigation
function showLandingPage() {
    document.getElementById('landingPage').classList.add('active');
    document.getElementById('dashboard').classList.remove('active');
}

function showDashboard() {
    document.getElementById('landingPage').classList.remove('active');
    document.getElementById('dashboard').classList.add('active');
    
    if (currentUser) {
        document.getElementById('userName').textContent = `Welcome, ${currentUser.name}!`;
        updateDashboardStats();
    }
}

// Modal Management
function showLogin() {
    document.getElementById('loginModal').classList.add('active');
}

function showSignup() {
    document.getElementById('signupModal').classList.add('active');
}

function showUploadModal() {
    document.getElementById('uploadModal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function switchToSignup() {
    closeModal('loginModal');
    showSignup();
}

function switchToLogin() {
    closeModal('signupModal');
    showLogin();
}

// Authentication
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        closeModal('loginModal');
        showDashboard();
        loadUserDocuments();
        showNotification('Welcome back!', 'success');
    } else {
        showNotification('Invalid email or password', 'error');
    }
}

function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    // Get existing users
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
        showNotification('User already exists with this email', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    closeModal('signupModal');
    showDashboard();
    showNotification('Account created successfully!', 'success');
}

function logout() {
    currentUser = null;
    documents = [];
    localStorage.removeItem('currentUser');
    showLandingPage();
    showNotification('Logged out successfully', 'success');
}

// File Upload
function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    displaySelectedFiles(files);
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    const files = Array.from(e.dataTransfer.files);
    document.getElementById('fileInput').files = e.dataTransfer.files;
    displaySelectedFiles(files);
}

function displaySelectedFiles(files) {
    const uploadArea = document.getElementById('uploadArea');
    if (files.length > 0) {
        uploadArea.innerHTML = `
            <i class="fas fa-file-alt"></i>
            <h3>${files.length} file(s) selected</h3>
            <p>${files.map(f => f.name).join(', ')}</p>
        `;
    }
}

function handleUpload(e) {
    e.preventDefault();
    
    const fileInput = document.getElementById('fileInput');
    const title = document.getElementById('documentTitle').value;
    const category = document.getElementById('documentCategory').value;
    
    if (!fileInput.files.length) {
        showNotification('Please select a file to upload', 'error');
        return;
    }
    
    const file = fileInput.files[0];
    
    // Create document object
    const document = {
        id: Date.now().toString(),
        title: title || file.name,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        category: category,
        uploadDate: new Date().toISOString(),
        userId: currentUser.id
    };
    
    // Store file as base64 (for demo purposes)
    const reader = new FileReader();
    reader.onload = function(e) {
        document.fileData = e.target.result;
        saveDocument(document);
    };
    reader.readAsDataURL(file);
}

function saveDocument(document) {
    // Get existing documents
    const allDocuments = JSON.parse(localStorage.getItem('documents') || '[]');
    allDocuments.push(document);
    localStorage.setItem('documents', JSON.stringify(allDocuments));
    
    // Add to current user's documents
    documents.push(document);
    
    // Reset form and close modal
    document.getElementById('uploadForm').reset();
    document.getElementById('uploadArea').innerHTML = `
        <i class="fas fa-cloud-upload-alt"></i>
        <h3>Drag & Drop your files here</h3>
        <p>or click to browse</p>
    `;
    closeModal('uploadModal');
    
    // Refresh dashboard
    renderDocuments();
    updateDashboardStats();
    showNotification('Document uploaded successfully!', 'success');
}

// Document Management
function loadUserDocuments() {
    const allDocuments = JSON.parse(localStorage.getItem('documents') || '[]');
    documents = allDocuments.filter(doc => doc.userId === currentUser.id);
    renderDocuments();
    updateDashboardStats();
}

function renderDocuments(filteredDocs = null) {
    const documentsList = document.getElementById('documentsList');
    const docsToRender = filteredDocs || documents;
    
    if (docsToRender.length === 0) {
        documentsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <h3>No documents found</h3>
                <p>Upload your first document to get started</p>
            </div>
        `;
        return;
    }
    
    documentsList.innerHTML = docsToRender.map(doc => `
        <div class="document-card" onclick="downloadDocument('${doc.id}')">
            <div class="doc-icon">
                <i class="fas ${getFileIcon(doc.fileType)}"></i>
            </div>
            <h3>${doc.title}</h3>
            <div class="doc-meta">
                <span class="doc-category">${doc.category}</span>
                <span>${formatFileSize(doc.fileSize)}</span>
            </div>
            <div class="doc-meta">
                <span>${formatDate(doc.uploadDate)}</span>
                <button class="btn btn-outline" onclick="event.stopPropagation(); deleteDocument('${doc.id}')" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function updateDashboardStats() {
    const totalDocs = documents.length;
    const pdfCount = documents.filter(doc => doc.fileType === 'application/pdf').length;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentCount = documents.filter(doc => new Date(doc.uploadDate) > weekAgo).length;
    
    document.getElementById('totalDocs').textContent = totalDocs;
    document.getElementById('pdfCount').textContent = pdfCount;
    document.getElementById('recentCount').textContent = recentCount;
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filteredDocs = documents.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm) ||
        doc.category.toLowerCase().includes(searchTerm) ||
        doc.fileName.toLowerCase().includes(searchTerm)
    );
    renderDocuments(filteredDocs);
}

function downloadDocument(docId) {
    const document = documents.find(doc => doc.id === docId);
    if (!document) return;
    
    // Create download link
    const link = document.createElement('a');
    link.href = document.fileData;
    link.download = document.fileName;
    link.click();
    
    showNotification('Document downloaded!', 'success');
}

function deleteDocument(docId) {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    // Remove from local documents array
    documents = documents.filter(doc => doc.id !== docId);
    
    // Remove from localStorage
    const allDocuments = JSON.parse(localStorage.getItem('documents') || '[]');
    const updatedDocuments = allDocuments.filter(doc => doc.id !== docId);
    localStorage.setItem('documents', JSON.stringify(updatedDocuments));
    
    // Refresh display
    renderDocuments();
    updateDashboardStats();
    showNotification('Document deleted successfully', 'success');
}

// Utility Functions
function getFileIcon(fileType) {
    if (fileType.includes('pdf')) return 'fa-file-pdf';
    if (fileType.includes('word')) return 'fa-file-word';
    if (fileType.includes('image')) return 'fa-file-image';
    if (fileType.includes('text')) return 'fa-file-alt';
    return 'fa-file';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 3000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);