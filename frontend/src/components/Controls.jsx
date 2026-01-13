export default function Controls({
  addSignature,
  undo,
  redo,
  stampPdf,
}) {
  return (
    <div className="toolbar">
      <button onClick={addSignature}>Add Signature</button>
      <button onClick={undo}>Undo</button>
      <button onClick={redo}>Redo</button>
      <button onClick={stampPdf}>Stamp PDF</button>
    </div>
  );
}
