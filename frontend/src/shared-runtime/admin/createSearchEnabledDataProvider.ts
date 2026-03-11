import type {
  CreateParams,
  DataProvider,
  DeleteParams,
  GetListParams,
  GetManyParams,
  GetManyReferenceParams,
  GetOneParams,
  UpdateParams,
} from "react-admin";
import type { AdminSchema } from "./resourceMetadata";

function jsonHeaders() {
  return {
    "Content-Type": "application/vnd.api+json",
    Accept: "application/vnd.api+json",
  };
}

function getEndpoint(schema: AdminSchema, resource: string) {
  return schema.resources[resource]?.endpoint ?? `/api/${resource}`;
}

async function request(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json();
}

function mapRecord(item: any) {
  return {
    id: item.id,
    ...item.attributes,
    ...(item.relationships || {}),
  };
}

export function createSearchEnabledDataProvider(
  schema: AdminSchema,
  _apiRoot: string,
): DataProvider {
  const provider: DataProvider = {
    async getList(resource: string, params: GetListParams) {
      const endpoint = `${getEndpoint(schema, resource)}?page[number]=${params.pagination?.page ?? 1}&page[size]=${params.pagination?.perPage ?? 25}`;
      const json = await request(endpoint);
      return {
        data: (json.data || []).map(mapRecord),
        total: Number(json.meta?.count ?? json.data?.length ?? 0),
      };
    },

    async getOne(resource: string, params: GetOneParams) {
      const json = await request(`${getEndpoint(schema, resource)}/${params.id}`);
      return { data: mapRecord(json.data) };
    },

    async getMany(resource: string, params: GetManyParams) {
      const data = await Promise.all(
        params.ids.map(async (id) => {
          const json = await request(`${getEndpoint(schema, resource)}/${id}`);
          return mapRecord(json.data);
        }),
      );
      return { data };
    },

    async getManyReference(resource: string, params: GetManyReferenceParams) {
      return provider.getList(resource, {
        ...params,
        filter: { ...params.filter, [params.target]: params.id },
      });
    },

    async create(resource: string, params: CreateParams) {
      const json = await request(getEndpoint(schema, resource), {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify({
          data: {
            type: resource,
            attributes: params.data,
          },
        }),
      });
      return { data: mapRecord(json.data) };
    },

    async update(resource: string, params: UpdateParams) {
      const json = await request(`${getEndpoint(schema, resource)}/${params.id}`, {
        method: "PATCH",
        headers: jsonHeaders(),
        body: JSON.stringify({
          data: {
            id: params.id,
            type: resource,
            attributes: params.data,
          },
        }),
      });
      return { data: mapRecord(json.data) };
    },

    async delete(resource: string, params: DeleteParams) {
      await request(`${getEndpoint(schema, resource)}/${params.id}`, {
        method: "DELETE",
        headers: jsonHeaders(),
      });
      return { data: { id: params.id } };
    },

    updateMany: async () => ({ data: [] }),
    deleteMany: async () => ({ data: [] }),
  };

  return provider;
}
