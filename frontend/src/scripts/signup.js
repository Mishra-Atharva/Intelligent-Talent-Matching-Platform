import { apiRegister } from "./api.js";

// Calls the register endpoint and returns the new user object or null
// The API only takes first_name and last_name, so we split the name here
export async function signup(firstName, lastName, email, password)
{
    const result = await apiRegister(email, password, firstName, lastName);
    return result;
}