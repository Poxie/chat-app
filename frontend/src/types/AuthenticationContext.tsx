export interface AuthenticationContext {
    user: ContextUser;
}
export interface ContextUser {
    username: string;
    id?: string;
}