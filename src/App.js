import React, { useState, useEffect } from 'react';
import './App.css';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';  // Prism.js theme
import 'prismjs/components/prism-javascript'; // JavaScript syntax highlighting
import 'prismjs/components/prism-css';        // CSS syntax highlighting
import 'prismjs/components/prism-markup';     // HTML syntax highlighting

const App = () => {
  const [snippets, setSnippets] = useState(() => {
    const savedSnippets = localStorage.getItem('snippets');
    return savedSnippets ? JSON.parse(savedSnippets) : [];
  });
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [titleError, setTitleError] = useState(''); 
  const [codeError, setCodeError] = useState('');   

  useEffect(() => {
    localStorage.setItem('snippets', JSON.stringify(snippets));
  }, [snippets]);

  useEffect(() => {
    Prism.highlightAll();  // Highlight the code when the component is updated
  }, [snippets]);  // Run this whenever snippets change

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

  const updateSnippet = () => {
    if (!validateForm()) {
      return;
    }

    setSnippets(snippets.map(snippet => snippet.id === editingId ? { id: editingId, title, code } : snippet));
    setEditingId(null);
    setTitle('');
    setCode('');
  };

  const deleteSnippet = (id) => {
    setSnippets(snippets.filter(snippet => snippet.id !== id));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Code copied to clipboard!');
  };

  const filteredSnippets = snippets.filter(snippet =>
    snippet.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app">
      <div className="header">
        <img 
          src="https://ahduni.edu.in/site/assets/files/1/default_logo_final_png.1400x0.webp"  // Replace with the correct URL
          alt="University Logo" 
          className="logo" 
        />
        <span className="bytebuilder-text"> | ByteBuilder</span>
      </div>
      <h1>ByteCopied </h1>
      
      {/* Form for adding/editing snippets */}
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

      {/* Search bar for filtering snippets */}
      <input
        type="text"
        className="search-bar"
        placeholder="Search codes..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Display snippets with Prism.js syntax highlighting */}
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
                <button onClick={() => deleteSnippet(snippet.id)}>Delete</button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-data">No Data Found</div>
        )}
      </div>
    </div>
  );
};

export default App;
