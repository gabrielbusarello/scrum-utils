export enum Action {
    Vote,
    Toggle,
    DeleteVotes,
    ClearRoom
}

export interface VoteMessage {
    action: Action;
    vote: number;
}