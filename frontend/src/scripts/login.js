import { apiLogin } from "./api.js";

// Calls the login endpoint and returns the user object or null
export async function login(email, password)
{
    const result = await apiLogin(email, password);
    return result;
}