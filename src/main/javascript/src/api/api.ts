import {paths} from "./v1";
import createClient from "openapi-fetch";
import createQueryClient from "openapi-react-query";

export const apiClient = createClient<paths>({
    baseUrl: "http://localhost:8080/api/",
})

export const $api = createQueryClient(apiClient);