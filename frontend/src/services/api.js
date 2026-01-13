//ap.js
export async function stampPdfApi(pdf, image, coords) {
  const form = new FormData();
  form.append("pdf", pdf);
  form.append("image", image);
  form.append("x", coords.x);
  form.append("y", coords.y);
  form.append("width", coords.width);
  form.append("height", coords.height);

  const res = await fetch("http://localhost:8000/pdf/stamp", {
    method: "POST",
    body: form,
  });

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  window.open(url);
}
