export type SignupState = {
    uid: string;
    name: string;
    email: string;
    UIDError: string | null;
    errors: Record<string, string[]> | null;
    redirect: boolean;
    isLoading: boolean;
}