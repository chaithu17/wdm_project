/**
 * Document Service
 * Handles document upload, download, and management
 * Uses IndexedDB for file storage and localStorage for metadata
 */

class DocumentService {
  constructor() {
    this.storageKey = 'peer_tutoring_documents';
    this.documentsFolder = '/uploads/';
    this.dbName = 'PeerTutoringDB';
    this.dbVersion = 1;
    this.storeName = 'documents';
    this.db = null;
    this.initDB();
  }

  /**
   * Initialize IndexedDB for file storage
   */
  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
    });
  }

  /**
   * Ensure DB is initialized
   */
  async ensureDB() {
    if (!this.db) {
      await this.initDB();
    }
    return this.db;
  }

  /**
   * Store file in IndexedDB
   */
  async storeFile(id, file) {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const fileData = {
        id: id,
        file: file,
        name: file.name,
        type: file.type,
        size: file.size
      };

      const request = store.put(fileData);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Retrieve file from IndexedDB
   */
  async getFile(id) {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete file from IndexedDB
   */
  async deleteFile(id) {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all documents from localStorage
   */
  getAllDocuments() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : this.getDefaultDocuments();
    } catch (error) {
      console.error('Error loading documents:', error);
      return this.getDefaultDocuments();
    }
  }

  /**
   * Default documents (mock data)
   */
  getDefaultDocuments() {
    return [
      {
        id: 1,
        title: "Calculus Derivatives - Complete Guide",
        description: "Comprehensive notes covering all derivative rules with examples and practice problems.",
        subject: "Mathematics",
        type: "Notes",
        fileName: "calculus_derivatives.pdf",
        uploadedBy: "Dr. Sarah Chen",
        uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        downloads: 145,
        rating: 4.8,
        fileSize: "2.4 MB",
        tags: ["calculus", "derivatives", "math"],
        isFavorite: false
      },
      {
        id: 2,
        title: "Physics Formula Sheet - Mechanics",
        description: "Essential formulas for mechanics including motion, forces, and energy.",
        subject: "Physics",
        type: "Reference",
        fileName: "physics_mechanics.pdf",
        uploadedBy: "Alex Johnson",
        uploadDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        downloads: 89,
        rating: 4.6,
        fileSize: "1.1 MB",
        tags: ["physics", "formulas", "mechanics"],
        isFavorite: false
      },
      {
        id: 3,
        title: "Programming Assignment - Data Structures",
        description: "Assignment covering arrays, linked lists, and trees with test cases.",
        subject: "Computer Science",
        type: "Assignment",
        fileName: "data_structures_assignment.zip",
        uploadedBy: "Prof. Mike Stevens",
        uploadDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        downloads: 234,
        rating: 4.9,
        fileSize: "3.7 MB",
        tags: ["programming", "data-structures", "algorithms"],
        isFavorite: true
      }
    ];
  }

  /**
   * Save documents to localStorage
   */
  saveDocuments(documents) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(documents));
      return true;
    } catch (error) {
      console.error('Error saving documents:', error);
      return false;
    }
  }

  /**
   * Upload a new document
   */
  async uploadDocument(documentData, file) {
    try {
      const documents = this.getAllDocuments();
      const newId = Math.max(...documents.map(d => d.id), 0) + 1;

      // Store the actual file in IndexedDB
      await this.storeFile(newId, file);

      const newDocument = {
        id: newId,
        title: documentData.title,
        description: documentData.description || "",
        subject: documentData.subject,
        type: documentData.type,
        fileName: file.name,
        uploadedBy: documentData.uploadedBy,
        uploadDate: new Date().toISOString(),
        downloads: 0,
        rating: 0,
        fileSize: this.formatFileSize(file.size),
        tags: documentData.tags || [],
        isFavorite: false,
        fileType: file.type,
        hasFile: true // Indicates actual file is stored
      };

      documents.unshift(newDocument);
      this.saveDocuments(documents);
      
      return { success: true, document: newDocument };
    } catch (error) {
      console.error('Error uploading document:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Download a document
   */
  async downloadDocument(documentId) {
    try {
      const documents = this.getAllDocuments();
      const docIndex = documents.findIndex(d => d.id === documentId);
      
      if (docIndex === -1) {
        return { success: false, error: 'Document not found' };
      }

      const document = documents[docIndex];

      // If the document has an actual file, retrieve it and download
      if (document.hasFile) {
        const fileData = await this.getFile(documentId);
        
        if (fileData && fileData.file) {
          // Create a download link
          const url = URL.createObjectURL(fileData.file);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileData.name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          // Increment download count
          documents[docIndex].downloads += 1;
          this.saveDocuments(documents);

          return { success: true, document: documents[docIndex] };
        } else {
          return { success: false, error: 'File not found in storage' };
        }
      } else {
        // For mock documents without actual files
        return { success: false, error: 'This is a demo document without an actual file' };
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * View a document (open in new tab or viewer)
   */
  async viewDocument(documentId) {
    try {
      const documents = this.getAllDocuments();
      const document = documents.find(d => d.id === documentId);
      
      if (!document) {
        return { success: false, error: 'Document not found' };
      }

      // If the document has an actual file, retrieve it and open
      if (document.hasFile) {
        const fileData = await this.getFile(documentId);
        
        if (fileData && fileData.file) {
          const url = URL.createObjectURL(fileData.file);
          
          // Open in new tab
          window.open(url, '_blank');
          
          // Note: URL should be revoked after some time, but since it's in a new tab,
          // we'll let the browser handle it
          setTimeout(() => URL.revokeObjectURL(url), 100000);

          return { success: true, url: url };
        } else {
          return { success: false, error: 'File not found in storage' };
        }
      } else {
        // For mock documents without actual files
        return { success: false, error: 'This is a demo document without an actual file' };
      }
    } catch (error) {
      console.error('Error viewing document:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a document
   */
  async deleteDocument(documentId) {
    try {
      const documents = this.getAllDocuments();
      const document = documents.find(d => d.id === documentId);
      
      // Delete file from IndexedDB if it exists
      if (document && document.hasFile) {
        await this.deleteFile(documentId);
      }
      
      const filtered = documents.filter(d => d.id !== documentId);
      this.saveDocuments(filtered);
      return { success: true };
    } catch (error) {
      console.error('Error deleting document:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Toggle favorite status
   */
  toggleFavorite(documentId) {
    try {
      const documents = this.getAllDocuments();
      const docIndex = documents.findIndex(d => d.id === documentId);
      
      if (docIndex === -1) {
        return { success: false, error: 'Document not found' };
      }

      documents[docIndex].isFavorite = !documents[docIndex].isFavorite;
      this.saveDocuments(documents);
      
      return { success: true, document: documents[docIndex] };
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Share a document
   */
  shareDocument(documentId) {
    try {
      const documents = this.getAllDocuments();
      const document = documents.find(d => d.id === documentId);
      
      if (!document) {
        return { success: false, error: 'Document not found' };
      }

      // In a real app, this would generate a shareable link
      const shareUrl = `${window.location.origin}/app/documents/${documentId}`;
      
      // Try to use the Web Share API if available
      if (navigator.share) {
        navigator.share({
          title: document.title,
          text: document.description,
          url: shareUrl
        });
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareUrl);
        alert('Share link copied to clipboard!');
      }
      
      return { success: true, url: shareUrl };
    } catch (error) {
      console.error('Error sharing document:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get documents by user
   */
  getDocumentsByUser(userName) {
    const documents = this.getAllDocuments();
    return documents.filter(d => d.uploadedBy === userName);
  }

  /**
   * Get favorite documents
   */
  getFavoriteDocuments() {
    const documents = this.getAllDocuments();
    return documents.filter(d => d.isFavorite);
  }

  /**
   * Format file size
   */
  formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  /**
   * Format date
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }
}

// Export a singleton instance
const documentService = new DocumentService();
export default documentService;
