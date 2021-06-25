import { Users } from "./User";

export interface Room {
    room: string;
    users: Users;
}

export type Rooms = Room[];