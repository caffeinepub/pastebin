import List "mo:core/List";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  // Types
  type PasteId = Nat;

  type Paste = {
    id : PasteId;
    title : Text;
    content : Text;
    author : Principal;
    createdAt : Time.Time;
  };

  type PasteSummary = {
    id : PasteId;
    title : Text;
    author : Principal;
    createdAt : Time.Time;
  };

  public type UserProfile = {
    name : Text;
  };

  module Paste {
    public func compareByCreatedAtDesc(paste1 : Paste, paste2 : Paste) : Order.Order {
      Int.compare(paste2.createdAt, paste1.createdAt);
    };
  };

  var nextPasteId = 0;
  let pastes = Map.empty<PasteId, Paste>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
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

  // Create paste (authenticated users only)
  public shared ({ caller }) func createPaste(title : Text, content : Text) : async PasteId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create pastes");
    };

    let id = nextPasteId;
    nextPasteId += 1;

    let paste : Paste = {
      id;
      title;
      content;
      author = caller;
      createdAt = Time.now();
    };

    pastes.add(id, paste);
    id;
  };

  // Batch create pastes (authenticated users only)
  type PasteInput = {
    title : Text;
    content : Text;
  };

  public shared ({ caller }) func createPasteBatch(inputs : [PasteInput]) : async [PasteId] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create pastes");
    };

    let ids = List.empty<PasteId>();
    for (input in inputs.values()) {
      let id = nextPasteId;
      nextPasteId += 1;

      let paste : Paste = {
        id;
        title = input.title;
        content = input.content;
        author = caller;
        createdAt = Time.now();
      };

      pastes.add(id, paste);
      ids.add(id);
    };
    ids.toArray();
  };

  // Get paste by ID (public - no authentication required)
  public query func getPaste(id : PasteId) : async ?Paste {
    pastes.get(id);
  };

  // List all pastes (public - no authentication required)
  public query func listPastes() : async [PasteSummary] {
    pastes.values().toArray().sort(Paste.compareByCreatedAtDesc).map(
      func(paste) {
        {
          id = paste.id;
          title = paste.title;
          author = paste.author;
          createdAt = paste.createdAt;
        };
      }
    );
  };
};
