import { Document, Page, pdfjs } from "react-pdf";
import SignatureOverlay from "./SignatureOverlay";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

export default function PdfPreview({
  pdfFile,
  signatures,
  updateSignature,
  scale,
  setScale,
  setPageSize,
}) {
  if (!pdfFile) return null;

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
      </div>

      {/* PDF Preview */}
      <div className="pdf-wrapper">
        <Document file={pdfFile}>
          <div className="pdf-container">
            {/* PDF Page */}
            <Page
              pageNumber={1}
              scale={scale}
              onLoadSuccess={(page) =>
                setPageSize({ width: page.width, height: page.height })
              }
            />

            {/* Signature Overlay Layer */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 10,
              }}
            >
              {signatures.map((sig) => (
                <SignatureOverlay
                  key={sig.id}
                  signature={sig}
                  onChange={updateSignature}
                />
              ))}
            </div>
          </div>
        </Document>
      </div>
    </>
  );
}
