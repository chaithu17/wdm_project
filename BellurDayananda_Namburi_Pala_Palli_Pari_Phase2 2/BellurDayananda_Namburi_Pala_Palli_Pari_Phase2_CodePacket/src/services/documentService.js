/**
 * Document Service
 * Handles document upload, download, and management
 * Connects to backend API for document operations
 */

import apiClient from './api';

class DocumentService {
  constructor() {
    this.apiBaseUrl = '/documents';
  }

  /**
   * Get all documents
   */
  async getAllDocuments() {
    try {
      const response = await apiClient.get(this.apiBaseUrl);
      return response.documents || [];
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }

  /**
   * Upload a new document
   */
  async uploadDocument(documentData, file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', documentData.title);
      formData.append('description', documentData.description || '');
      formData.append('subject', documentData.subject);
      formData.append('type', documentData.type);

      if (documentData.tags && Array.isArray(documentData.tags)) {
        formData.append('tags', JSON.stringify(documentData.tags));
      }

      // Custom fetch call for FormData
      const token = apiClient.getToken();
      const response = await fetch(`${apiClient.baseURL}${this.apiBaseUrl}`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || 'Upload failed');
      }

      const result = await response.json();
      return { success: true, document: result.document };
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
      const token = apiClient.getToken();
      const response = await fetch(`${apiClient.baseURL}${this.apiBaseUrl}/${documentId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || 'Download failed');
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'download';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error('Error downloading document:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get a single document by ID
   */
  async getDocumentById(documentId) {
    try {
      const response = await apiClient.get(`${this.apiBaseUrl}/${documentId}`);
      return { success: true, document: response.document };
    } catch (error) {
      console.error('Error fetching document:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * View a document (open in new tab or viewer)
   */
  async viewDocument(documentId) {
    try {
      const token = apiClient.getToken();
      const response = await fetch(`${apiClient.baseURL}${this.apiBaseUrl}/${documentId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || 'View failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Open in new tab
      window.open(url, '_blank');

      // Clean up after some time
      setTimeout(() => URL.revokeObjectURL(url), 100000);

      return { success: true, url: url };
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
      await apiClient.delete(`${this.apiBaseUrl}/${documentId}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting document:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(documentId) {
    try {
      const response = await apiClient.post(`${this.apiBaseUrl}/${documentId}/favorite`);
      return { success: true, document: response.document };
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Share a document
   */
  async shareDocument(documentId) {
    try {
      const response = await apiClient.post(`${this.apiBaseUrl}/${documentId}/share`);
      const shareUrl = response.shareUrl || `${window.location.origin}/app/documents/${documentId}`;

      // Try to use the Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: response.document?.title || 'Shared Document',
          text: response.document?.description || '',
          url: shareUrl
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
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
  async getDocumentsByUser(userId) {
    try {
      const response = await apiClient.get(`${this.apiBaseUrl}?uploadedBy=${userId}`);
      return response.documents || [];
    } catch (error) {
      console.error('Error fetching user documents:', error);
      return [];
    }
  }

  /**
   * Get favorite documents
   */
  async getFavoriteDocuments() {
    try {
      const response = await apiClient.get(`${this.apiBaseUrl}?isFavorite=true`);
      return response.documents || [];
    } catch (error) {
      console.error('Error fetching favorite documents:', error);
      return [];
    }
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
