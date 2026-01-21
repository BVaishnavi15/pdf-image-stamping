const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
// Health check function
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/`, {
      method: "GET",
    });
    return res.ok;
  } catch (error) {
    console.error("Backend health check failed:", error);
    return false;
  }
}

export async function stampPdfApi(pdf, image, coords) {
  const form = new FormData();
  form.append("pdf", pdf);
  form.append("image", image);
  form.append("x", coords.x);
  form.append("y", coords.y);
  form.append("width", coords.width);
  form.append("height", coords.height);

  try {
    console.log("Sending request to:", `${API_BASE_URL}/pdf/stamp`);
    
    const res = await fetch(`${API_BASE_URL}/pdf/stamp`, {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("API Error Response:", {
        status: res.status,
        statusText: res.statusText,
        body: errorText,
      });
      throw new Error(`Failed to stamp PDF: ${res.status} ${res.statusText}`);
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    return url; 
  } catch (error) {
    console.error("Fetch error details:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });
    
    if (error.message.includes("Failed to fetch") || 
        error.message.includes("NetworkError") ||
        error.message.includes("Network request failed")) {
      throw new Error(
        "Cannot connect to backend server. " +
        "Please ensure:\n" +
        "1. Backend server is running on http://localhost:8000\n" +
        "2. CORS is properly configured\n" +
        "3. No firewall is blocking the connection"
      );
    }
    throw error;
  }
}

export async function stampPdfApiWithSignatures(pdf, image, signatures) {
  const form = new FormData();
  form.append("pdf", pdf);
  form.append("image", image);
  form.append("signatures", JSON.stringify(signatures));

  try {
    console.log("Sending request with per-page signatures to:", `${API_BASE_URL}/pdf/stamp-multi`);
    
    const res = await fetch(`${API_BASE_URL}/pdf/stamp-multi`, {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("API Error Response:", {
        status: res.status,
        statusText: res.statusText,
        body: errorText,
      });
      throw new Error(`Failed to stamp PDF: ${res.status} ${res.statusText}`);
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    return url;
  } catch (error) {
    console.error("Fetch error details:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });
    
    if (error.message.includes("Failed to fetch") || 
        error.message.includes("NetworkError") ||
        error.message.includes("Network request failed")) {
      throw new Error(
        "Cannot connect to backend server. " +
        "Please ensure:\n" +
        "1. Backend server is running on http://localhost:8000\n" +
        "2. CORS is properly configured\n" +
        "3. No firewall is blocking the connection"
      );
    }
    throw error;
  }
}
