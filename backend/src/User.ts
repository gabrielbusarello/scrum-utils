type Role = 'admin' | 'user';

export interface User {
    username: string;
    vote?: number | null;
    role: Role;
}

export type Users = User[];