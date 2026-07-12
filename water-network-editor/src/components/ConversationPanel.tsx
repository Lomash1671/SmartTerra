import { useState, useRef, useEffect } from 'react';
import { Box, Typography, TextField, Button, Stack, Avatar } from '@mui/material';
import { Send } from '@mui/icons-material';
import { useAppStore, USERS } from '../store/useAppStore';

interface ConversationPanelProps {
  editId: string;
  minHeight?: number | string;
}

const ConversationPanel = ({ editId, minHeight = '100%' }: ConversationPanelProps) => {
  const { edits, addComment, currentUser } = useAppStore();
  const [text, setText] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const edit = edits[editId];

  // Sort comments in chronological order (oldest first, i.e., top to bottom)
  const sortedComments = edit
    ? [...edit.comments].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    : [];

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [sortedComments.length, editId]);

  if (!edit) return null;

  const getUser = (id: string) => {
    return USERS.find(u => u.id === id) || { name: id, role: 'Unknown', id };
  };

  const handleSend = () => {
    if (text.trim()) {
      addComment(editId, text);
      setText('');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: minHeight, p: 1.5 }}>
      <Box
        ref={containerRef}
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          mb: 1.5,
          p: 2,
          bgcolor: '#efeae2', // WhatsApp-like light mode background
          borderRadius: 2,
          backgroundImage: 'radial-gradient(#dfdcd6 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      >
        {sortedComments.length === 0 ? (
          <Box display="flex" justifyContent="center" mt={2}>
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ bgcolor: 'rgba(255,255,255,0.85)', p: 1, borderRadius: 1.5, display: 'inline-block' }}
            >
              No comments yet. Start the conversation!
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {sortedComments.map(c => {
              const u = getUser(c.userId);
              const isMe = currentUser?.id === c.userId;
              return (
                <Box
                  key={c.id}
                  display="flex"
                  gap={1}
                  flexDirection={isMe ? 'row-reverse' : 'row'}
                  alignItems="flex-start"
                >
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      fontSize: '0.75rem',
                      bgcolor: isMe ? 'primary.main' : 'secondary.main',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    }}
                  >
                    {u.name.charAt(0)}
                  </Avatar>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                    <Box display="flex" alignItems="baseline" gap={0.5} flexDirection={isMe ? 'row-reverse' : 'row'} mb={0.2}>
                      <Typography variant="caption" fontWeight="bold">
                        {u.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                        ({u.role})
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', ml: isMe ? 0 : 0.5, mr: isMe ? 0.5 : 0 }}>
                        {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        bgcolor: isMe ? '#d9fdd3' : '#ffffff',
                        color: '#303030',
                        p: 1.2,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: isMe ? '#c2f0c2' : '#e5e7eb',
                        borderTopRightRadius: isMe ? 0 : 2,
                        borderTopLeftRadius: isMe ? 2 : 0,
                        wordBreak: 'break-word',
                        boxShadow: '0 1px 1px rgba(0,0,0,0.06)',
                        lineHeight: 1.4,
                      }}
                    >
                      {c.text}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>
      <Box display="flex" gap={1}>
        <TextField
          size="small"
          placeholder="Type a comment..."
          fullWidth
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: 'background.paper',
            },
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSend}
          sx={{ minWidth: 40, width: 40, height: 40, borderRadius: '50%', p: 0 }}
        >
          <Send fontSize="small" />
        </Button>
      </Box>
    </Box>
  );
};

export default ConversationPanel;
