import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../app/providers/AuthProvider";
import { documentService } from "../../services";
import { FaFileAlt, FaUser, FaCalendarAlt, FaDownload, FaStar, FaRegStar, FaEye, FaLink } from 'react-icons/fa';

export default function Documents() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [selectedType, setSelectedType] = useState("All Types");
  const [activeTab, setActiveTab] = useState("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    subject: "",
    type: "",
    file: null
  });

  const fileInputRef = useRef(null);

  const subjects = ["All Subjects", "Mathematics", "Physics", "Chemistry", "Computer Science", "History", "Biology", "English"];
  const types = ["All Types", "Notes", "Assignment", "Reference", "Practice", "Summary"];

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = () => {
    const docs = documentService.getAllDocuments();
    setDocuments(docs);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (file) => {
    if (file) {
      setUploadForm({ ...uploadForm, file });
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!uploadForm.file || !uploadForm.title || !uploadForm.subject || !uploadForm.type) {
      alert("Please fill in all required fields and select a file");
      return;
    }

    try {
      // Upload document using service (now async)
      const result = await documentService.uploadDocument(
        {
          title: uploadForm.title,
          description: uploadForm.description,
          subject: uploadForm.subject,
          type: uploadForm.type,
          uploadedBy: user?.name || "Current User",
          tags: []
        },
        uploadForm.file
      );

      if (result.success) {
        loadDocuments();
        setShowUploadModal(false);
        setUploadForm({
          title: "",
          description: "",
          subject: "",
          type: "",
          file: null
        });
        alert("Document uploaded successfully!");
      } else {
        alert(`Upload failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error.message}`);
    }
  };

  const handleView = async (doc) => {
    try {
      const result = await documentService.viewDocument(doc.id);
      
      if (!result.success) {
        alert(`View failed: ${result.error}`);
      }
      // If successful, the file will open in a new tab
    } catch (error) {
      console.error('View error:', error);
      alert(`View failed: ${error.message}`);
    }
  };

  const handleShare = (doc) => {
    const result = documentService.shareDocument(doc.id);
    if (!result.success && result.error) {
      alert(`Share failed: ${result.error}`);
    }
  };

  const handleToggleFavorite = (doc) => {
    const result = documentService.toggleFavorite(doc.id);
    if (result.success) {
      loadDocuments();
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === "All Subjects" || doc.subject === selectedSubject;
    const matchesType = selectedType === "All Types" || doc.type === selectedType;
    const matchesTab = activeTab === "all" || 
                       (activeTab === "my" && doc.uploadedBy === (user?.name || "Current User")) ||
                       (activeTab === "favorites" && doc.isFavorite);
    
    return matchesSearch && matchesSubject && matchesType && matchesTab;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Study Documents</h1>
          <p className="text-gray-600 mt-1">Upload, organize, and share your study materials with the community</p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Upload Document
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search documents, tags, or descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select 
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          {subjects.map(subject => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>
        <select 
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          {types.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "all" 
              ? "border-gray-900 text-gray-900" 
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          All Documents ({documents.length})
        </button>
        <button
          onClick={() => setActiveTab("my")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "my" 
              ? "border-gray-900 text-gray-900" 
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          My Documents ({documents.filter(d => d.uploadedBy === (user?.name || "Current User")).length})
        </button>
        <button
          onClick={() => setActiveTab("shared")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "shared" 
              ? "border-gray-900 text-gray-900" 
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Shared with Me
        </button>
        <button
          onClick={() => setActiveTab("favorites")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "favorites" 
              ? "border-gray-900 text-gray-900" 
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Favorites ({documents.filter(d => d.isFavorite).length})
        </button>
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No documents found. Try adjusting your filters or upload a new document.</p>
          </div>
        ) : (
          filteredDocuments.map(doc => (
            <div key={doc.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{doc.title}</h3>
                  <p className="text-gray-600 mb-3">{doc.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                      <FaFileAlt /> {doc.type}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                      {doc.subject}
                    </span>
                    {["math", "calculus", "derivatives"].slice(0, 2).map((tag, idx) => (
                      <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <FaUser /> {doc.uploadedBy}
                    </span>
                    <span className="flex items-center gap-1"><FaCalendarAlt /> {documentService.formatDate(doc.uploadDate)}</span>
                    <span className="flex items-center gap-1"><FaDownload /> {doc.downloads}</span>
                    {doc.rating > 0 && (
                      <span className="flex items-center gap-1">
                        <FaStar className="text-yellow-500" /> {doc.rating}
                      </span>
                    )}
                    <span className="ml-auto">{doc.fileSize}</span>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button 
                    onClick={() => handleToggleFavorite(doc)}
                    className={`px-3 py-2 border rounded-lg transition-colors ${
                      doc.isFavorite 
                        ? 'bg-yellow-50 border-yellow-300 text-yellow-600 hover:bg-yellow-100' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                    title={doc.isFavorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    {doc.isFavorite ? <FaStar /> : <FaRegStar />}
                  </button>
                  <button 
                    onClick={() => handleView(doc)}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                    title="View or download document"
                  >
                    <FaEye /> View/Download
                  </button>
                  <button 
                    onClick={() => handleShare(doc)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <FaLink /> Share
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Upload Document</h2>
                <p className="text-gray-600 text-sm mt-1">Share your study materials with the community</p>
              </div>
              <button 
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadForm({ title: "", description: "", subject: "", type: "", file: null });
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  placeholder="Enter document title"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  placeholder="Describe your document"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 h-24 resize-none"
                />
              </div>

              {/* Subject and Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <select
                    value={uploadForm.subject}
                    onChange={(e) => setUploadForm({ ...uploadForm, subject: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    required
                  >
                    <option value="">Select subject</option>
                    {subjects.slice(1).map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <select
                    value={uploadForm.type}
                    onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    required
                  >
                    <option value="">Select type</option>
                    {types.slice(1).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">File</label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive ? "border-gray-900 bg-gray-50" : "border-gray-300"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center gap-2">
                    <FaFileAlt className="text-4xl text-gray-400" />
                    {uploadForm.file ? (
                      <div className="text-sm">
                        <p className="font-medium">{uploadForm.file.name}</p>
                        <p className="text-gray-500">{(uploadForm.file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-gray-600">Drag and drop your file here, or click to browse</p>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="mt-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                        >
                          Choose File
                        </button>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileInputChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
                >
                  Upload Document
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadForm({ title: "", description: "", subject: "", type: "", file: null });
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
