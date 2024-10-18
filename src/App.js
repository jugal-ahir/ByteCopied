import React, { useState, useEffect } from 'react';
import './App.css';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import jsPDF from 'jspdf';
import 'jspdf-autotable';


const App = () => {
  const [snippets, setSnippets] = useState(() => {
    const savedSnippets = localStorage.getItem('snippets');
    return savedSnippets ? JSON.parse(savedSnippets) : [];
  });
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showIntro, setShowIntro] = useState(true);
  const [titleError, setTitleError] = useState('');
  const [codeError, setCodeError] = useState('');
  const [snippetToDelete, setSnippetToDelete] = useState(null); // State for snippet to be deleted
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Modal visibility state

  useEffect(() => {
    localStorage.setItem('snippets', JSON.stringify(snippets));
  }, [snippets]);

  useEffect(() => {
    if (!showIntro) {
      Prism.highlightAll();
    }
  }, [snippets, showIntro]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Highlighting on search term change
  useEffect(() => {
    if (!showIntro) {
      Prism.highlightAll();
    }
  }, [searchTerm, showIntro]);

  const validateForm = () => {
    let isValid = true;
    setTitleError('');
    setCodeError('');

    if (title.trim() === '') {
      setTitleError('Please provide the title');
      isValid = false;
    }
    if (code.trim() === '') {
      setCodeError('Please provide the code');
      isValid = false;
    }

    return isValid;
  };

  const addSnippet = () => {
    if (!validateForm()) {
      return;
    }

    const newSnippet = { id: Date.now(), title, code };
    setSnippets([...snippets, newSnippet]);
    setTitle('');
    setCode('');
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
  
    doc.setFontSize(12);
    doc.text('My Snippets List', 10, 10);
  
    const rows = snippets.map((snippet, index) => [
      `${index + 1}. ${snippet.title}`,
      snippet.code
    ]);
  
    // Use autoTable to create a table in the PDF
    doc.autoTable({
      head: [['Snippet Title', 'Code']],
      body: rows,
      startY: 20,
      theme: 'grid', // You can customize the theme as needed
      styles: { 
        cellPadding: 5,
        fontSize: 10,
        overflow: 'linebreak',
        rowHeight: 10,
      },
    });
  
    doc.save('my_snippets.pdf');
  };
  
  
  

  const updateSnippet = () => {
    if (!validateForm()) {
      return;
    }

    setSnippets(snippets.map(snippet => snippet.id === editingId ? { id: editingId, title, code } : snippet));
    setEditingId(null);
    setTitle('');
    setCode('');
  };

  const handleDelete = (id) => {
    setSnippetToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setSnippets(snippets.filter(snippet => snippet.id !== snippetToDelete));
    setShowDeleteModal(false);
  };

  const cancelDelete = () => {
    setSnippetToDelete(null);
    setShowDeleteModal(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Code copied to clipboard!');
  };

  const filteredSnippets = snippets.filter(snippet =>
    snippet.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {showIntro && (
        <div className="intro-screen">
          <h1 className="typewriter">ByteCopied</h1>
        </div>
      )}
      
      {!showIntro && (
        <div className="app">
          <div className="header">
            <img 
              src="https://ahduni.edu.in/site/assets/files/1/default_logo_final_png.1400x0.webp"  
              alt="University Logo" 
              className="logo" 
            />
            <span className="bytebuilder-text"> | ByteBuilder</span>
          </div>
          <h1>ByteCopied</h1>

          <div className="form">
            <input
              type="text"
              placeholder="Give the title of your code here..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {titleError && <div className="error">{titleError}</div>}
            
            <textarea
              placeholder="Write Your Code Here..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
            ></textarea>
            {codeError && <div className="error">{codeError}</div>}
            
            <button onClick={editingId ? updateSnippet : addSnippet}>
              {editingId ? 'Update Snippet' : 'Add Code'}
            </button>
          </div>

          <input
            type="text"
            className="search-bar"
            placeholder="Search codes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

<button onClick={downloadPDF} className="download-button">Download Snippets</button>


          <div className="snippets">
            {filteredSnippets.length > 0 ? (
              filteredSnippets.map(snippet => (
                <div key={snippet.id} className="snippet">
                  <h3>{snippet.title}</h3>
                  <pre>
                    <code className="language-javascript">
                      {snippet.code}
                    </code>
                  </pre>
                  <div className="actions">
                    <button onClick={() => copyToClipboard(snippet.code)}>Copy</button>
                    <button onClick={() => { setEditingId(snippet.id); setTitle(snippet.title); setCode(snippet.code); }}>Edit</button>
                    <button onClick={() => handleDelete(snippet.id)}>Delete</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">No Data Found</div>
            )}
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Confirm Deletion</h2>
            <p>Are you sure you want to delete this snippet?</p>
            <button onClick={confirmDelete} className="confirm">Yes, Delete</button>
            <button onClick={cancelDelete} className="cancel">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
