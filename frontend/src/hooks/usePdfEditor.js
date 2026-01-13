//usePdfEditor.js
import { useState } from "react";
import { stampPdfApi } from "../services/api";
import { mapToPdfCoords } from "../utils/coordinateMapper";

export default function usePdfEditor() {
  const [pdfFile, setPdfFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [signatures, setSignatures] = useState([]);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [scale, setScale] = useState(1);
  const [pageSize, setPageSize] = useState({ width: 1, height: 1 });

  function addSignature() {
    if (!imageFile) return;

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
    if (!signatures.length) return;

    const sig = signatures[0];
    const coords = mapToPdfCoords(sig, scale, pageSize);

    await stampPdfApi(pdfFile, imageFile, coords);
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
  };
}
