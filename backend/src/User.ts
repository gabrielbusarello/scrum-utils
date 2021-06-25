type Role = 'admin' | 'user';

export interface User {
    username: string;
    vote?: string | null;
    role: Role;
}

export type Users = User[];