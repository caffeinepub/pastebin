import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Paste {
    id: PasteId;
    title: string;
    content: string;
    createdAt: Time;
    author: Principal;
}
export type Time = bigint;
export interface PasteSummary {
    id: PasteId;
    title: string;
    createdAt: Time;
    author: Principal;
}
export interface UserProfile {
    name: string;
}
export type PasteId = bigint;
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createPaste(title: string, content: string): Promise<PasteId>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPaste(id: PasteId): Promise<Paste | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listPastes(): Promise<Array<PasteSummary>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
