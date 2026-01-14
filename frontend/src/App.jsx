//App.jsx
import PdfUploader from "./components/PdfUploader";
import PdfPreview from "./components/PdfPreview";
import Controls from "./components/Controls";
import usePdfEditor from "./hooks/usePdfEditor";

export default function App() {
  const editor = usePdfEditor();

  return (
    <div className="app">
      <h2>PDF Signature Stamper</h2>

      <PdfUploader {...editor} />
      <Controls {...editor} />
      <PdfPreview {...editor} />
    </div>
  );
}
