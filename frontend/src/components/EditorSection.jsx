import usePdfEditor from "../hooks/usePdfEditor";
import PdfUploader from "./PdfUploader";
import Controls from "./Controls";
import PdfPreview from "./PdfPreview";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

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
                📥 Download Signed PDF
              </a>
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
            <p className="section-subtitle">Your PDF with signature applied</p>
          </div>
          <div className="stamped-pdf-container">
            <Document 
              file={editor.stampedPdfUrl} 
              className="stamped-document"
              loading={
                <div className="pdf-loading">
                  <div className="spinner"></div>
                  <span>Loading PDF...</span>
                </div>
              }
              error={
                <div className="pdf-error">
                  <span>⚠️</span>
                  <p>Failed to load PDF preview</p>
                </div>
              }
            >
              <Page pageNumber={1} scale={1.2} />
            </Document>
          </div>
        </div>
      )}
    </section>
  );
}
