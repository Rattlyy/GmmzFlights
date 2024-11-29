
import createClient from "openapi-fetch";
import createQueryClient from "openapi-react-query";
import {paths as api} from "@/api/slashapi";
import {paths as privat} from "@/api/private";

export const apiClient = createClient<api>({
    baseUrl: import.meta.env.DEV ? "http://localhost:8080/api/" : "api/",
})

export const privateClient = createClient<privat>({
    baseUrl: import.meta.env.DEV ? "http://localhost:8080/private/" : "private/",
})

export const $api = createQueryClient(apiClient);