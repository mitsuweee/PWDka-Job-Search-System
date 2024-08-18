import React, { useState } from 'react';

const ApplyPage = () => {
  const [resume, setResume] = useState(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setResume(file);
      setPdfPreviewUrl(URL.createObjectURL(file)); // Create a URL for the PDF file to preview it
      setError('');
    } else {
      setError('Please upload a PDF file.');
      setResume(null);
      setPdfPreviewUrl(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (resume) {
      alert('Resume submitted successfully!');
      // Here you would typically send the file to your backend server
    } else {
      setError('Please upload a PDF file before submitting.');
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Apply for the Job</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">Upload Your Resume (PDF only):</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm text-gray-800"
          />
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
        {pdfPreviewUrl && (
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Preview Your Resume:</label>
            <iframe
              className="w-full h-64 border rounded-lg shadow-sm"
              src={pdfPreviewUrl}
              title="PDF Preview"
              width="100%"
              height="500px"
            ></iframe>
          </div>
        )}
        <button
          type="submit"
          className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
        >
          Submit Application
        </button>
      </form>
    </div>
  );
};

export default ApplyPage;
