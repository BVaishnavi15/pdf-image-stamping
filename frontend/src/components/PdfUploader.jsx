export default function PdfUploader({ setPdfFile, setImageFile }) {
  return (
    <div className="uploader">
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setPdfFile(e.target.files[0])}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImageFile(e.target.files[0])}
      />
    </div>
  );
}
