//usePdfEditor.js
import { useState, useEffect } from "react";
import { stampPdfApi, stampPdfApiWithSignatures, checkBackendHealth } from "../services/api";
import { mapToPdfCoords } from "../utils/coordinateMapper";

export default function usePdfEditor() {
  const [pdfFile, setPdfFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [signatures, setSignatures] = useState([]);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [scale, setScale] = useState(1);
  const [pageSize, setPageSize] = useState({ width: 1, height: 1 });
  const [stampedPdfUrl, setStampedPdfUrl] = useState(null);
  const [stampedSignatures, setStampedSignatures] = useState([]);
  const [stampedNumPages, setStampedNumPages] = useState(0);
  const [stampedPageSizes, setStampedPageSizes] = useState({});
  const [isStamping, setIsStamping] = useState(false);
  const [error, setError] = useState(null);
  const [backendConnected, setBackendConnected] = useState(true);

  // Check backend connection on mount
  useEffect(() => {
    async function checkConnection() {
      const isConnected = await checkBackendHealth();
      setBackendConnected(isConnected);
      if (!isConnected) {
        setError("Backend server is not reachable. Please start the backend server.");
      }
    }
    checkConnection();
    // Check every 5 seconds
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  function addSignature() {
    if (!imageFile) {
      setError("Please upload an image file first");
      return;
    }

    const sig = {
      id: Date.now(),
      x: 50,
      y: 50,
      width: 120,
      height: 60,
      preview: URL.createObjectURL(imageFile),
    };

    setHistory([...history, signatures]);
    setSignatures([...signatures, sig]);
    setError(null);
  }

  function updateSignature(id, changes) {
    setSignatures(
      signatures.map((s) =>
        s.id === id ? { ...s, ...changes } : s
      )
    );
  }

  function updateStampedSignature(id, changes) {
    setStampedSignatures(
      stampedSignatures.map((s) =>
        s.id === id ? { ...s, ...changes } : s
      )
    );
  }

  function handleStampedPagesLoad(numPages) {
    setStampedNumPages(numPages);
    // Initialize signatures for all pages if not already initialized
    // Check if we need to create signatures (either empty or wrong count)
    const needsInit = stampedSignatures.length === 0 || 
                      stampedSignatures.length !== numPages ||
                      !stampedSignatures.every(s => s.page <= numPages);
    
    if (needsInit && signatures.length > 0 && imageFile) {
      // Clean up old signatures' blob URLs
      stampedSignatures.forEach(sig => {
        if (sig.preview && sig.preview.startsWith('blob:')) {
          URL.revokeObjectURL(sig.preview);
        }
      });
      
      const sig = signatures[0];
      const newStampedSignatures = [];
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        // Check if signature already exists for this page
        const existing = stampedSignatures.find(s => s.page === pageNum);
        if (existing) {
          newStampedSignatures.push(existing);
        } else {
          newStampedSignatures.push({
            id: `stamped-${pageNum}-${Date.now()}-${Math.random()}`,
            x: sig.x,
            y: sig.y,
            width: sig.width,
            height: sig.height,
            page: pageNum,
            preview: URL.createObjectURL(imageFile),
          });
        }
      }
      setStampedSignatures(newStampedSignatures);
    }
  }

  async function saveFinalPdf() {
    if (!stampedPdfUrl || !imageFile || !pdfFile) {
      setError("Missing required files");
      return;
    }

    if (stampedSignatures.length === 0) {
      setError("No signatures to save");
      return;
    }

    setIsStamping(true);
    setError(null);

    try {
      // Create signatures array with per-page positions
      const previewScale = 1.2; // Stamped preview uses 1.2 scale
      const signaturesData = stampedSignatures
        .sort((a, b) => a.page - b.page) // Sort by page number
        .map(sig => {
          const coords = mapToPdfCoords(sig, previewScale);
          return {
            ...coords,
            page: sig.page,
          };
        });

      // Use the API to stamp with per-page positions
      const url = await stampPdfApiWithSignatures(pdfFile, imageFile, signaturesData);

      // Clean up old blob URL
      if (stampedPdfUrl && stampedPdfUrl.startsWith('blob:')) {
        URL.revokeObjectURL(stampedPdfUrl);
      }

      setStampedPdfUrl(url);
      // Keep the signatures as they are - each page maintains its own position
    } catch (err) {
      const errorMessage = err.message || "Failed to save final PDF";
      setError(errorMessage);
    } finally {
      setIsStamping(false);
    }
  }

  function undo() {
    if (!history.length) return;
    setRedoStack([signatures, ...redoStack]);
    setSignatures(history.at(-1));
    setHistory(history.slice(0, -1));
  }

  function redo() {
    if (!redoStack.length) return;
    setHistory([...history, signatures]);
    setSignatures(redoStack[0]);
    setRedoStack(redoStack.slice(1));
  }

  async function stampPdf() {
    if (!backendConnected) {
      setError("Backend server is not connected. Please start the backend server.");
      return;
    }
    
    if (!pdfFile) {
      setError("Please upload a PDF file first");
      return;
    }
    if (!imageFile) {
      setError("Please upload an image file first");
      return;
    }
    if (!signatures.length) {
      setError("Please add at least one signature");
      return;
    }

    setIsStamping(true);
    setError(null);

    try {
      // Process all signatures
      const sig = signatures[0]; // For now, handle first signature
      const coords = mapToPdfCoords(sig, scale, pageSize);
      const url = await stampPdfApi(pdfFile, imageFile, coords);
      
      // Clean up previous blob URLs if exists
      if (stampedPdfUrl) {
        URL.revokeObjectURL(stampedPdfUrl);
      }
      // Clean up old stamped signature blob URLs
      stampedSignatures.forEach(sig => {
        if (sig.preview && sig.preview.startsWith('blob:')) {
          URL.revokeObjectURL(sig.preview);
        }
      });
      
      setStampedPdfUrl(url);
      // Don't initialize signatures here - let handleStampedPagesLoad do it
      // This ensures we know the actual page count first
      
      setBackendConnected(true); // Reset connection status on success
    } catch (err) {
      const errorMessage = err.message || "Failed to stamp PDF";
      setError(errorMessage);
      
      // Check if it's a connection error
      if (errorMessage.includes("Cannot connect") || errorMessage.includes("Failed to fetch")) {
        setBackendConnected(false);
      }
    } finally {
      setIsStamping(false);
    }
  }

  return {
    pdfFile,
    imageFile,
    signatures,
    scale,
    setScale,
    setPdfFile,
    setImageFile,
    addSignature,
    updateSignature,
    undo,
    redo,
    stampPdf,
    setPageSize,
    stampedPdfUrl,
    stampedSignatures,
    updateStampedSignature,
    handleStampedPagesLoad,
    saveFinalPdf,
    isStamping,
    error,
    backendConnected,
  };
}
