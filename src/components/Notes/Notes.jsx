import React from 'react';
import { NotesList, NoteEditor } from './components';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <NotesList
        notes={notes}
        onSelectNote={setSelectedNote}
        onDeleteNote={handleDeleteNote}
      />
      <NoteEditor
        note={selectedNote}
        onSave={handleSaveNote}
      />
    </div>
  );
};
