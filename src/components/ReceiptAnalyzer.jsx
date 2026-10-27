'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, Calculator, Lightbulb, AlertCircle, CheckCircle } from 'lucide-react';

export default function ReceiptAnalyzer() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      setSelectedFile(file);
      setError(null);
      setResults(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('receipt', selectedFile);

      const response = await fetch('/api/computer-vision/receipt-analysis', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const resetAnalyzer = () => {
    setSelectedFile(null);
    setResults(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          AI Receipt Analyzer
        </h2>
        <p className="text-gray-600">
          Upload a receipt image and get instant carbon footprint analysis with personalized reduction tips
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="receipt-upload"
          />

          {!selectedFile ? (
            <div>
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <label
                htmlFor="receipt-upload"
                className="cursor-pointer text-lg font-medium text-gray-900 mb-2 block"
              >
                Upload Receipt Image
              </label>
              <p className="text-gray-500">
                PNG, JPG, JPEG up to 10MB
              </p>
            </div>
          ) : (
            <div>
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                {selectedFile.name}
              </p>
              <p className="text-gray-500 mb-4">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {analyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Calculator className="h-4 w-4" />
                      Analyze Receipt
                    </>
                  )}
                </button>
                <button
                  onClick={resetAnalyzer}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
                >
                  Choose Different File
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* Results Section */}
      {results && (
        <div className="space-y-6">
          {/* Receipt Data */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Receipt Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Vendor</p>
                <p className="font-medium">{results.receiptData.vendor}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="font-medium">${results.receiptData.total.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-medium capitalize">{results.receiptData.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{results.receiptData.date}</p>
              </div>
            </div>
          </div>

          {/* Carbon Footprint */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Carbon Footprint Analysis
            </h3>
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {results.carbonFootprint.totalKgCO2.toFixed(2)} kg CO₂
              </div>
              <p className="text-gray-600">
                Emission factor: {results.carbonFootprint.emissionFactor} kg CO₂ per dollar
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Emissions Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Direct emissions</span>
                    <span>{results.carbonFootprint.breakdown.directEmissions.toFixed(2)} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Indirect emissions</span>
                    <span>{results.carbonFootprint.breakdown.indirectEmissions.toFixed(2)} kg</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Reduction Tips
                </h4>
                <ul className="space-y-2">
                  {results.carbonFootprint.suggestions.map((tip, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Line Items */}
          {results.receiptData.items.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Line Items</h3>
              <div className="space-y-2">
                {results.receiptData.items.map((item, index) => (
                  <div key={index} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <span className="text-gray-700">{item.description}</span>
                    <span className="font-medium">${item.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extracted Text (Debug) */}
          <details className="bg-white rounded-lg shadow-lg p-6">
            <summary className="cursor-pointer font-medium mb-4">Extracted Text (Debug Info)</summary>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Tesseract OCR:</h4>
                <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                  {results.extractedText.tesseract}
                </pre>
              </div>
              <div>
                <h4 className="font-medium mb-2">Google Vision:</h4>
                <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                  {results.extractedText.vision}
                </pre>
              </div>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
