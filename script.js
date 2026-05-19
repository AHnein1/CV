// Global variables
let files = JSON.parse(localStorage.getItem('businessFiles')) || [];

// DOM elements
const themeToggle = document.getElementById('themeToggle');
const navMenu = document.getElementById('nav-menu');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelectorAll('.nav-link');
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const documentsGrid = document.getElementById('documentsGrid');
const loader = document.querySelector('.loader');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Hide loader
    setTimeout(() => {
        loader.classList.add('hidden');
    }, 1500);
    
    // Load files
    renderFiles();
    
    // Theme detection
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
});

// Theme toggle
themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    themeToggle.innerHTML = newTheme === 'dark' 
        ? '<i class="fas fa-sun"></i>' 
        : '<i class="fas fa-moon"></i>';
});

// Mobile menu toggle
hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// Smooth scrolling for navigation links
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        const offsetTop = targetSection.offsetTop - 80;
        
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
        
        // Update active link
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    });
});

// File upload functionality
uploadZone.addEventListener('click', () => {
    fileInput.click();
});

uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
});

uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover');
});

uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
});

fileInput.addEventListener('change', (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
});

function handleFiles(newFiles) {
    newFiles.forEach(file => {
        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert(`File ${file.name} is too large. Maximum size is 10MB.`);
            return;
        }
        
        // Create file preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const fileData = {
                id: Date.now() + Math.random(),
                name: file.name,
                size: formatFileSize(file.size),
                type: getFileType(file.name),
                data: e.target.result,
                date: new Date().toLocaleDateString()
            };
            
            files.unshift(fileData);
            saveFiles();
            renderFiles();
        };
        reader.readAsDataURL(file);
    });
    fileInput.value = '';
}

function getFileType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'doc';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'image';
    return 'file';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function renderFiles() {
    documentsGrid.innerHTML = '';
    
    if (files.length === 0) {
        documentsGrid.innerHTML = `
            <div class="document-card empty-state">
                <i class="fas fa-folder-open" style="font-size: 4rem; color: var(--text-secondary); margin-bottom: 1rem;"></i>
                <h3>No documents yet</h3>
                <p>Upload your CVs, certifications, and achievements to get started</p>
            </div>
        `;
        return;
    }
    
    files.forEach((file, index) => {
        const fileCard = document.createElement('div');
        fileCard.className = 'document-card';
        fileCard.innerHTML = `
            <div class="document-icon ${file.type}">
                <i class="fas ${getFileIcon(file.type)}"></i>
            </div>
            <div class="document-info">
                <h4 title="${file.name}">${file.name.length > 25 ? file.name.substring(0, 25) + '...' : file.name}</h4>
                <div class="document-meta">
                    <span class="document-size">${file.size}</span>
                    <span class="document-date">${file.date}</span>
                </div>
                ${file.type === 'pdf' || file.type === 'doc' ? 
                    `<a href="${file.data}" download="${file.name}" class="btn btn-primary" style="margin-top: 1rem; width: 100%; justify-content: center;">
                        <i class="fas fa-download"></i> Download
                    </a>` : 
                    `<img src="${file.data}" style="max-width: 100%; max-height: 200px; border-radius: 8px; margin-top: 1rem;" alt="${file.name}" />`
                }
                <button class="delete-btn" onclick="deleteFile(${file.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        documentsGrid.appendChild(fileCard);
    });
}

function getFileIcon(type) {
    const icons = {
        pdf: 'fa-file-pdf',
        doc: 'fa-file-word',
        image: 'fa-file-image',
        file: 'fa-file'
    };
    return icons[type] || icons.file;
}

function deleteFile(fileId) {
    if (confirm('Are you sure you want to delete this file?')) {
        files = files.filter(file => file.id !== fileId);
        saveFiles();
        renderFiles();
    }
}

function saveFiles() {
    localStorage.setItem('businessFiles', JSON.stringify(files));
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
    
    // Update active nav link based on scroll position
    let current = '';
    const sections = document.querySelectorAll('section');
    const scrollPos = window.scrollY + 200;
    
    sections.forEach(section => {
        if (scrollPos >= section.offsetTop) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Add intersection observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.skill-item, .timeline-item, .document-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
});
// Photo Gallery Modal Functions
function openModal(imageSrc, title, date) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalDate = document.getElementById('modalDate');
    const downloadLink = document.getElementById('downloadLink');
    
    modalImg.src = imageSrc;
    modalTitle.textContent = title;
    modalDate.textContent = date;
    downloadLink.href = imageSrc;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('imageModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
document.getElementById('imageModal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});

// Close with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
});