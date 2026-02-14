/* ============================================
   REGISTRATION FORMS - JAVASCRIPT
   Handles form modals, validation, and submission
   ============================================ */

// ============================================
// MODAL MANAGEMENT
// ============================================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';

        // Reset form if exists
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
            hideSuccess(modalId);
        }
    }
}

// Close modal on overlay click
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('modal-overlay')) {
        closeModal(e.target.id);
    }
});

// Close modal on ESC key
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(modal => {
            closeModal(modal.id);
        });
    }
});

// ============================================
// FORM VALIDATION
// ============================================

function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;

    let isValid = true;
    const requiredInputs = form.querySelectorAll('[required]');

    requiredInputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.style.borderColor = 'var(--zerox-accent)';
        } else {
            input.style.borderColor = 'rgba(255, 215, 0, 0.2)';
        }
    });

    // Email validation
    const emailInput = form.querySelector('input[type="email"]');
    if (emailInput && emailInput.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value)) {
            isValid = false;
            emailInput.style.borderColor = 'var(--zerox-accent)';
        }
    }

    // Phone validation (Indian format)
    const phoneInput = form.querySelector('input[type="tel"]');
    if (phoneInput && phoneInput.value) {
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(phoneInput.value.replace(/\s/g, ''))) {
            isValid = false;
            phoneInput.style.borderColor = 'var(--zerox-accent)';
        }
    }

    return isValid;
}

// ============================================
// FORM SUBMISSION
// ============================================

// Initialize form submission handlers
document.addEventListener('DOMContentLoaded', function () {
    // Selection Round Form
    const selectionForm = document.getElementById('selectionForm');
    if (selectionForm) {
        selectionForm.addEventListener('submit', handleSelectionSubmit);
    }

    // Spectator Form
    const spectatorForm = document.getElementById('spectatorForm');
    if (spectatorForm) {
        spectatorForm.addEventListener('submit', handleSpectatorSubmit);
    }

    // VIP Form
    const vipForm = document.getElementById('vipForm');
    if (vipForm) {
        vipForm.addEventListener('submit', handleVIPSubmit);
    }
});

async function handleSelectionSubmit(e) {
    e.preventDefault();

    if (!validateForm('selectionForm')) {
        alert('Please fill all required fields correctly.');
        return;
    }

    const formData = new FormData(e.target);
    const submitButton = e.target.querySelector('button[type="submit"]');

    // Disable button during submission
    submitButton.disabled = true;
    submitButton.innerHTML = '<i data-lucide="loader" width="18" class="spinning"></i> Processing...';

    try {
        // Formspree integration for static GitHub Pages hosting
        const response = await fetch('https://formspree.io/f/xgolkazo', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            showSuccess('selectionModal');
        } else {
            throw new Error('Submission failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Registration failed. Please try again or contact support.');
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = '<i data-lucide="check" width="18"></i> Submit Registration - ₹299';
        lucide.createIcons();
    }
}

async function handleSpectatorSubmit(e) {
    e.preventDefault();

    if (!validateForm('spectatorForm')) {
        alert('Please fill all required fields correctly.');
        return;
    }

    const formData = new FormData(e.target);
    const submitButton = e.target.querySelector('button[type="submit"]');

    submitButton.disabled = true;
    submitButton.innerHTML = '<i data-lucide="loader" width="18" class="spinning"></i> Processing...';

    try {
        const response = await fetch('https://formspree.io/f/mbdaogkz', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            showSuccess('spectatorModal');
        } else {
            throw new Error('Submission failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Ticket purchase failed. Please try again or contact support.');
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = '<i data-lucide="ticket" width="18"></i> Purchase Ticket - ₹99';
        lucide.createIcons();
    }
}

async function handleVIPSubmit(e) {
    e.preventDefault();

    if (!validateForm('vipForm')) {
        alert('Please fill all required fields correctly.');
        return;
    }

    const formData = new FormData(e.target);
    const submitButton = e.target.querySelector('button[type="submit"]');

    submitButton.disabled = true;
    submitButton.innerHTML = '<i data-lucide="loader" width="18" class="spinning"></i> Processing...';

    try {
        const response = await fetch('https://formspree.io/f/mgolkalo', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            showSuccess('vipModal');
        } else {
            throw new Error('Submission failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('VIP Pass purchase failed. Please try again or contact support.');
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = '<i data-lucide="crown" width="18"></i> Purchase VIP Pass - ₹1,099';
        lucide.createIcons();
    }
}

// ============================================
// SUCCESS HANDLING
// ============================================

function showSuccess(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const formContainer = modal.querySelector('.modal-body > form');
    const successMessage = modal.querySelector('.success-message');

    if (formContainer && successMessage) {
        formContainer.style.display = 'none';
        successMessage.classList.add('active');

        // Re-initialize icons
        lucide.createIcons();
    }
}

function hideSuccess(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const formContainer = modal.querySelector('.modal-body > form');
    const successMessage = modal.querySelector('.success-message');

    if (formContainer && successMessage) {
        formContainer.style.display = 'flex';
        successMessage.classList.remove('active');
    }
}

// ============================================
// UTILITY: Add spinning animation
// ============================================

const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    .spinning {
        animation: spin 1s linear infinite;
    }
`;
document.head.appendChild(style);

console.log('Registration Forms - Initialized');
