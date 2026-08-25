import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { uuidv7 } from '@litmus/domain';
import {
  appPaths,
  useAllNotes,
  useRegisterCommands,
  useWorkspaceDispatch,
  type AppModule,
  type Command,
} from '@litmus/core';
import { NotesIndexRedirect, NotesPage } from './NotesPage';

function NoteCommands() {
  const navigate = useNavigate();
  const dispatch = useWorkspaceDispatch();
  const notes = useAllNotes();

  const commands = useMemo<Command[]>(
    () => [
      {
        id: 'notes:goto',
        group: 'Go to',
        label: 'Notes',
        icon: 'note',
        run: () => navigate(appPaths.notes),
      },
      {
        id: 'notes:new',
        group: 'Actions',
        label: 'New note',
        icon: 'note',
        run: () => {
          const id = uuidv7();
          dispatch({ type: 'note/add', id });
          navigate(appPaths.note(id));
        },
      },
      ...notes.map<Command>((note) => ({
        id: `notes:open:${note.id}`,
        group: 'Notes',
        label: note.name,
        icon: 'file',
        hint: note.edited,
        run: () => navigate(appPaths.note(note.id)),
      })),
    ],
    [navigate, dispatch, notes],
  );

  useRegisterCommands('notes', commands);
  return null;
}

export const notesModule: AppModule = {
  id: 'notes',
  label: 'Notes',
  icon: 'note',
  path: 'notes',
  routes: [
    { index: true, element: <NotesIndexRedirect /> },
    { path: ':noteId', element: <NotesPage /> },
  ],
  Bridge: NoteCommands,
};
