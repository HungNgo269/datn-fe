module.exports = {
  client: {
    input: "http://localhost:3000/api-json",
    output: {
      target: "./app/api/client",
      client: "react-query",
      mode: "tags-split",
      prettier: true,
      override: {
        mutator: {
          path: "./lib/custom-fetch-client.ts",
          name: "customFetchClient",
        },
        query: {
          useQuery: true,
          useMutation: true,
          signal: true,
        },
      },
    },
  },

  server: {
    input: "http://localhost:3000/api-json",
    output: {
      target: "./app/api/server",
      client: "fetch",
      mode: "tags-split",
      prettier: true,
      override: {
        mutator: {
          path: "./lib/custom-fetch-server.ts",
          name: "customFetchServer",
        },
      },
    },
  },
};
