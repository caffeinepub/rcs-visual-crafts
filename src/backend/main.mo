import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // User Profiles
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Clients
  public type Client = {
    id : Nat;
    name : Text;
    address : Text;
    contactPerson : Text;
    email : Text;
    phone : Text;
    notes : Text;
  };

  module Client {
    public func compare(client1 : Client, client2 : Client) : Order.Order {
      Nat.compare(client1.id, client2.id);
    };

    public func compareByName(client1 : Client, client2 : Client) : Order.Order {
      Text.compare(client1.name, client2.name);
    };
  };

  let clients = Map.empty<Nat, Client>();
  var nextClientId = 1;

  public shared ({ caller }) func addClient(client : Client) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add clients");
    };
    let newClient = {
      client with id = nextClientId;
    };
    clients.add(nextClientId, newClient);
    nextClientId += 1;
  };

  public shared ({ caller }) func updateClient(id : Nat, client : Client) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update clients");
    };
    if (not clients.containsKey(id)) {
      Runtime.trap("Client not found");
    };
    clients.add(id, client);
  };

  public shared ({ caller }) func deleteClient(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete clients");
    };
    if (not clients.containsKey(id)) {
      Runtime.trap("Client not found");
    };
    clients.remove(id);
  };

  public query ({ caller }) func getClientsOrderedByName() : async [Client] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view clients");
    };
    clients.values().toArray().sort(Client.compareByName);
  };

  public query ({ caller }) func getClientsOrderedById() : async [Client] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view clients");
    };
    clients.values().toArray().sort();
  };

  // Orders
  public type Order = {
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

  module OrderModule {
    public func compare(order1 : Order, order2 : Order) : Order.Order {
      Nat.compare(order1.id, order2.id);
    };
  };

  let orders = Map.empty<Nat, Order>();
  var nextOrderId = 1;

  public shared ({ caller }) func addOrder(order : Order) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add orders");
    };
    let newOrder = {
      order with id = nextOrderId;
    };
    orders.add(nextOrderId, newOrder);
    nextOrderId += 1;
  };

  public shared ({ caller }) func updateOrder(id : Nat, order : Order) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update orders");
    };
    if (not orders.containsKey(id)) {
      Runtime.trap("Order not found");
    };
    orders.add(id, order);
  };

  public shared ({ caller }) func deleteOrder(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete orders");
    };
    if (not orders.containsKey(id)) {
      Runtime.trap("Order not found");
    };
    orders.remove(id);
  };

  public query ({ caller }) func getOrdersByClient(clientId : Nat) : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };
    let filteredOrders = orders.values().filter(
      func(order) {
        order.clientId == clientId;
      }
    );
    filteredOrders.toArray();
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };
    orders.values().toArray().sort();
  };

  // Daily Entries
  public type DailyEntry = {
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

  let dailyEntries = Map.empty<Nat, DailyEntry>();
  var nextEntryId = 1;

  public shared ({ caller }) func addDailyEntry(entry : DailyEntry) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add daily entries");
    };
    let newEntry = {
      entry with id = nextEntryId;
    };
    dailyEntries.add(nextEntryId, newEntry);
    nextEntryId += 1;
  };

  public shared ({ caller }) func updateDailyEntry(id : Nat, entry : DailyEntry) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update daily entries");
    };
    if (not dailyEntries.containsKey(id)) {
      Runtime.trap("Daily entry not found");
    };
    dailyEntries.add(id, entry);
  };

  public shared ({ caller }) func deleteDailyEntry(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete daily entries");
    };
    if (not dailyEntries.containsKey(id)) {
      Runtime.trap("Daily entry not found");
    };
    dailyEntries.remove(id);
  };

  public query ({ caller }) func getAllDailyEntries() : async [DailyEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view daily entries");
    };
    dailyEntries.values().toArray();
  };

  // Assets
  public type Asset = {
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

  let assets = Map.empty<Nat, Asset>();
  var nextAssetId = 1;

  public shared ({ caller }) func addAsset(asset : Asset) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add assets");
    };
    let newAsset = {
      asset with id = nextAssetId;
    };
    assets.add(nextAssetId, newAsset);
    nextAssetId += 1;
  };

  public shared ({ caller }) func updateAsset(id : Nat, asset : Asset) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update assets");
    };
    if (not assets.containsKey(id)) {
      Runtime.trap("Asset not found");
    };
    assets.add(id, asset);
  };

  public shared ({ caller }) func deleteAsset(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete assets");
    };
    if (not assets.containsKey(id)) {
      Runtime.trap("Asset not found");
    };
    assets.remove(id);
  };

  public query ({ caller }) func getAllAssets() : async [Asset] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view assets");
    };
    assets.values().toArray();
  };

  // Documents (New)
  public type Document = {
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

  let documents = Map.empty<Nat, Document>();
  var nextDocumentId = 1;

  public shared ({ caller }) func addDocument(name : Text, blob : Storage.ExternalBlob, description : Text, type_ : Text, author : Text, size : Nat, fileType : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add documents");
    };
    let newDocument : Document = {
      id = nextDocumentId;
      name;
      blob;
      description;
      type_;
      author;
      size;
      fileType;
      uploadedAt = 0;
    };
    documents.add(nextDocumentId, newDocument);
    nextDocumentId += 1;
  };

  public shared ({ caller }) func updateDocument(id : Nat, document : Document) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update documents");
    };
    if (not documents.containsKey(id)) {
      Runtime.trap("Document not found");
    };
    documents.add(id, document);
  };

  public shared ({ caller }) func deleteDocument(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete documents");
    };
    if (not documents.containsKey(id)) {
      Runtime.trap("Document not found");
    };
    documents.remove(id);
  };

  public query ({ caller }) func getAllDocuments() : async [Document] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view documents");
    };
    documents.values().toArray();
  };
};
