//Controls.jsx
export default function Controls({
  addSignature,
  stampPdf,
}) {
  return (
    <div className="toolbar">
      <button onClick={addSignature}>Add Signature</button>
      <button onClick={stampPdf}>Stamp PDF</button>
    </div>
  );
}
