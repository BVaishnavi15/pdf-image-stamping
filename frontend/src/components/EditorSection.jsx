import usePdfEditor from "../hooks/usePdfEditor";
import PdfUploader from "./PdfUploader";
import Controls from "./Controls";
import PdfPreview from "./PdfPreview";
import StampedPdfPreview from "./StampedPdfPreview";

export default function EditorSection() {
  const editor = usePdfEditor();

  return (
    <section id="editor" className="editor-section">
      <div className="section-header">
        <h2 className="section-title">PDF Editor</h2>
        <p className="section-subtitle">
          Upload your PDF and signature image, then position and stamp your signature
        </p>
      </div>

      {/* Backend Connection Status */}
      {!editor.backendConnected && (
        <div className="warning-message">
          <span>🔴</span> 
          <div>
            <strong>Backend server not connected</strong>
            <p>Please ensure the backend server is running on http://localhost:8000</p>
            <p className="help-text">Run: <code>cd backend && python -m uvicorn app.main:app --reload</code></p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {editor.error && (
        <div className="error-message">
          <span>⚠️</span> 
          <div>
            {editor.error.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>
      )}

      <div className="editor-layout">
        {/* LEFT SIDEBAR */}
        <div className="editor-sidebar">
          <div className="sidebar-section">
            <h3>Upload Files</h3>
            <PdfUploader {...editor} />
          </div>

          <div className="sidebar-section">
            <h3>Controls</h3>
            <Controls {...editor} />
            {editor.isStamping && (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <span>Stamping PDF...</span>
              </div>
            )}
          </div>

          {/* Download Button */}
          {editor.stampedPdfUrl && (
            <div className="sidebar-section">
              <a
                href={editor.stampedPdfUrl}
                download="signed.pdf"
                className="download-btn"
              >
                📥 Download Final PDF
              </a>
              <p className="download-hint">
                Download the PDF with all signature adjustments applied
              </p>
            </div>
          )}
        </div>

        {/* RIGHT PREVIEW */}
        <div className="editor-preview">
          <div className="preview-section">
            <h3>PDF Preview</h3>
            <PdfPreview {...editor} />
          </div>
        </div>
      </div>

      {/* Stamped PDF Preview Section */}
      {editor.stampedPdfUrl && (
        <div className="stamped-pdf-section">
          <div className="section-header">
            <h2 className="section-title">Stamped PDF Preview</h2>
            <p className="section-subtitle">
              Edit signature positions on any page. Drag and resize to adjust.
            </p>
            <button
              onClick={editor.saveFinalPdf}
              className="save-final-btn"
              disabled={editor.isStamping}
            >
              {editor.isStamping ? "Saving..." : "💾 Save Final PDF"}
            </button>
          </div>
          <StampedPdfPreview
            stampedPdfUrl={editor.stampedPdfUrl}
            stampedSignatures={editor.stampedSignatures}
            updateStampedSignature={editor.updateStampedSignature}
            imageFile={editor.imageFile}
            onPagesLoad={editor.handleStampedPagesLoad}
          />
        </div>
      )}
    </section>
  );
}
