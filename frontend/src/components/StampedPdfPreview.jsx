import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import SignatureOverlay from "./SignatureOverlay";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

export default function StampedPdfPreview({
  pdfFile,
  stampedSignatures,
  updateStampedSignature,
  deleteStampedSignature,
  scale,
  setScale,
  onPagesLoad,
}) {
  const [numPages, setNumPages] = useState(0);
  const [pageSizes, setPageSizes] = useState({});

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    if (onPagesLoad) {
      onPagesLoad(numPages);
    }
  }

  function onPageLoadSuccess(pageNumber, page) {
    setPageSizes(prev => ({
      ...prev,
      [pageNumber]: { width: page.width, height: page.height }
    }));
  }

  // Group signatures by page
  const signaturesByPage = {};
  stampedSignatures.forEach(sig => {
    const page = sig.page || 1;
    if (!signaturesByPage[page]) {
      signaturesByPage[page] = [];
    }
    signaturesByPage[page].push(sig);
  });

  return (
    <>
      {/* Zoom Control */}
      <div className="zoom">
        <label>Zoom</label>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={scale}
          onChange={(e) => setScale(Number(e.target.value))}
        />
        <span className="zoom-value">{Math.round(scale * 100)}%</span>
      </div>

      {/* All PDF Pages - single scroll frame */}
      <div className="stamped-pdf-viewer">
        <Document
          file={pdfFile}
          onLoadSuccess={onDocumentLoadSuccess}
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
          {numPages > 0 &&
            Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
              <div key={pageNum} className="stamped-page">
                <div
                  className="pdf-container"
                  style={{ position: "relative", display: "inline-block" }}
                >
                  <Page
                    pageNumber={pageNum}
                    scale={scale}
                    onLoadSuccess={(page) => onPageLoadSuccess(pageNum, page)}
                  />

                  {/* Signature Overlay Layer for this page */}
                  {(signaturesByPage[pageNum] || []).length > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 10,
                      }}
                    >
                      {(signaturesByPage[pageNum] || []).map((sig) => (
                        <SignatureOverlay
                          key={sig.id}
                          signature={sig}
                          onChange={updateStampedSignature}
                          onDelete={deleteStampedSignature}
                          showDelete
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
        </Document>
      </div>
    </>
  );
}
