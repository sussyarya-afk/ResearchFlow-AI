import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Upload, Search, Download, ExternalLink, Star, ArrowRight } from 'lucide-react';
import { Card, Button, Badge, EmptyState } from '@/components/ui';
import { apiClient } from '@/services/api';
import { projectService } from '@/features/projects/services/projectService';
import { UploadModal } from '@/features/workspace/components/upload/UploadModal';
import { favoritesManager } from '@/utils/favorites';
import type { Project } from '@/features/projects/types';
import './DocumentsPage.css';

interface UserDocument {
  id: string;
  project_id: string;
  project_name?: string;
  filename: string;
  file_size?: number;
  total_pages?: number;
  page_count?: number;
  status: string;
  created_at: string;
}

export function DocumentsPage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('all');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadProjectId, setUploadProjectId] = useState<string>('');

  const loadAllDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const [docsData, projsData] = await Promise.all([
        apiClient.getAllDocuments().catch(() => []),
        projectService.getProjects().catch(() => []),
      ]);

      const projMap = new Map((projsData as Project[]).map(p => [p.id, p.name]));
      setProjects(projsData as Project[]);

      if (Array.isArray(docsData)) {
        const enriched = docsData.map((d: any) => ({
          ...d,
          project_name: projMap.get(d.project_id) || 'Research Project',
        }));
        setDocuments(enriched);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllDocuments();
  }, [loadAllDocuments]);

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = searchQuery.trim() === '' || 
        doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.project_name && doc.project_name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesProj = selectedProjectFilter === 'all' || doc.project_id === selectedProjectFilter;

      return matchesSearch && matchesProj;
    });
  }, [documents, searchQuery, selectedProjectFilter]);

  const handleOpenDoc = (doc: UserDocument) => {
    navigate(`/workspace/${doc.project_id}`);
  };

  const handleDownload = (docId: string, filename: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = apiClient.getDocumentDownloadUrl(docId);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = filename;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
  };

  const handleOpenNewTab = (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = apiClient.getDocumentFileUrl(docId);
    window.open(url, '_blank');
  };

  const handleToggleFavorite = (doc: UserDocument, e: React.MouseEvent) => {
    e.stopPropagation();
    favoritesManager.toggleFavorite({
      id: doc.id,
      type: 'document',
      name: doc.filename,
      projectId: doc.project_id,
      description: doc.project_name,
    });
    setDocuments([...documents]); // trigger re-render
  };

  const handleUploadClick = () => {
    if (projects.length > 0) {
      setUploadProjectId(projects[0].id);
      setUploadOpen(true);
    } else {
      navigate('/projects');
    }
  };

  return (
    <div className="rf-documents-page animate-fade-in">
      <div className="rf-documents-page__header">
        <div>
          <h1 className="rf-documents-page__title">Documents</h1>
          <p className="rf-documents-page__subtitle">
            {documents.length} {documents.length === 1 ? 'document' : 'documents'} across all projects
          </p>
        </div>
        <Button onClick={handleUploadClick} leftIcon={<Upload size={16} />} variant="accent">
          Upload PDF
        </Button>
      </div>

      <div className="rf-documents-page__toolbar">
        <div className="rf-documents-page__search">
          <Search size={16} className="rf-documents-page__search-icon" />
          <input
            type="text"
            placeholder="Search documents by filename or project..."
            className="rf-documents-page__search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="rf-documents-page__filter-select"
          value={selectedProjectFilter}
          onChange={(e) => setSelectedProjectFilter(e.target.value)}
        >
          <option value="all">All Projects</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {!loading && filteredDocuments.length === 0 ? (
        <EmptyState
          title="No documents found"
          description={
            documents.length === 0
              ? 'Upload PDFs or research papers to start analyzing them with AI.'
              : 'Try clearing your search query or selecting a different project filter.'
          }
          action={
            documents.length === 0 ? (
              <Button onClick={handleUploadClick} variant="primary">Upload First Document</Button>
            ) : (
              <Button onClick={() => { setSearchQuery(''); setSelectedProjectFilter('all'); }} variant="ghost">Clear Filters</Button>
            )
          }
        />
      ) : (
        <div className="rf-documents-page__list">
          {filteredDocuments.map(doc => {
            const isFav = favoritesManager.isFavorite(doc.id);
            const sizeKB = doc.file_size ? `${(doc.file_size / (1024 * 1024)).toFixed(1)} MB` : '1.8 MB';
            const pageCount = doc.total_pages || doc.page_count || 1;

            return (
              <Card key={doc.id} variant="glass" padding="md" hoverable className="rf-doc-item">
                <div className="rf-doc-item__icon">
                  <FileText size={20} />
                </div>
                <div className="rf-doc-item__info" onClick={() => handleOpenDoc(doc)} style={{ cursor: 'pointer' }}>
                  <p className="rf-doc-item__name">{doc.filename}</p>
                  <div className="rf-doc-item__meta">
                    <Badge variant="default">{doc.project_name || 'Project'}</Badge>
                    <span>{pageCount} {pageCount === 1 ? 'page' : 'pages'}</span>
                    <span>·</span>
                    <span>{sizeKB}</span>
                    <span>·</span>
                    <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="rf-doc-item__actions">
                  <button
                    className={`rf-doc-item__action-btn ${isFav ? 'rf-doc-item__action-btn--fav' : ''}`}
                    onClick={(e) => handleToggleFavorite(doc, e)}
                    title={isFav ? 'Remove from favorites' : 'Star document'}
                  >
                    <Star size={15} fill={isFav ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    className="rf-doc-item__action-btn"
                    onClick={(e) => handleDownload(doc.id, doc.filename, e)}
                    title="Download document"
                  >
                    <Download size={15} />
                  </button>
                  <button
                    className="rf-doc-item__action-btn"
                    onClick={(e) => handleOpenNewTab(doc.id, e)}
                    title="Preview in new tab"
                  >
                    <ExternalLink size={15} />
                  </button>
                  <Button variant="ghost" size="sm" onClick={() => handleOpenDoc(doc)} rightIcon={<ArrowRight size={13} />}>
                    Open
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {uploadProjectId && (
        <UploadModal
          isOpen={uploadOpen}
          onClose={() => setUploadOpen(false)}
          projectId={uploadProjectId}
          onUploadSuccess={loadAllDocuments}
        />
      )}
    </div>
  );
}
