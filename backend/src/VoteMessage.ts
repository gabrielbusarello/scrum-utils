export enum Action {
    Authenticate,
    Vote,
    Toggle,
    DeleteVotes,
    ClearRoom
}

export interface VoteMessage {
    action: Action;
    vote: number;
}