import { useQuery } from "@tanstack/react-query";

export interface VersionInfo {
  current: string;
  latest: string | null;
  updateAvailable: boolean;
  repo: string;
  error?: string;
}

const MINUTE = 1000 * 60;

export function useVersionCheck() {
  return useQuery<VersionInfo>({
    queryKey: ["app", "version"],
    queryFn: async () => {
      const res = await fetch("/api/version");
      if (!res.ok) {
        throw new Error("Failed to check for updates");
      }
      return res.json();
    },
    staleTime: MINUTE * 15,
    refetchInterval: MINUTE * 30,
    refetchOnWindowFocus: true,
    retry: 1,
  });
}
