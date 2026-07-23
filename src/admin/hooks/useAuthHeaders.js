import { useMemo } from "react";

const useAuthHeaders = (credentials) =>
  useMemo(() => {
    const encodedCredentials = btoa(
      `${credentials.login}:${credentials.password}`,
    );

    return {
      Authorization: `Basic ${encodedCredentials}`,
    };
  }, [credentials.login, credentials.password]);

export default useAuthHeaders;
