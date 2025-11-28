/**
 * Document Model
 * Represents a document in the peer tutoring system
 */

export class Document {
  constructor(data = {}) {
    this.id = data.id || null;
    this.title = data.title || '';
    this.description = data.description || '';
    this.subject = data.subject || '';
    this.type = data.type || ''; // Notes, Assignment, Reference, Practice, Summary
    this.fileName = data.fileName || '';
    this.fileType = data.fileType || '';
    this.fileSize = data.fileSize || '';
    this.uploadedBy = data.uploadedBy || '';
    this.uploadDate = data.uploadDate || new Date().toISOString();
    this.downloads = data.downloads || 0;
    this.rating = data.rating || 0;
    this.tags = data.tags || [];
    this.isFavorite = data.isFavorite || false;
    this.hasFile = data.hasFile || false; // Indicates if actual file is stored
  }

  /**
   * Validate document data
   */
  validate() {
    const errors = [];

    if (!this.title || this.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (!this.subject || this.subject.trim().length === 0) {
      errors.push('Subject is required');
    }

    if (!this.type || this.type.trim().length === 0) {
      errors.push('Type is required');
    }

    if (!this.fileName || this.fileName.trim().length === 0) {
      errors.push('File name is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Convert to plain object for storage
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      subject: this.subject,
      type: this.type,
      fileName: this.fileName,
      fileType: this.fileType,
      fileSize: this.fileSize,
      uploadedBy: this.uploadedBy,
      uploadDate: this.uploadDate,
      downloads: this.downloads,
      rating: this.rating,
      tags: this.tags,
      isFavorite: this.isFavorite,
      hasFile: this.hasFile
    };
  }

  /**
   * Create Document instance from plain object
   */
  static fromJSON(json) {
    return new Document(json);
  }

  /**
   * Get file extension
   */
  getFileExtension() {
    return this.fileName.split('.').pop().toLowerCase();
  }

  /**
   * Check if file is a PDF
   */
  isPDF() {
    return this.getFileExtension() === 'pdf' || this.fileType === 'application/pdf';
  }

  /**
   * Check if file is an image
   */
  isImage() {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
    return imageExtensions.includes(this.getFileExtension()) || 
           this.fileType.startsWith('image/');
  }

  /**
   * Check if file is a document
   */
  isDocument() {
    const docExtensions = ['doc', 'docx', 'txt', 'rtf', 'odt'];
    return docExtensions.includes(this.getFileExtension()) ||
           this.fileType.includes('document') ||
           this.fileType.includes('text');
  }

  /**
   * Check if file is a presentation
   */
  isPresentation() {
    const presentationExtensions = ['ppt', 'pptx', 'odp'];
    return presentationExtensions.includes(this.getFileExtension()) ||
           this.fileType.includes('presentation');
  }

  /**
   * Check if file is a spreadsheet
   */
  isSpreadsheet() {
    const spreadsheetExtensions = ['xls', 'xlsx', 'csv', 'ods'];
    return spreadsheetExtensions.includes(this.getFileExtension()) ||
           this.fileType.includes('spreadsheet');
  }

  /**
   * Check if file is an archive
   */
  isArchive() {
    const archiveExtensions = ['zip', 'rar', '7z', 'tar', 'gz'];
    return archiveExtensions.includes(this.getFileExtension());
  }

  /**
   * Get icon class based on file type
   */
  getIconClass() {
    if (this.isPDF()) return 'fa-file-pdf text-red-500';
    if (this.isImage()) return 'fa-file-image text-blue-500';
    if (this.isDocument()) return 'fa-file-word text-blue-600';
    if (this.isPresentation()) return 'fa-file-powerpoint text-orange-500';
    if (this.isSpreadsheet()) return 'fa-file-excel text-green-500';
    if (this.isArchive()) return 'fa-file-archive text-yellow-500';
    return 'fa-file text-gray-500';
  }

  /**
   * Check if file can be viewed in browser
   */
  canViewInBrowser() {
    return this.isPDF() || this.isImage() || 
           this.fileType === 'text/plain' ||
           this.fileType === 'text/html';
  }
}

export default Document;
