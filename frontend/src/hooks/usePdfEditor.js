//usePdfEditor.js
import { useState, useEffect } from "react";
import { stampPdfApi, checkBackendHealth } from "../services/api";
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
      
      // Clean up previous blob URL if exists
      if (stampedPdfUrl) {
        URL.revokeObjectURL(stampedPdfUrl);
      }
      
      setStampedPdfUrl(url);
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
    isStamping,
    error,
    backendConnected,
  };
}
