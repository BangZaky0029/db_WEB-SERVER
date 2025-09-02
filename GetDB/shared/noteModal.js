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
                            <input type="text" id="noteTitle" placeholder="Enter note title..." maxlength="100">
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
        const response = await fetch(`http://100.124.58.32:5000/api/notes/${id_input}`);
        
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
         const pinResponse = await fetch('http://100.124.58.32:5000/api/auth/verify-pin', {
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
         const response = await fetch('http://100.124.58.32:5000/api/notes', {
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
        const pinResponse = await fetch('http://100.124.58.32:5000/api/auth/verify-pin', {
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
        const response = await fetch(`http://100.124.58.32:5000/api/notes/${noteId}`, {
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