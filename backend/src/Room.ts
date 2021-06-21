import { Users } from "./User";

interface Room {
    room: string;
    users: Users;
}

export type Rooms = Room[];