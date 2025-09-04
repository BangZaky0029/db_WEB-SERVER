// Note Modal Management System
// This file handles the note modal functionality for all tables

let currentNoteData = {
    id_input: null,
    table_source: null,
    notes: []
};

// Create and show note modal
function openNoteModal(id_input, table_source) {
    currentNoteData.id_input = id_input;
    currentNoteData.table_source = table_source;
    
    // Create modal if it doesn't exist
    if (!document.getElementById('noteModal')) {
        createNoteModal();
    }
    
    // Load existing notes
    loadNotes(id_input, table_source);
    
    // Show modal
    document.getElementById('noteModal').style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

// Create note modal HTML structure
function createNoteModal() {
    // Add mention styles if not already added
    if (!document.getElementById('mentionStyles')) {
        const link = document.createElement('link');
        link.id = 'mentionStyles';
        link.rel = 'stylesheet';
        // Determine correct path based on current location
        const currentPath = window.location.pathname;
        const cssPath = currentPath.includes('/table_') ? '../shared/mentionStyles.css' : 'shared/mentionStyles.css';
        link.href = cssPath;
        document.head.appendChild(link);
    }
    
    const modalHTML = `
        <div id="noteModal" class="note-modal" style="display: none;">
            <div class="note-modal-content">
                <div class="note-modal-header">
                    <h3><i class="fas fa-sticky-note"></i> Notes Management</h3>
                    <span class="note-modal-close">&times;</span>
                </div>
                
                <div class="note-modal-body">
                    <div class="note-info">
                        <p><strong>ID Input:</strong> <span id="noteModalIdInput">-</span></p>
                        <p><strong>Table Source:</strong> <span id="noteModalTableSource">-</span></p>
                    </div>
                    
                    <div class="note-form">
                        <h4>Add New Note</h4>
                        <div class="form-group">
                            <label for="noteTitle">Title:</label>
                            <div class="mention-input-container">
                                <input type="text" id="noteTitle" placeholder="Enter note title..." maxlength="100">
                                <div id="mentionDropdown" class="mention-dropdown" style="display: none;"></div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="noteContent">Content:</label>
                            <textarea id="noteContent" placeholder="Enter note content..." rows="4" maxlength="500"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="noteCreatedBy">Created By:</label>
                            <select id="noteCreatedBy">
                                <option value="">-- Pilih Nama --</option>
                                <option value="Mba Desi">Mba Desi</option>
                                <option value="Vinka">Vinka</option>
                                <option value="Ikbal">Ikbal</option>
                                <option value="Mas David">Mas David</option>
                                <option value="Untung">Untung</option>
                                <option value="Imam">Imam</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="notePin">PIN:</label>
                            <input type="password" id="notePin" placeholder="Masukkan PIN..." maxlength="4">
                        </div>
                        <button id="addNoteBtn" class="btn btn-primary">
                            <i class="fas fa-plus"></i> Add Note
                        </button>
                    </div>
                    
                    <div class="notes-list">
                        <h4>Existing Notes</h4>
                        <div id="notesContainer">
                            <p class="no-notes">No notes available</p>
                        </div>
                    </div>
                </div>
                
                <div class="note-modal-footer">
                    <button id="closeNoteModalBtn" class="btn btn-secondary">
                        <i class="fas fa-times"></i> Close
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add event listeners
    setupNoteModalEventListeners();
    
    // Setup mention functionality
    setTimeout(() => {
        setupMentionFunctionality();
    }, 100);
}

// Setup event listeners for note modal
function setupNoteModalEventListeners() {
    const modal = document.getElementById('noteModal');
    const closeBtn = document.querySelector('.note-modal-close');
    const closeModalBtn = document.getElementById('closeNoteModalBtn');
    const addNoteBtn = document.getElementById('addNoteBtn');
    
    // Close modal events
    closeBtn.onclick = closeNoteModal;
    closeModalBtn.onclick = closeNoteModal;
    
    // Close modal when clicking outside
    window.onclick = function(event) {
        if (event.target === modal) {
            closeNoteModal();
        }
    };
    
    // Add note event
    addNoteBtn.onclick = addNewNote;
    
    // Enter key to add note
    document.getElementById('noteContent').addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            addNewNote();
        }
    });
}

// Close note modal
function closeNoteModal() {
    document.getElementById('noteModal').style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
    
    // Clear form
    clearNoteForm();
}

// Clear note form
function clearNoteForm() {
    document.getElementById('noteTitle').value = '';
    document.getElementById('noteContent').value = '';
    document.getElementById('noteCreatedBy').value = ''; // Reset dropdown to default
    document.getElementById('notePin').value = '';
}

// Load notes from API
async function loadNotes(id_input, table_source) {
    try {
        // Update modal info
        document.getElementById('noteModalIdInput').textContent = id_input;
        document.getElementById('noteModalTableSource').textContent = table_source;
        
        // Use the new endpoint that gets all notes for the id_input
        const response = await fetch(`http://100.117.80.112:5000/api/notes/${id_input}`);
        
        if (response.ok) {
            const data = await response.json();
            currentNoteData.notes = data.data || [];
            renderNotes();
        } else {
            console.error('Failed to load notes:', response.statusText);
            showNotification('Failed to load notes', 'error');
            currentNoteData.notes = [];
            renderNotes();
        }
    } catch (error) {
        console.error('Error loading notes:', error);
        showNotification('Error loading notes', 'error');
        currentNoteData.notes = [];
        renderNotes();
    }
}

// Render notes in the modal
function renderNotes() {
    const container = document.getElementById('notesContainer');
    
    if (currentNoteData.notes.length === 0) {
        container.innerHTML = '<p class="no-notes">No notes available</p>';
        return;
    }
    
    // Group notes by table_source for better organization
    const groupedNotes = {};
    currentNoteData.notes.forEach(note => {
        if (!groupedNotes[note.table_source]) {
            groupedNotes[note.table_source] = [];
        }
        groupedNotes[note.table_source].push(note);
    });
    
    let notesHTML = '';
    
    // Render notes grouped by table source
    Object.keys(groupedNotes).forEach(tableSource => {
        const tableNotes = groupedNotes[tableSource];
        const tableDisplayName = tableSource.replace('table_', '').toUpperCase();
        
        notesHTML += `
            <div class="table-notes-group">
                <h5 class="table-source-header">
                    <i class="fas fa-table"></i> ${tableDisplayName} 
                    <span class="note-count">(${tableNotes.length})</span>
                </h5>
                <div class="table-notes-list">
        `;
        
        tableNotes.forEach(note => {
            notesHTML += `
                <div class="note-item" data-note-id="${note.id_note}">
                    <div class="note-header">
                        <h6 class="note-title">${escapeHtml(note.note_title)}</h6>
                        <div class="note-actions">
                            <button class="btn btn-sm btn-warning edit-note-btn" data-note-id="${note.id_note}">
                                <i class="fas fa-edit"></i>
                            </button>
                        </div>
                    </div>
                    <div class="note-content">
                        <p>${escapeHtml(note.note_content).replace(/\n/g, '<br>')}</p>
                    </div>
                    <div class="note-meta">
                        <small>
                            <i class="fas fa-user"></i> ${escapeHtml(note.created_by)} | 
                            <i class="fas fa-calendar"></i> ${formatDateTime(note.created_at)}
                            ${note.updated_at ? ` | <i class="fas fa-edit"></i> Updated: ${formatDateTime(note.updated_at)}` : ''}
                        </small>
                    </div>
                </div>
            `;
        });
        
        notesHTML += `
                </div>
            </div>
        `;
    });
    
    container.innerHTML = notesHTML;
    
    // Add event listeners for edit buttons
    container.querySelectorAll('.edit-note-btn').forEach(btn => {
        btn.onclick = () => editNote(btn.getAttribute('data-note-id'));
    });
}

// Mention functionality
const mentionUsers = ['Vinka', 'Desi', 'David', 'Ikbal', 'Imam', 'Untung'];
let currentMentionIndex = -1;
let mentionStartPos = -1;

// Setup mention functionality for title input
function setupMentionFunctionality() {
    const titleInput = document.getElementById('noteTitle');
    const dropdown = document.getElementById('mentionDropdown');
    
    titleInput.addEventListener('input', handleMentionInput);
    titleInput.addEventListener('keydown', handleMentionKeydown);
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.mention-input-container')) {
            dropdown.style.display = 'none';
        }
    });
}

// Handle input for mention detection
function handleMentionInput(e) {
    const input = e.target;
    const value = input.value;
    const cursorPos = input.selectionStart;
    const dropdown = document.getElementById('mentionDropdown');
    
    // Find @ symbol before cursor
    let atPos = -1;
    for (let i = cursorPos - 1; i >= 0; i--) {
        if (value[i] === '@') {
            atPos = i;
            break;
        }
        if (value[i] === ' ') {
            break;
        }
    }
    
    if (atPos !== -1) {
        const searchText = value.substring(atPos + 1, cursorPos).toLowerCase();
        const filteredUsers = mentionUsers.filter(user => 
            user.toLowerCase().includes(searchText)
        );
        
        if (filteredUsers.length > 0) {
            showMentionDropdown(filteredUsers, atPos);
            mentionStartPos = atPos;
        } else {
            dropdown.style.display = 'none';
        }
    } else {
        dropdown.style.display = 'none';
    }
}

// Handle keydown for mention navigation
function handleMentionKeydown(e) {
    const dropdown = document.getElementById('mentionDropdown');
    
    if (dropdown.style.display === 'none') return;
    
    const items = dropdown.querySelectorAll('.mention-item');
    
    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            currentMentionIndex = Math.min(currentMentionIndex + 1, items.length - 1);
            updateMentionSelection(items);
            break;
        case 'ArrowUp':
            e.preventDefault();
            currentMentionIndex = Math.max(currentMentionIndex - 1, 0);
            updateMentionSelection(items);
            break;
        case 'Enter':
        case 'Tab':
            e.preventDefault();
            if (currentMentionIndex >= 0 && items[currentMentionIndex]) {
                selectMention(items[currentMentionIndex].textContent);
            }
            break;
        case 'Escape':
            dropdown.style.display = 'none';
            currentMentionIndex = -1;
            break;
    }
}

// Show mention dropdown
function showMentionDropdown(users, atPos) {
    const dropdown = document.getElementById('mentionDropdown');
    const input = document.getElementById('noteTitle');
    
    dropdown.innerHTML = '';
    currentMentionIndex = -1;
    
    users.forEach((user, index) => {
        const item = document.createElement('div');
        item.className = 'mention-item';
        item.textContent = user;
        item.onclick = () => selectMention(user);
        dropdown.appendChild(item);
    });
    
    // Position dropdown
    const inputRect = input.getBoundingClientRect();
    dropdown.style.display = 'block';
    dropdown.style.top = (inputRect.bottom + window.scrollY) + 'px';
    dropdown.style.left = inputRect.left + 'px';
    dropdown.style.width = inputRect.width + 'px';
}

// Update mention selection highlight
function updateMentionSelection(items) {
    items.forEach((item, index) => {
        item.classList.toggle('selected', index === currentMentionIndex);
    });
}

// Select a mention
function selectMention(userName) {
    const input = document.getElementById('noteTitle');
    const value = input.value;
    const cursorPos = input.selectionStart;
    
    // Find the end of the current mention text
    let endPos = cursorPos;
    while (endPos < value.length && value[endPos] !== ' ') {
        endPos++;
    }
    
    // Replace the mention text
    const newValue = value.substring(0, mentionStartPos) + '@' + userName + value.substring(endPos);
    input.value = newValue;
    
    // Set cursor position after the mention
    const newCursorPos = mentionStartPos + userName.length + 1;
    input.setSelectionRange(newCursorPos, newCursorPos);
    
    // Hide dropdown
    document.getElementById('mentionDropdown').style.display = 'none';
    currentMentionIndex = -1;
    
    // Focus back to input
    input.focus();
}

// Add new note
async function addNewNote() {
    const title = document.getElementById('noteTitle').value.trim();
    const content = document.getElementById('noteContent').value.trim();
    const createdBy = document.getElementById('noteCreatedBy').value.trim();
    const pin = document.getElementById('notePin').value.trim();
    
    // Validation
    if (!title) {
        showNotification('Please enter a note title', 'error');
        return;
    }
    
    if (!content) {
        showNotification('Please enter note content', 'error');
        return;
    }
    
    if (!createdBy) {
        showNotification('Please select your name', 'error');
        return;
    }
    
    if (!pin) {
        showNotification('Please enter your PIN', 'error');
        return;
    }
    
    if (pin.length !== 4) {
         showNotification('PIN must be 4 digits', 'error');
         return;
     }
     
     // Verify PIN first
     try {
         const pinResponse = await fetch('http://100.117.80.112:5000/api/auth/verify-pin', {
             method: 'POST',
             headers: {
                 'Content-Type': 'application/json'
             },
             body: JSON.stringify({
                 user_name: createdBy,
                 pin: pin
             })
         });
         
         const pinResult = await pinResponse.json();
         
         if (!pinResponse.ok || pinResult.status !== 'success') {
             showNotification(pinResult.message || 'Invalid PIN', 'error');
             return;
         }
         
         // PIN verified, proceed with note creation
         showNotification('PIN verified successfully', 'success');
         
     } catch (error) {
         console.error('PIN verification error:', error);
         showNotification('Error verifying PIN', 'error');
         return;
     }
     
     try {
         const response = await fetch('http://100.117.80.112:5000/api/notes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_input: currentNoteData.id_input,
                table_source: currentNoteData.table_source,
                note_title: title,
                note_content: content,
                created_by: createdBy
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Note added successfully', 'success');
            
            // Check if the note title contains a mention (@username)
            if (title.includes('@')) {
                // Extract mentioned users
                const mentionedUsers = [];
                mentionUsers.forEach(user => {
                    if (title.includes('@' + user)) {
                        mentionedUsers.push(user);
                    }
                });
                
                if (mentionedUsers.length > 0) {
                    // Show WhatsApp notification for each mentioned user
                    mentionedUsers.forEach(user => {
                        showWhatsAppNotification(user);
                    });
                }
            }
            
            clearNoteForm();
            // Reload notes
            loadNotes(currentNoteData.id_input, currentNoteData.table_source);
        } else {
            showNotification(data.message || 'Failed to add note', 'error');
        }
    } catch (error) {
        console.error('Error adding note:', error);
        showNotification('Error adding note', 'error');
    }
}

// Edit note
function editNote(noteId) {
    const note = currentNoteData.notes.find(n => n.id_note == noteId);
    if (!note) return;
    
    // Fill form with existing data
    document.getElementById('noteTitle').value = note.note_title;
    document.getElementById('noteContent').value = note.note_content;
    
    // Set dropdown value to match existing created_by
    const createdBySelect = document.getElementById('noteCreatedBy');
    const options = createdBySelect.options;
    let found = false;
    for (let i = 0; i < options.length; i++) {
        if (options[i].value === note.created_by) {
            createdBySelect.selectedIndex = i;
            found = true;
            break;
        }
    }
    // If not found in dropdown, keep it empty (will show validation error)
    if (!found) {
        createdBySelect.selectedIndex = 0;
    }
    
    // Change button to update mode
    const addBtn = document.getElementById('addNoteBtn');
    addBtn.innerHTML = '<i class="fas fa-save"></i> Update Note';
    addBtn.onclick = () => updateNote(noteId);
    
    // Add cancel button
    if (!document.getElementById('cancelEditBtn')) {
        const cancelBtn = document.createElement('button');
        cancelBtn.id = 'cancelEditBtn';
        cancelBtn.className = 'btn btn-secondary';
        cancelBtn.innerHTML = '<i class="fas fa-times"></i> Cancel';
        cancelBtn.onclick = cancelEdit;
        addBtn.parentNode.appendChild(cancelBtn);
    }
}

// Update note
async function updateNote(noteId) {
    const title = document.getElementById('noteTitle').value.trim();
    const content = document.getElementById('noteContent').value.trim();
    const createdBy = document.getElementById('noteCreatedBy').value.trim();
    const pin = document.getElementById('notePin').value.trim();
    
    // Validation
    if (!title) {
        showNotification('Please enter a note title', 'error');
        return;
    }
    
    if (!content) {
        showNotification('Please enter note content', 'error');
        return;
    }
    
    if (!createdBy) {
        showNotification('Select name', 'error');
        return;
    }
    
    if (!pin) {
        showNotification('Add your pin', 'error');
        return;
    }
    
    if (pin.length !== 4) {
        showNotification('PIN must be 4 digits', 'error');
        return;
    }
    
    // Verify PIN first
    try {
        const pinResponse = await fetch('http://100.117.80.112:5000/api/auth/verify-pin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_name: createdBy,
                pin: pin
            })
        });
        
        const pinResult = await pinResponse.json();
        
        if (!pinResponse.ok || pinResult.status !== 'success') {
            showNotification(pinResult.message || 'Invalid PIN', 'error');
            return;
        }
        
        // PIN verified, proceed with note update
         showNotification('PIN verified successfully', 'success');
         
     } catch (error) {
         console.error('PIN verification error:', error);
         showNotification('Error verifying PIN', 'error');
         return;
     }
    
    try {
        const response = await fetch(`http://100.117.80.112:5000/api/notes/${noteId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                note_title: title,
                note_content: content
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Note updated successfully', 'success');
            
            // Check if the note title contains a mention (@username)
            if (title.includes('@')) {
                // Extract mentioned users
                const mentionedUsers = [];
                mentionUsers.forEach(user => {
                    if (title.includes('@' + user)) {
                        mentionedUsers.push(user);
                    }
                });
                
                if (mentionedUsers.length > 0) {
                    // Show WhatsApp notification for each mentioned user
                    mentionedUsers.forEach(user => {
                        showWhatsAppNotification(user);
                    });
                }
            }
            
            cancelEdit();
            // Reload notes
            loadNotes(currentNoteData.id_input, currentNoteData.table_source);
        } else {
            showNotification(data.message || 'Failed to update note', 'error');
        }
    } catch (error) {
        console.error('Error updating note:', error);
        showNotification('Error updating note', 'error');
    }
}

// Cancel edit mode
function cancelEdit() {
    clearNoteForm();
    
    // Reset button to add mode
    const addBtn = document.getElementById('addNoteBtn');
    addBtn.innerHTML = '<i class="fas fa-plus"></i> Add Note';
    addBtn.onclick = addNewNote;
    
    // Remove cancel button
    const cancelBtn = document.getElementById('cancelEditBtn');
    if (cancelBtn) {
        cancelBtn.remove();
    }
}

// Delete note function removed - delete functionality disabled

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotif = document.getElementById('noteNotification');
    if (existingNotif) {
        existingNotif.remove();
    }
    
    const notification = document.createElement('div');
    notification.id = 'noteNotification';
    notification.className = `note-notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        ${message}
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Show WhatsApp notification
function showWhatsAppNotification(userName) {
    // Create WhatsApp notification element
    const waNotification = document.createElement('div');
    waNotification.id = 'waNotification';
    waNotification.className = 'whatsapp-notification';
    waNotification.innerHTML = `
        <div class="whatsapp-icon">
            <i class="fab fa-whatsapp"></i>
        </div>
        <div class="whatsapp-message">
            <span>Pesan Terkirim Ke WA (${userName})</span>
        </div>
    `;
    
    document.body.appendChild(waNotification);
    
    // Add animation class after a small delay
    setTimeout(() => {
        waNotification.classList.add('show');
    }, 10);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        waNotification.classList.remove('show');
        waNotification.classList.add('hide');
        
        // Remove from DOM after animation completes
        setTimeout(() => {
            if (waNotification.parentNode) {
                waNotification.remove();
            }
        }, 500);
    }, 4000);
}

// Enhanced Mention Dropdown Functions
class MentionDropdownEnhancer {
    constructor() {
        this.typingTimer = null;
        this.isTyping = false;
        this.init();
    }
    
    init() {
        // Add event listeners for enhanced effects
        document.addEventListener('DOMContentLoaded', () => {
            this.setupMentionEnhancements();
        });
    }
    
    setupMentionEnhancements() {
        // Setup typing indicator
        const mentionInputs = document.querySelectorAll('.mention-input-container input');
        mentionInputs.forEach(input => {
            input.addEventListener('input', (e) => this.handleTyping(e));
            input.addEventListener('focus', (e) => this.handleFocus(e));
            input.addEventListener('blur', (e) => this.handleBlur(e));
        });
        
        // Setup dropdown enhancements
        this.observeDropdowns();
    }
    
    handleTyping(event) {
        const container = event.target.closest('.mention-input-container');
        if (!container) return;
        
        // Add typing class
        container.classList.add('typing');
        this.isTyping = true;
        
        // Clear existing timer
        if (this.typingTimer) {
            clearTimeout(this.typingTimer);
        }
        
        // Remove typing class after delay
        this.typingTimer = setTimeout(() => {
            container.classList.remove('typing');
            this.isTyping = false;
        }, 1000);
    }
    
    handleFocus(event) {
        const container = event.target.closest('.mention-input-container');
        if (container) {
            container.classList.add('focused');
        }
    }
    
    handleBlur(event) {
        const container = event.target.closest('.mention-input-container');
        if (container) {
            container.classList.remove('focused', 'typing');
        }
    }
    
    observeDropdowns() {
        // Create observer for dropdown appearance
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.classList && node.classList.contains('mention-dropdown')) {
                        this.enhanceDropdown(node);
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    enhanceDropdown(dropdown) {
        // Add floating animation
        setTimeout(() => {
            dropdown.classList.add('floating');
        }, 500);
        
        // Setup ripple effect for items
        const items = dropdown.querySelectorAll('.mention-item');
        items.forEach((item, index) => {
            // Add bounce animation for new items
            setTimeout(() => {
                item.classList.add('new-item');
            }, index * 50);
            
            // Add ripple effect on click
            item.addEventListener('click', (e) => this.createRipple(e, item));
            
            // Remove new-item class after animation
            setTimeout(() => {
                item.classList.remove('new-item');
            }, 500 + (index * 50));
        });
        
        // Add scroll enhancement
        this.enhanceScrolling(dropdown);
    }
    
    createRipple(event, element) {
        // Remove existing ripple
        element.classList.remove('ripple');
        
        // Add ripple class
        setTimeout(() => {
            element.classList.add('ripple');
        }, 10);
        
        // Remove ripple class after animation
        setTimeout(() => {
            element.classList.remove('ripple');
        }, 600);
    }
    
    enhanceScrolling(dropdown) {
        let isScrolling = false;
        
        dropdown.addEventListener('scroll', () => {
            if (!isScrolling) {
                dropdown.classList.add('scrolling');
                isScrolling = true;
            }
            
            // Clear timeout
            clearTimeout(dropdown.scrollTimeout);
            
            // Set timeout to remove scrolling class
            dropdown.scrollTimeout = setTimeout(() => {
                dropdown.classList.remove('scrolling');
                isScrolling = false;
            }, 150);
        });
    }
    
    // Utility methods for different dropdown styles
    setDropdownStyle(dropdown, style) {
        // Remove existing style classes
        dropdown.classList.remove('style-minimal', 'style-glass', 'style-neon', 'gradient-border');
        
        // Add new style
        if (style && style !== 'default') {
            dropdown.classList.add(`style-${style}`);
        }
    }
    
    addGradientBorder(dropdown) {
        dropdown.classList.add('gradient-border');
    }
    
    showDropdownWithEffect(dropdown, effect = 'default') {
        dropdown.style.display = 'block';
        
        switch (effect) {
            case 'bounce':
                dropdown.style.animation = 'dropdownSlideIn 0.35s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                break;
            case 'fade':
                dropdown.style.animation = 'fadeIn 0.3s ease-out';
                break;
            case 'slide':
                dropdown.style.animation = 'dropdownSlideIn 0.25s ease-out';
                break;
            default:
                dropdown.style.animation = 'dropdownSlideIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)';
        }
    }
    
    hideDropdownWithEffect(dropdown, effect = 'default') {
        dropdown.classList.add('closing');
        
        setTimeout(() => {
            dropdown.style.display = 'none';
            dropdown.classList.remove('closing');
        }, 200);
    }
}

// Initialize the enhancer
const mentionEnhancer = new MentionDropdownEnhancer();

// Export for global use
window.MentionDropdownEnhancer = MentionDropdownEnhancer;
window.mentionEnhancer = mentionEnhancer;