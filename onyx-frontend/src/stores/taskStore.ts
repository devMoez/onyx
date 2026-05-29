import { create } from 'zustand';

interface Artifact {
  name: string;
  size: string;
}

interface ArtifactsState {
  code: string;
  files: Artifact[];
  output: string;
}

interface TaskState {
  currentArtifacts: ArtifactsState;
  setArtifacts: (artifacts: ArtifactsState) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  currentArtifacts: {
    code: '',
    files: [],
    output: '',
  },
  setArtifacts: (artifacts) => set({ currentArtifacts: artifacts }),
}));
