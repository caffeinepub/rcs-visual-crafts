import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Asset {
    id: bigint;
    purchaseDate: bigint;
    supplier: string;
    name: string;
    type: string;
    description: string;
    lifespan: bigint;
    currency: string;
    amountInCurrency: number;
}
export interface ApkDownloadInfo {
    url: string;
    diskFile: ExternalBlob;
    version: string;
}
export interface Document {
    id: bigint;
    blob: ExternalBlob;
    name: string;
    size: bigint;
    type: string;
    description: string;
    fileType: string;
    author: string;
    uploadedAt: bigint;
}
export interface DailyEntry {
    id: bigint;
    expenseType: string;
    relatedClientId?: bigint;
    entryType: string;
    bankAccount: string;
    date: bigint;
    description: string;
    currency: string;
    incomeType: string;
    notes: string;
    paymentType: string;
    relatedOrderId?: bigint;
    amount: number;
    receiptNumber: string;
}
export interface Client {
    id: bigint;
    name: string;
    contactPerson: string;
    email: string;
    address: string;
    notes: string;
    phone: string;
}
export interface Order {
    id: bigint;
    status: string;
    clientId?: bigint;
    dueDate: bigint;
    description: string;
    deposit: number;
    invoiceNumber: string;
    remainingBalance: number;
    currency: string;
    amount: number;
    startDate: bigint;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAsset(asset: Asset): Promise<bigint>;
    addClient(client: Client): Promise<bigint>;
    addDailyEntry(entry: DailyEntry): Promise<bigint>;
    addDocument(name: string, blob: ExternalBlob, description: string, type: string, author: string, size: bigint, fileType: string): Promise<bigint>;
    addOrder(order: Order): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteAsset(id: bigint): Promise<void>;
    deleteClient(id: bigint): Promise<void>;
    deleteDailyEntry(id: bigint): Promise<void>;
    deleteDocument(id: bigint): Promise<void>;
    deleteOrder(id: bigint): Promise<void>;
    getAllAssets(): Promise<Array<Asset>>;
    getAllDailyEntries(): Promise<Array<DailyEntry>>;
    getAllDocuments(): Promise<Array<Document>>;
    getAllOrders(): Promise<Array<Order>>;
    getApkDownloadInfo(): Promise<ApkDownloadInfo | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getClientsOrderedById(): Promise<Array<Client>>;
    getClientsOrderedByName(): Promise<Array<Client>>;
    getOrdersByClient(clientId: bigint): Promise<Array<Order>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateApkDownloadInfo(newInfo: ApkDownloadInfo): Promise<void>;
    updateAsset(id: bigint, asset: Asset): Promise<void>;
    updateClient(id: bigint, client: Client): Promise<void>;
    updateDailyEntry(id: bigint, entry: DailyEntry): Promise<void>;
    updateDocument(id: bigint, document: Document): Promise<void>;
    updateOrder(id: bigint, order: Order): Promise<void>;
}
