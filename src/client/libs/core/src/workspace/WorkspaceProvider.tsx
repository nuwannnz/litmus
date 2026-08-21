import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react';
import { initialWorkspaceState, type WorkspaceAction, type WorkspaceState } from './state';
import { workspaceReducer } from './reducer';

const StateContext = createContext<WorkspaceState | null>(null);
const DispatchContext = createContext<Dispatch<WorkspaceAction> | null>(null);

/**
 * Holds the whole workspace in memory. When the API arrives this is where the
 * fetching layer plugs in — the hooks below are the only surface modules use.
 */
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workspaceReducer, undefined, initialWorkspaceState);
  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
    </StateContext.Provider>
  );
}

export function useWorkspace(): WorkspaceState {
  const state = useContext(StateContext);
  if (!state) throw new Error('useWorkspace must be used inside a <WorkspaceProvider>');
  return state;
}

export function useWorkspaceDispatch(): Dispatch<WorkspaceAction> {
  const dispatch = useContext(DispatchContext);
  if (!dispatch) throw new Error('useWorkspaceDispatch must be used inside a <WorkspaceProvider>');
  return dispatch;
}

/** Narrow selector hook so a module only re-renders for the slice it reads. */
export function useWorkspaceSelector<T>(select: (state: WorkspaceState) => T): T {
  const state = useWorkspace();
  return useMemo(() => select(state), [state, select]);
}
