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
    deleteDocument,
    notes,
    notesLoading,
    createNote,
    updateNote,
    deleteNote,
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
    activePageNumber,
    setActivePageNumber,
    highlightText,
    leftTab,
    setLeftTab,
    openDocument,
  } = useWorkspace();

  const handleOpenDocument = (documentId: string, pageNumber: number, excerpt?: string) => {
    setRightPanelVisible(true);
    openDocument(documentId, pageNumber, excerpt);
  };

  const handleRunAgentPrompt = (prompt: string) => {
    setInputValue(prompt);
    // Focus chat and trigger send on next cycle
    setTimeout(() => {
      sendMessage();
    }, 100);
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
          onDocumentDelete={deleteDocument}
          activeTab={leftTab}
          onTabChange={setLeftTab}
          onUploadClick={() => setUploadOpen(true)}
          notes={notes}
          notesLoading={notesLoading}
          onCreateNote={createNote}
          onUpdateNote={updateNote}
          onDeleteNote={deleteNote}
          citations={citations}
          onOpenSource={handleOpenDocument}
          onRunAgentPrompt={handleRunAgentPrompt}
        />

        {/* ── Center: Chat ── */}
        <ChatPanel
          messages={messages}
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
        {rightPanelVisible && selectedDocument && (
          <RightPanel
            document={selectedDocument}
            citations={citations}
            zoomLevel={zoomLevel}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            currentPage={activePageNumber}
            onPageChange={setActivePageNumber}
            highlightText={highlightText}
            onOpenCitation={handleOpenDocument}
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
