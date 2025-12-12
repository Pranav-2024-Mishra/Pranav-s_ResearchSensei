const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const selectedFile = e.target.files?.[0];
  if (!selectedFile) return;

  const reader = new FileReader();

  reader.onload = () => {
    const result = reader.result;

    if (!result) {
      setError("Could not read the file.");
      return;
    }

    // Case 1: Expected DataURL format (browser standard)
    if (typeof result === "string" && result.startsWith("data:")) {
      const base64 = result.split(",")[1] || "";
      
      setFile({
        base64,
        mimeType: selectedFile.type || "application/octet-stream",
        name: selectedFile.name
      });

      setError(null);
      return;
    }

    // Case 2: Raw ArrayBuffer fallback (edge runtimes sometimes return this)
    if (result instanceof ArrayBuffer) {
      const binary = new Uint8Array(result)
        .reduce((acc, b) => acc + String.fromCharCode(b), "");
      const base64 = btoa(binary);

      setFile({
        base64,
        mimeType: selectedFile.type || "application/octet-stream",
        name: selectedFile.name
      });

      setError(null);
      return;
    }

    setError("Unsupported file format.");
  };

  reader.onerror = () => {
    setError("Failed to read file. Try uploading again.");
  };

  reader.readAsDataURL(selectedFile);
};
