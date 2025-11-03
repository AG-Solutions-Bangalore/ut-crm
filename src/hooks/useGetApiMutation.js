// import { useQuery } from "@tanstack/react-query";
// import { useApiMutation } from "./useApiMutation";

// export function useGetApiMutation({
//   url,
//   queryKey = ["getQuery"],
//   params = null,
//   options = {},
// }) {
//   const { trigger, loading, error } = useApiMutation();

//   const query = useQuery({
//     queryKey: queryKey,
//     queryFn: async () => {
//       const response = await trigger({
//         url,
//         method: "get",
//         params,
//       });
//       return response ?? response;
//     },
//     ...options,
//   });

//   return {
//     ...query,
//     loading,
//     error,
//   };
// }
import { useQuery } from "@tanstack/react-query";
import { useApiMutation } from "./useApiMutation";

export function useGetApiMutation({
  url,
  queryKey = ["getQuery"],
  params = null,
  options = {},
  staleTime = 1000 * 60 * 5,
}) {
  const { trigger } = useApiMutation();

  const query = useQuery({
    queryKey: [...queryKey, params],
    queryFn: async () => {
      const response = await trigger({
        url,
        method: "get",
        params,
      });
      return response;
    },
    staleTime,
    refetchOnWindowFocus: false,
    retry: 1,
    ...options,
  });

  return query;
}
