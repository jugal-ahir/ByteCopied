import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Paper,
  IconButton,
  Checkbox,
  FormControlLabel,
  Chip,
  Card,
  CardContent,
  CardActions,
  Grid,
  Skeleton,
  Fade,
  InputAdornment,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import { saveAs } from 'file-saver';
import { useAuth } from '../contexts/AuthContext';
import createApiInstance from '../services/api';
import CodeDisplay from '../components/CodeDisplay';
import Editor from '@monaco-editor/react';

const languages = [
  'javascript',
  'python',
  'java',
  'cpp',
  'c',
  'html',
  'css',
  'typescript',
  'json',
  'sql',
  'text',
];

// Map our language names to Monaco Editor language IDs
const getMonacoLanguage = (lang) => {
  const languageMap = {
    'javascript': 'javascript',
    'python': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'html': 'html',
    'css': 'css',
    'typescript': 'typescript',
    'json': 'json',
    'sql': 'sql',
    'text': 'plaintext',
  };
  return languageMap[lang] || 'plaintext';
};

export default function Snippets() {
  const { getAuthHeaders, isAdmin } = useAuth();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [snippets, setSnippets] = useState([]);
  const [selectedSnippets, setSelectedSnippets] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    language: 'text',
    description: '',
    isViewOnly: false,
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const api = createApiInstance(getAuthHeaders);

  useEffect(() => {
    fetchSnippets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Optimized filtering with useMemo
  const filteredSnippets = useMemo(() => {
    if (!searchQuery.trim()) {
      return snippets;
    }

    const query = searchQuery.toLowerCase().trim();
    return snippets.filter((snippet) => {
      const titleMatch = snippet.title?.toLowerCase().includes(query);
      // Check name, email fields
      const name = snippet.createdByName || '';
      const email = snippet.createdByEmail || snippet.email || '';
      const nameMatch = name?.toLowerCase().includes(query);
      const emailMatch = email?.toLowerCase().includes(query);
      return titleMatch || nameMatch || emailMatch;
    });
  }, [searchQuery, snippets]);

  const fetchSnippets = async () => {
    setFetching(true);
    try {
      const response = await api.get('/snippets');
      const data = response.data || [];
      // Sort snippets by creation date (newest first) - client-side for speed
      const sortedData = data.sort((a, b) => {
        // Handle both ISO string and Firestore Timestamp formats
        const aTime = a.createdAt 
          ? (typeof a.createdAt === 'string' 
              ? new Date(a.createdAt).getTime() 
              : (a.createdAt.toMillis?.() || a.createdAt.seconds * 1000 || 0))
          : 0;
        const bTime = b.createdAt 
          ? (typeof b.createdAt === 'string' 
              ? new Date(b.createdAt).getTime() 
              : (b.createdAt.toMillis?.() || b.createdAt.seconds * 1000 || 0))
          : 0;
        return bTime - aTime;
      });
      setSnippets(sortedData);
    } catch (error) {
      console.error('Error fetching snippets:', error);
      setSnippets([]);
    } finally {
      setFetching(false);
    }
  };

  const handleOpenDialog = (snippet = null) => {
    if (snippet) {
      setEditingSnippet(snippet);
      setFormData({
        title: snippet.title,
        code: snippet.code,
        language: snippet.language || 'text',
        description: snippet.description || '',
        isViewOnly: snippet.isViewOnly || false,
      });
    } else {
      setEditingSnippet(null);
      setFormData({
        title: '',
        code: '',
        language: 'text',
        description: '',
        isViewOnly: false,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSnippet(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (editingSnippet) {
        await api.put(`/snippets/${editingSnippet.id}`, formData);
      } else {
        await api.post('/snippets', formData);
      }
      fetchSnippets();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving snippet:', error);
      alert('Failed to save snippet');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this snippet?')) return;

    try {
      await api.delete(`/snippets/${id}`);
      fetchSnippets();
    } catch (error) {
      console.error('Error deleting snippet:', error);
      alert('Failed to delete snippet');
    }
  };

  const handleDownload = (snippet) => {
    const content = `Title: ${snippet.title}\nLanguage: ${snippet.language}\nDescription: ${snippet.description || 'N/A'}\n\nCode:\n${snippet.code}`;
    const blob = new Blob([content], { type: 'text/plain' });
    saveAs(blob, `${snippet.title.replace(/\s+/g, '_')}.txt`);
  };

  const handleBatchDownload = () => {
    if (selectedSnippets.length === 0) return;

    const content = selectedSnippets
      .map((id) => {
        const snippet = filteredSnippets.find((s) => s.id === id);
        if (!snippet) return '';
        const email = snippet.createdByEmail || snippet.email;
        return `=== ${snippet.title} ===\nLanguage: ${snippet.language}\nDescription: ${snippet.description || 'N/A'}\n${email ? `Uploaded by: ${email}\n` : ''}\n${snippet.code}\n\n`;
      })
      .filter(Boolean)
      .join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    saveAs(blob, `snippets_${Date.now()}.txt`);
  };

  const handleDownloadAll = () => {
    const content = filteredSnippets
      .map((snippet) => {
        const email = snippet.createdByEmail || snippet.email;
        return `=== ${snippet.title} ===\nLanguage: ${snippet.language}\nDescription: ${snippet.description || 'N/A'}\n${email ? `Uploaded by: ${email}\n` : ''}\n${snippet.code}\n\n`;
      })
      .join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    saveAs(blob, `all_snippets_${Date.now()}.txt`);
  };

  const toggleSelectSnippet = (id) => {
    setSelectedSnippets((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <Container maxWidth="xl" sx={{ mt: { xs: 11, sm: 14 }, mb: 4 }}>
      <Box
        sx={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: 3,
          p: { xs: 2, sm: 3 },
          mb: 4,
          boxShadow: isDark
            ? '0px 8px 32px rgba(0,0,0,0.5)'
            : '0px 8px 32px rgba(0,0,0,0.1)',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={3}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '1.5rem', sm: '2rem' },
            }}
          >
            💾 Code Snippets
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap" sx={{ width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
            {selectedSnippets.length > 0 && (
              <>
                <Button
                  variant="outlined"
                  onClick={handleBatchDownload}
                  startIcon={<DownloadIcon />}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 600,
                    borderColor: '#6366f1',
                    color: '#6366f1',
                    '&:hover': {
                      borderColor: '#4f46e5',
                      background: 'rgba(99, 102, 241, 0.05)',
                    },
                  }}
                >
                  Download ({selectedSnippets.length})
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setSelectedSnippets([])}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 600,
                  }}
                >
                  Clear
                </Button>
              </>
            )}
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadAll}
              sx={{
                borderRadius: 2,
                fontWeight: 600,
                borderColor: '#6366f1',
                color: '#6366f1',
                '&:hover': {
                  borderColor: '#4f46e5',
                  background: 'rgba(99, 102, 241, 0.05)',
                },
              }}
            >
              Download All
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{
                borderRadius: 2,
                fontWeight: 600,
              }}
            >
              New Snippet
            </Button>
          </Box>
        </Box>
        
        {/* Search Bar */}
        <TextField
          fullWidth
          placeholder="Search by title or uploader email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#6366f1' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              background: isDark
                ? 'rgba(30, 41, 59, 0.8)'
                : 'rgba(255,255,255,0.8)',
              '&:hover fieldset': {
                borderColor: '#6366f1',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#6366f1',
              },
            },
          }}
        />
        {searchQuery && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, ml: 1 }}>
            Found {filteredSnippets.length} snippet{filteredSnippets.length !== 1 ? 's' : ''}
          </Typography>
        )}
      </Box>

      {fetching ? (
        <Grid container spacing={3}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} sm={6} lg={4} key={item}>
              <Card
                sx={{
                  background: isDark
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 3,
                  boxShadow: '0px 4px 20px rgba(0,0,0,0.08)',
                }}
              >
                <CardContent>
                  <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
                  <Box display="flex" gap={1} mb={2}>
                    <Skeleton variant="rounded" width={80} height={24} />
                    <Skeleton variant="rounded" width={80} height={24} />
                  </Box>
                  <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
                </CardContent>
                <CardActions>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Skeleton variant="circular" width={40} height={40} />
                  <Skeleton variant="circular" width={40} height={40} />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Fade in={!fetching} timeout={150}>
          <Grid container spacing={3}>
            {filteredSnippets.map((snippet, index) => (
              <Grid item xs={12} sm={6} lg={4} key={snippet.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    background: isDark
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 3,
                    boxShadow: '0px 4px 20px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0px 12px 40px rgba(0,0,0,0.15)',
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                      <Box flex={1} minWidth={0}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            mb: 1,
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                          }}
                        >
                          {snippet.title}
                        </Typography>
                        <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
                          <Chip
                            label={snippet.language}
                            size="small"
                            sx={{
                              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                            }}
                          />
                          {snippet.isViewOnly && (
                            <Chip
                              label="View Only"
                              size="small"
                              sx={{
                                background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                              }}
                            />
                          )}
                        </Box>
                        {isAdmin && (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              mt: 1,
                              p: 0.75,
                              borderRadius: 1.5,
                              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
                              border: '1px solid rgba(99, 102, 241, 0.2)',
                            }}
                          >
                            <PersonIcon sx={{ fontSize: 16, color: '#6366f1' }} />
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#6366f1',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                              title={snippet.createdByName || snippet.createdByEmail || snippet.email || snippet.createdBy || 'Unknown'}
                            >
                              {snippet.createdByName || snippet.createdByEmail || snippet.email || snippet.createdBy || 'Unknown'}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedSnippets.includes(snippet.id)}
                            onChange={() => toggleSelectSnippet(snippet.id)}
                            size="small"
                            sx={{
                              color: '#6366f1',
                              '&.Mui-checked': {
                                color: '#6366f1',
                              },
                            }}
                          />
                        }
                        label=""
                        sx={{ m: 0, ml: 1 }}
                      />
                    </Box>
                    {snippet.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        mb={2}
                        sx={{
                          fontStyle: 'italic',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {snippet.description}
                      </Typography>
                    )}
                    <CodeDisplay code={snippet.code} language={snippet.language} />
                  </CardContent>
                  <CardActions
                    sx={{
                      px: 3,
                      pb: 2,
                      pt: 1,
                      gap: 0.5,
                      borderTop: '1px solid rgba(0,0,0,0.05)',
                      background: 'rgba(0,0,0,0.02)',
                    }}
                  >
                    <IconButton
                      onClick={() => handleDownload(snippet)}
                      title="Download"
                      size="small"
                      sx={{
                        color: '#6366f1',
                        '&:hover': {
                          background: 'rgba(99, 102, 241, 0.1)',
                          transform: 'scale(1.15)',
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                    {(!snippet.isViewOnly || isAdmin) && (
                      <IconButton
                        onClick={() => handleOpenDialog(snippet)}
                        title="Edit"
                        size="small"
                        sx={{
                          color: '#6366f1',
                          '&:hover': {
                            background: 'rgba(99, 102, 241, 0.1)',
                            transform: 'scale(1.15)',
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    {(!snippet.isViewOnly || isAdmin) && (
                      <IconButton
                        onClick={() => handleDelete(snippet.id)}
                        title="Delete"
                        size="small"
                        sx={{
                          color: '#ef4444',
                          '&:hover': {
                            background: 'rgba(239, 68, 68, 0.1)',
                            transform: 'scale(1.15)',
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Fade>
      )}

      {!fetching && filteredSnippets.length === 0 && snippets.length === 0 && (
        <Fade in={!fetching} timeout={150}>
          <Paper
            sx={{
              p: 6,
              textAlign: 'center',
              background: isDark
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
              backdropFilter: 'blur(20px)',
              borderRadius: 3,
              boxShadow: isDark
            ? '0px 8px 32px rgba(0,0,0,0.5)'
            : '0px 8px 32px rgba(0,0,0,0.1)',
            }}
          >
            <Typography variant="h5" color="text.secondary" gutterBottom>
              📝 No snippets yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Create your first code snippet to get started!
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{
                borderRadius: 2,
                fontWeight: 600,
              }}
            >
              Create Snippet
            </Button>
          </Paper>
        </Fade>
      )}

      {!fetching && filteredSnippets.length === 0 && snippets.length > 0 && (
        <Fade in={!fetching} timeout={150}>
          <Paper
            sx={{
              p: 6,
              textAlign: 'center',
              background: isDark
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
              backdropFilter: 'blur(20px)',
              borderRadius: 3,
              boxShadow: isDark
            ? '0px 8px 32px rgba(0,0,0,0.5)'
            : '0px 8px 32px rgba(0,0,0,0.1)',
            }}
          >
            <Typography variant="h5" color="text.secondary" gutterBottom>
              🔍 No results found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Try adjusting your search query
            </Typography>
            <Button
              variant="outlined"
              onClick={() => setSearchQuery('')}
              sx={{
                borderRadius: 2,
                fontWeight: 600,
              }}
            >
              Clear Search
            </Button>
          </Paper>
        </Fade>
      )}

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 3 },
            boxShadow: '0px 8px 32px rgba(0,0,0,0.15)',
            m: { xs: 0, sm: 2 },
            maxHeight: { xs: '100%', sm: '90vh' },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            p: { xs: 2, sm: 3 },
          }}
        >
          {editingSnippet ? '✏️ Edit Snippet' : '➕ New Snippet'}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Title"
            fullWidth
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
          <TextField
            margin="dense"
            label="Language"
            select
            fullWidth
            value={formData.language}
            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          >
            {languages.map((lang) => (
              <MenuItem key={lang} value={lang}>
                {lang}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: 'text.secondary' }}>
              Code *
            </Typography>
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                overflow: 'hidden',
                '&:hover': {
                  borderColor: 'primary.main',
                },
                '&:focus-within': {
                  borderColor: 'primary.main',
                  borderWidth: 2,
                },
              }}
            >
              <Editor
                height={isMobile ? "300px" : "400px"}
                language={getMonacoLanguage(formData.language)}
                value={formData.code}
                onChange={(value) => setFormData({ ...formData, code: value || '' })}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: isMobile ? 12 : 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: 'on',
                  formatOnPaste: true,
                  formatOnType: true,
                  suggestOnTriggerCharacters: true,
                  acceptSuggestionOnEnter: 'on',
                  quickSuggestions: true,
                  fontFamily: "'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace",
                  fontLigatures: true,
                }}
              />
            </Box>
          </Box>
          {isAdmin && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isViewOnly}
                  onChange={(e) => setFormData({ ...formData, isViewOnly: e.target.checked })}
                />
              }
              label="View Only (for students)"
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 3 }, pt: 2, flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
          <Button
            onClick={handleCloseDialog}
            fullWidth={{ xs: true, sm: false }}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            fullWidth={{ xs: true, sm: false }}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

