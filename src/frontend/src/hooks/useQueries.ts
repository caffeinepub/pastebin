import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Paste, PasteSummary } from "../backend.d";
import { useActor } from "./useActor";

export type { PasteSummary, Paste };

export function useListPastes() {
  const { actor, isFetching } = useActor();
  return useQuery<PasteSummary[]>({
    queryKey: ["pastes"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.listPastes();
      return [...result].sort((a, b) => {
        if (b.createdAt > a.createdAt) return 1;
        if (b.createdAt < a.createdAt) return -1;
        return 0;
      });
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPaste(id: bigint | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<Paste | null>({
    queryKey: ["paste", id?.toString()],
    queryFn: async () => {
      if (!actor || id === undefined) return null;
      return actor.getPaste(id);
    },
    enabled: !!actor && !isFetching && id !== undefined,
  });
}

export function useCreatePaste() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      content,
    }: { title: string; content: string }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createPaste(title, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pastes"] });
    },
  });
}
