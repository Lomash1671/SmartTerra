import { useState } from 'react';
import { Box, Typography, TextField, Button, Stack, Avatar } from '@mui/material';
import { Send } from '@mui/icons-material';
import { useAppStore, USERS } from '../store/useAppStore';

interface ConversationPanelProps {
  editId: string;
  minHeight?: number | string;
}

const ConversationPanel = ({ editId, minHeight = '100%' }: ConversationPanelProps) => {
  const { edits, addComment } = useAppStore();
  const [text, setText] = useState('');

  const edit = edits[editId];
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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: minHeight, p: 1 }}>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
        {edit.comments.length === 0 ? (
          <Typography variant="body2" color="text.secondary" align="center" mt={2}>
            No comments yet.
          </Typography>
        ) : (
          <Stack spacing={1}>
            {edit.comments.map(c => {
              const u = getUser(c.userId);
              return (
                <Box key={c.id} display="flex" gap={1}>
                  <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: 'primary.main' }}>
                    {u.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Box display="flex" alignItems="baseline" gap={1}>
                      <Typography variant="caption" fontWeight="bold">
                        {u.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600, fontSize: '0.65rem' }}>
                        [{u.role}]
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(c.timestamp).toLocaleTimeString()}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ bgcolor: 'white', p: 1, borderRadius: 1, border: '1px solid', borderColor: 'grey.200' }}>
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
        />
        <Button variant="contained" color="primary" onClick={handleSend} sx={{ minWidth: 40, p: 0 }}>
          <Send fontSize="small" />
        </Button>
      </Box>
    </Box>
  );
};

export default ConversationPanel;
