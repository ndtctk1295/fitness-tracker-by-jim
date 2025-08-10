import { useMutation, useQueryClient } from '@tanstack/react-query';

export type UpdateUserProfileInput = {
  name: string;
};

async function updateUserProfileRequest(data: UpdateUserProfileInput) {
  const res = await fetch('/api/auth/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  let payload: any = null;
  try {
    payload = await res.json();
  } catch {
    // ignore json parse errors
  }

  if (!res.ok) {
    const message = payload?.error || payload?.message || 'Failed to update profile';
    throw new Error(message);
  }

  return payload;
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateUserProfileInput) => updateUserProfileRequest(data),
    onSuccess: () => {
      // If you later add a user/profile query, invalidate here to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });
}
