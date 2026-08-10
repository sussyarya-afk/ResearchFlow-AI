import { useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { LeftPanel } from '@/features/workspace/components/LeftPanel';
import { ChatPanel } from '@/features/workspace/components/ChatPanel';
import { RightPanel } from '@/features/workspace/components/RightPanel';
import { UploadModal } from '@/features/workspace/components/upload/UploadModal';
import { useWorkspace } from '@/features/workspace/hooks';
import './WorkspacePage.css';

interface WorkspaceOutletContext {
  rightPanelVisible: boolean;
  setRightPanelVisible: (visible: boolean) => void;
}

export function WorkspacePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { rightPanelVisible, setRightPanelVisible } = useOutletContext<WorkspaceOutletContext>();
  const [uploadOpen, setUploadOpen] = useState(false);

  const {
    project,
    documents,
    documentsLoading,
    documentsError,
    selectedDocument,
    fetchDocuments,
    messages,
    inputValue,
    setInputValue,
    isGenerating,
    sendMessage,
    stopGeneration,
    handleKeyDown,
    chatEndRef,
    timeline,
    citations,
    zoomLevel,
    zoomIn,
    zoomOut,
    activeDocumentId,
    setActiveDocumentId,
    leftTab,
    setLeftTab,
    openDocument,
  } = useWorkspace();

  const handleOpenDocument = (documentId: string, pageNumber: number) => {
    setRightPanelVisible(true);
    openDocument(documentId, pageNumber);
  };

  return (
    <>
      <div className={`rf-workspace-page ${rightPanelVisible ? '' : 'rf-workspace-page--no-right'}`}>
        {/* ── Left Panel ── */}
        <LeftPanel
          project={project}
          documents={documents}
          documentsLoading={documentsLoading}
          documentsError={documentsError}
          activeDocumentId={activeDocumentId}
          onDocumentSelect={setActiveDocumentId}
          activeTab={leftTab}
          onTabChange={setLeftTab}
          onUploadClick={() => setUploadOpen(true)}
        />

        {/* ── Center: Chat ── */}
        <ChatPanel
          messages={messages.map(msg => ({
            ...msg,
            // In a real app we'd pass a single onOpenDocument to the list,
            // but for simplicity we can just attach it here or let ChatPanel pass it.
          }))}
          timeline={timeline}
          inputValue={inputValue}
          isGenerating={isGenerating}
          onInputChange={setInputValue}
          onSend={sendMessage}
          onStop={stopGeneration}
          onKeyDown={handleKeyDown}
          chatEndRef={chatEndRef}
          onOpenDocument={handleOpenDocument}
        />

        {/* ── Right Panel: Viewer + Citations ── */}
        {rightPanelVisible && (
          <RightPanel
            document={selectedDocument}
            citations={citations}
            zoomLevel={zoomLevel}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
          />
        )}
      </div>

      {/* ── Upload Modal ── */}
      <UploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        projectId={projectId || ''}
        onUploadSuccess={fetchDocuments}
      />
    </>
  );
}
