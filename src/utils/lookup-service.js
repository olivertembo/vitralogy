import { CUSTOMER_API_ROOT } from "../constants/api";
import client from "./api-client";  

const LOOKUP_API_ROOT = `${CUSTOMER_API_ROOT}api/lookup`;

export default class LookupService {
    static getUserAccounts(registeredOnly){
        return client(`${LOOKUP_API_ROOT}/user-accounts/${registeredOnly}`)
        .catch(error => Promise.reject(error))
    }
}
