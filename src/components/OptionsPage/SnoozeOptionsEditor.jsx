// @flow
import type { Node } from 'react';
import React, { useState } from 'react';
import styled from 'styled-components';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MuiButton from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import MuiSelect from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

const OPTION_TYPES = [
  { value: 'offset',        label: 'X minutes from now' },
  { value: 'evening',       label: 'This Evening' },
  { value: 'tomorrow',      label: 'Tomorrow morning' },
  { value: 'weekend',       label: 'This Weekend' },
  { value: 'next_week',     label: 'Next Week' },
  { value: 'in_a_month',    label: 'In a Month' },
  { value: 'someday',       label: 'Someday' },
  { value: 'periodically',  label: 'Repeatedly (period selector)' },
  { value: 'specific_date', label: 'Pick a Date' },
];

const EMPTY_OPTION: CustomSnoozeOption = {
  id: '',
  label: '',
  type: 'offset',
  offsetMinutes: 60,
};

type Props = {
  options: Array<CustomSnoozeOption>,
  onChange: (Array<CustomSnoozeOption>) => void,
};

export default function SnoozeOptionsEditor({ options, onChange }: Props): Node {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<CustomSnoozeOption>(EMPTY_OPTION);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const openAdd = () => {
    setDraft({ ...EMPTY_OPTION, id: `custom_${Date.now()}` });
    setEditingIndex(-1); // -1 = new
  };

  const openEdit = (index: number) => {
    setDraft({ ...options[index] });
    setEditingIndex(index);
  };

  const closeDialog = () => setEditingIndex(null);

  const saveDialog = () => {
    if (!draft.label.trim()) return;
    const next = [...options];
    if (editingIndex === -1) {
      next.push(draft);
    } else if (editingIndex != null) {
      next[editingIndex] = draft;
    }
    onChange(next);
    closeDialog();
  };

  const deleteOption = (index: number) => {
    const next = options.filter((_, i) => i !== index);
    onChange(next);
  };

  // drag-to-reorder
  const onDragStart = (index: number) => setDragIndex(index);
  const onDragOver = (e: any, index: number) => {
    e.preventDefault();
    if (dragIndex == null || dragIndex === index) return;
    const next = [...options];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    setDragIndex(index);
    onChange(next);
  };
  const onDragEnd = () => setDragIndex(null);

  const offsetHours = draft.type === 'offset'
    ? (draft.offsetMinutes ?? 60) / 60
    : null;

  return (
    <Root>
      <List disablePadding>
        {options.map((opt, index) => (
          <ListItem
            key={opt.id}
            draggable
            onDragStart={() => onDragStart(index)}
            onDragOver={e => onDragOver(e, index)}
            onDragEnd={onDragEnd}
            style={{ opacity: dragIndex === index ? 0.5 : 1, cursor: 'grab' }}
          >
            <DragHandle />
            <ListItemText
              primary={opt.label}
              secondary={describeType(opt)}
              inset
            />
            <ListItemSecondaryAction>
              <IconButton size="small" onClick={() => openEdit(index)}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => deleteOption(index)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <AddRow>
        <MuiButton startIcon={<AddIcon />} onClick={openAdd} size="small">
          Add option
        </MuiButton>
      </AddRow>

      <Dialog open={editingIndex != null} onClose={closeDialog} fullWidth maxWidth="xs">
        <DialogTitle>{editingIndex === -1 ? 'Add Snooze Option' : 'Edit Snooze Option'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Label"
            value={draft.label}
            onChange={e => setDraft({ ...draft, label: e.target.value })}
            fullWidth
            margin="normal"
            autoFocus
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Type</InputLabel>
            <MuiSelect
              value={draft.type}
              label="Type"
              onChange={e => setDraft({ ...draft, type: (e.target.value: any), offsetMinutes: 60 })}
            >
              {OPTION_TYPES.map(t => (
                <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
              ))}
            </MuiSelect>
          </FormControl>
          {draft.type === 'offset' && (
            <TextField
              label="Hours from now"
              type="number"
              inputProps={{ min: 0.25, step: 0.25 }}
              value={offsetHours ?? 1}
              onChange={e => setDraft({ ...draft, offsetMinutes: Math.round(parseFloat(e.target.value) * 60) })}
              fullWidth
              margin="normal"
            />
          )}
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={closeDialog}>Cancel</MuiButton>
          <MuiButton onClick={saveDialog} variant="contained" disabled={!draft.label.trim()}>
            Save
          </MuiButton>
        </DialogActions>
      </Dialog>
    </Root>
  );
}

function describeType(opt: CustomSnoozeOption): string {
  if (opt.type === 'offset') {
    const h = (opt.offsetMinutes ?? 60) / 60;
    return `${h} hour${h !== 1 ? 's' : ''} from now`;
  }
  return OPTION_TYPES.find(t => t.value === opt.type)?.label ?? opt.type;
}

const Root = styled.div`
  padding: 0 16px;
`;

const AddRow = styled.div`
  padding: 8px 0 4px 56px;
`;

const DragHandle = styled(DragHandleIcon)`
  color: #bbb;
  margin-right: 8px;
  cursor: grab;
`;
