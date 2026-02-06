import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Client, Order, DailyEntry, Asset, UserProfile, UserRole, Document } from '../backend';
import { Principal } from '@dfinity/principal';
import { ExternalBlob } from '../backend';

// Clients
export function useClients() {
  const { actor, isFetching } = useActor();

  return useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getClientsOrderedByName();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddClient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (client: Omit<Client, 'id'>) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addClient({ ...client, id: 0n } as Client);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useUpdateClient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, client }: { id: bigint; client: Client }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateClient(id, client);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useDeleteClient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteClient(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

// Orders
export function useOrdersByClient(clientId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['orders', 'client', clientId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrdersByClient(clientId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (order: Omit<Order, 'id'>) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addOrder({ ...order, id: 0n } as Order);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useUpdateOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, order }: { id: bigint; order: Order }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateOrder(id, order);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useDeleteOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteOrder(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

// Daily Entries
export function useDailyEntries() {
  const { actor, isFetching } = useActor();

  return useQuery<DailyEntry[]>({
    queryKey: ['dailyEntries'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllDailyEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddDailyEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: Omit<DailyEntry, 'id'>) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addDailyEntry({ ...entry, id: 0n } as DailyEntry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyEntries'] });
    },
  });
}

export function useUpdateDailyEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, entry }: { id: bigint; entry: DailyEntry }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateDailyEntry(id, entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyEntries'] });
    },
  });
}

export function useDeleteDailyEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteDailyEntry(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyEntries'] });
    },
  });
}

// Assets
export function useAssets() {
  const { actor, isFetching } = useActor();

  return useQuery<Asset[]>({
    queryKey: ['assets'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAssets();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddAsset() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (asset: Omit<Asset, 'id'>) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addAsset({ ...asset, id: 0n } as Asset);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}

export function useUpdateAsset() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, asset }: { id: bigint; asset: Asset }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateAsset(id, asset);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}

export function useDeleteAsset() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteAsset(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}

// Documents
export function useDocuments() {
  const { actor, isFetching } = useActor();

  return useQuery<Document[]>({
    queryKey: ['documents'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllDocuments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddDocument() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      blob,
      description,
      type,
      author,
      size,
      fileType,
    }: {
      name: string;
      blob: ExternalBlob;
      description: string;
      type: string;
      author: string;
      size: bigint;
      fileType: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addDocument(name, blob, description, type, author, size, fileType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useDeleteDocument() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteDocument(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

// User Profile
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Authorization
export function useAssignUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, role }: { user: Principal; role: UserRole }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.assignCallerUserRole(user, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userRole'] });
    },
  });
}
