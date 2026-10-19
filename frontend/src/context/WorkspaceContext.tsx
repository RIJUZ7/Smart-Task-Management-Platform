import React, { createContext, useContext, useState, useEffect } from 'react';
import { Workspace } from '../types';
import { api } from '../api/client';
import { useAuth } from './AuthContext';

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  isLoading: boolean;
  setCurrentWorkspace: (workspace: Workspace) => void;
  refreshWorkspaces: () => Promise<void>;
  createWorkspace: (name: string, slug: string, description?: string) => Promise<Workspace>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspaceState] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshWorkspaces = async () => {
    if (!isAuthenticated) {
      setWorkspaces([]);
      setCurrentWorkspaceState(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const list = await api.getWorkspaces();
      setWorkspaces(list);

      const savedWorkspaceId = localStorage.getItem('taskforge_workspace_id');
      if (savedWorkspaceId) {
        const found = list.find((w) => w.id.toString() === savedWorkspaceId);
        if (found) {
          setCurrentWorkspaceState(found);
          return;
        }
      }

      if (list.length > 0) {
        setCurrentWorkspaceState(list[0]);
        localStorage.setItem('taskforge_workspace_id', list[0].id.toString());
      } else {
        setCurrentWorkspaceState(null);
      }
    } catch (err) {
      console.error('Failed to load workspaces', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshWorkspaces();
  }, [isAuthenticated]);

  const setCurrentWorkspace = (workspace: Workspace) => {
    setCurrentWorkspaceState(workspace);
    localStorage.setItem('taskforge_workspace_id', workspace.id.toString());
  };

  const createWorkspace = async (name: string, slug: string, description?: string) => {
    const created = await api.createWorkspace({ name, slug, description });
    await refreshWorkspaces();
    setCurrentWorkspace(created);
    return created;
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        isLoading,
        setCurrentWorkspace,
        refreshWorkspaces,
        createWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = (): WorkspaceContextType => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
