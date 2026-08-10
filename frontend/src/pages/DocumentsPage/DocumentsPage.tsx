import { FileText, Upload, Search, Filter } from 'lucide-react';
import { Card, Button, Badge, EmptyState } from '@/components/ui';
import './DocumentsPage.css';

const MOCK_DOCUMENTS = [
  {
    id: 'doc_1',
    name: 'Quantum Error Correction — Surface Codes.pdf',
    project: 'Quantum Computing Optimization',
    size: '2.4 MB',
    pages: 32,
    uploadedAt: '2 hours ago',
    type: 'PDF' as const,
  },
  {
    id: 'doc_2',
    name: 'IPCC AR6 WGI Summary for Policymakers.pdf',
    project: 'Climate Change Models 2026',
    size: '8.1 MB',
    pages: 98,
    uploadedAt: '1 day ago',
    type: 'PDF' as const,
  },
  {
    id: 'doc_3',
    name: 'Attention Is All You Need — Annotated.pdf',
    project: 'LLM Context Windows',
    size: '1.2 MB',
    pages: 15,
    uploadedAt: '3 days ago',
    type: 'PDF' as const,
  },
  {
    id: 'doc_4',
    name: 'CRISPR Off-Target Systematic Review 2024.pdf',
    project: 'CRISPR Cas9 Off-target Effects',
    size: '3.7 MB',
    pages: 54,
    uploadedAt: '1 week ago',
    type: 'PDF' as const,
  },
];

export function DocumentsPage() {
  return (
    <div className="rf-documents-page animate-fade-in">
      <div className="rf-documents-page__header">
        <div>
          <h1 className="rf-documents-page__title">Documents</h1>
          <p className="rf-documents-page__subtitle">
            {MOCK_DOCUMENTS.length} documents across all projects
          </p>
        </div>
        <Button>
          <Upload size={18} />
          Upload
        </Button>
      </div>

      <div className="rf-documents-page__toolbar">
        <div className="rf-documents-page__search">
          <Search size={16} className="rf-documents-page__search-icon" />
          <input
            type="text"
            placeholder="Search documents..."
            className="rf-documents-page__search-input"
            readOnly
          />
        </div>
        <button className="rf-documents-page__filter-btn">
          <Filter size={16} />
          Filter
        </button>
      </div>

      {MOCK_DOCUMENTS.length === 0 ? (
        <EmptyState
          title="No documents yet"
          description="Upload PDFs, research papers, or any documents to start analyzing them with AI."
        />
      ) : (
        <div className="rf-documents-page__list">
          {MOCK_DOCUMENTS.map(doc => (
            <Card key={doc.id} variant="glass" padding="md" hoverable className="rf-doc-item">
              <div className="rf-doc-item__icon">
                <FileText size={20} />
              </div>
              <div className="rf-doc-item__info">
                <p className="rf-doc-item__name">{doc.name}</p>
                <div className="rf-doc-item__meta">
                  <Badge variant="default">{doc.project}</Badge>
                  <span>{doc.pages} pages</span>
                  <span>·</span>
                  <span>{doc.size}</span>
                  <span>·</span>
                  <span>{doc.uploadedAt}</span>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="rf-doc-item__btn">Open</Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
