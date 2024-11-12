import {paths} from "./v1";
import createClient from "openapi-fetch";
import createQueryClient from "openapi-react-query";

export const apiClient = createClient<paths>({
    baseUrl: import.meta.env.DEV ? "http://localhost:8080/api/" : "api/",
})

export const $api = createQueryClient(apiClient);