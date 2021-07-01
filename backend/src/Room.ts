import { Users } from "./User";

type Status = 'hide' | 'show';

export interface Room {
    room: string;
    users: Users;
    status: Status;
}

export type Rooms = Room[];