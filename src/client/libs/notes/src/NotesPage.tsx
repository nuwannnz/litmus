import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ancestorFolderIds, flattenNotes, uid } from '@litmus/domain';
import {
  appPaths,
  useAllNotes,
  useNote,
  useNoteTree,
  useProject,
  useProjects,
  useWorkspaceDispatch,
} from '@litmus/core';
import {
  Button,
  EmptyState,
  Icon,
  IconButton,
  NotePickerModal,
  SearchInput,
  View,
  useToast,
} from '@litmus/ui';
import { NoteTree } from './components/NoteTree';
import { NoteEditor } from './components/NoteEditor';
import './notes.css';

export function NotesPage() {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const dispatch = useWorkspaceDispatch();
  const toast = useToast();

  const tree = useNoteTree();
  const note = useNote(noteId);
  const project = useProject(note?.projectId);
  const projects = useProjects();
  const allNotes = useAllNotes();

  const [query, setQuery] = useState('');
  const [showList, setShowList] = useState(false);
  const [linking, setLinking] = useState(false);

  // Reveal the note in the tree whenever it is opened from elsewhere.
  useEffect(() => {
    if (!noteId) return;
    const ids = ancestorFolderIds(tree, noteId);
    if (ids.length) dispatch({ type: 'folder/openPath', ids });
    // Only re-run when the target note changes, not on every tree edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId, dispatch]);

  const pickableNotes = useMemo(
    () =>
      allNotes.map((n) => ({
        id: n.id,
        name: n.name,
        location: projects.find((p) => p.id === n.projectId)?.name ?? 'Notes',
      })),
    [allNotes, projects],
  );

  const openNote = (id: string) => {
    setShowList(false);
    navigate(appPaths.note(id));
  };

  const createNote = () => {
    const id = uid('n-');
    dispatch({ type: 'note/add', id });
    toast('Note created', 'note');
    openNote(id);
  };

  const createFolder = () => {
    dispatch({ type: 'folder/add', id: uid('f-') });
    toast('Folder created', 'folder');
  };

  return (
    <View>
      <div className={`notes ${showList ? 'show-list' : ''}`}>
        <aside className="notes-side">
          <div className="notes-side-head">
            <h2>Notes</h2>
            <IconButton icon="note" label="New note" onClick={createNote} />
            <IconButton icon="folder" label="New folder" onClick={createFolder} />
          </div>
          <SearchInput value={query} onChange={setQuery} placeholder="Search notes" />
          <NoteTree
            nodes={tree}
            activeNoteId={noteId ?? null}
            query={query}
            onSelectNote={openNote}
            onToggleFolder={(id) => dispatch({ type: 'folder/toggle', id })}
          />
        </aside>

        {note ? (
          <NoteEditor
            note={note}
            project={project}
            onRename={(name) => dispatch({ type: 'note/rename', id: note.id, name })}
            onChangeBody={(body) => dispatch({ type: 'note/setBody', id: note.id, body })}
            onOpenProject={(projectId) => navigate(appPaths.project(projectId))}
            onOpenNote={openNote}
            onBackToList={() => setShowList(true)}
            onLink={() => setLinking(true)}
          />
        ) : (
          <div className="editor">
            <EmptyState
              icon="note"
              title="No note open"
              body="Select a note from the sidebar to start reading, or create a new one to begin writing."
              action={
                <div className="row gap-10">
                  <Button variant="primary" onClick={createNote}>
                    <Icon name="plus" size="sm" /> New Note
                  </Button>
                  <Button onClick={createFolder}>
                    <Icon name="folder" size="sm" /> New Folder
                  </Button>
                </div>
              }
            />
          </div>
        )}
      </div>

      {linking && (
        <NotePickerModal
          notes={pickableNotes}
          onPick={(id) => {
            const target = allNotes.find((n) => n.id === id);
            setLinking(false);
            if (target) toast(`Linked to ${target.name}`, 'link');
          }}
          onClose={() => setLinking(false)}
        />
      )}
    </View>
  );
}

/** `/app/notes` lands on the first note, falling back to the empty state. */
export function NotesIndexRedirect() {
  const tree = useNoteTree();
  const first = flattenNotes(tree)[0];
  return first ? <Navigate to={appPaths.note(first.id)} replace /> : <NotesPage />;
}
