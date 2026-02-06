import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
  type OldActor = {
    // User Profiles
    userProfiles : Map.Map<Principal, OldUserProfile>;
    // Clients
    clients : Map.Map<Nat, OldClient>;
    nextClientId : Nat;
    // Orders
    orders : Map.Map<Nat, OldOrder>;
    nextOrderId : Nat;
    // Daily Entries
    dailyEntries : Map.Map<Nat, OldDailyEntry>;
    nextEntryId : Nat;
    // Assets
    assets : Map.Map<Nat, OldAsset>;
    nextAssetId : Nat;
  };

  type OldUserProfile = {
    name : Text;
  };

  type OldClient = {
    id : Nat;
    name : Text;
    address : Text;
    contactPerson : Text;
    email : Text;
    phone : Text;
    notes : Text;
  };

  type OldOrder = {
    id : Nat;
    clientId : Nat;
    description : Text;
    status : Text;
    invoiceNumber : Text;
    amount : Float;
    currency : Text;
    deposit : Float;
    remainingBalance : Float;
    startDate : Int;
    dueDate : Int;
  };

  type OldDailyEntry = {
    id : Nat;
    amount : Float;
    description : Text;
    currency : Text;
    entryType : Text; // "Ein" or "Aus"
    relatedClientId : ?Nat;
    relatedOrderId : ?Nat;
    expenseType : Text;
    incomeType : Text;
    paymentType : Text;
    date : Nat;
    receiptNumber : Text;
    bankAccount : Text;
    notes : Text;
  };

  type OldAsset = {
    id : Nat;
    name : Text;
    type_ : Text;
    supplier : Text;
    amountInCurrency : Float;
    currency : Text;
    purchaseDate : Int;
    description : Text;
    lifespan : Int;
  };

  type NewActor = {
    // User Profiles
    userProfiles : Map.Map<Principal, OldUserProfile>;
    // Clients
    clients : Map.Map<Nat, OldClient>;
    nextClientId : Nat;
    // Orders
    orders : Map.Map<Nat, OldOrder>;
    nextOrderId : Nat;
    // Daily Entries
    dailyEntries : Map.Map<Nat, OldDailyEntry>;
    nextEntryId : Nat;
    // Assets
    assets : Map.Map<Nat, OldAsset>;
    nextAssetId : Nat;
    // Documents (New)
    documents : Map.Map<Nat, Document>;
    nextDocumentId : Nat;
  };

  type Document = {
    id : Nat;
    name : Text;
    blob : Storage.ExternalBlob;
    description : Text;
    type_ : Text;
    author : Text;
    size : Nat;
    fileType : Text;
    uploadedAt : Int;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      documents = Map.empty<Nat, Document>();
      nextDocumentId = 1;
    };
  };
};
