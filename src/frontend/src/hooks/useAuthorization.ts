import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile } from '../backend';

export function useAuthorization() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const isAuthenticated = !!identity;

  // Get user role
  const roleQuery = useQuery({
    queryKey: ['userRole', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
    retry: false,
  });

  // Get user profile
  const profileQuery = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
    retry: false,
  });

  // Check if admin
  const adminQuery = useQuery({
    queryKey: ['isAdmin', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
    retry: false,
  });

  const isAuthorized = isAuthenticated && roleQuery.data !== 'guest';
  const isAdmin = adminQuery.data === true;

  return {
    isAuthorized,
    isAdmin,
    userRole: roleQuery.data,
    userProfile: profileQuery.data,
    isLoading: actorFetching || roleQuery.isLoading || profileQuery.isLoading,
    isFetched: profileQuery.isFetched,
    currentPrincipal: identity?.getPrincipal().toString(),
  };
}
