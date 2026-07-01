import Constants from "expo-constants";
import { Platform } from "react-native";
import {
  Account,
  Client,
  Functions,
  ID,
  Query,
  Storage,
  TablesDB,
} from "react-native-appwrite";

export const APPWRITE_PROJECT_ID = "6a44dc7900261b35d50f";
export const APPWRITE_ENDPOINT = "https://api2.gengraphic.de/v1";

const isExpoGo = Constants.executionEnvironment === "storeClient";
const APPWRITE_PLATFORM = isExpoGo
  ? Platform.OS === "android"
    ? "host.exp.exponent"
    : "host.exp.Exponent"
  : "com.gengraphic.agolog";

export const appwriteClient = new Client()
  .setProject(APPWRITE_PROJECT_ID)
  .setEndpoint(APPWRITE_ENDPOINT)
  .setPlatform(APPWRITE_PLATFORM);

export const db = new TablesDB(appwriteClient);
export const auth = new Account(appwriteClient);
export const functions = new Functions(appwriteClient);
export const storage = new Storage(appwriteClient);
export const idGen = ID;
export const query = Query;

//DB id's
export const DB_ID = "68ba4da4001145a3a851";

//Table id's
export const USERS_TABLE_ID = "697c28da000f3f78bafd";
export const ENTRIES_TABLE_ID = "69d5dbd80021364ce602";
export const NOTIFICATIONS_TABLE_ID = "69d78d63001584d54dc5";
export const ASSETS_TABLE_ID = "69f080670032568d5dd0";

//Storage bucket id's
export const ENTRIES_IMAGES_BUCKET_ID = "69d5e39f00247e5da26f";

//Functions id's
export const HANDLE_ENTRY_IMAGE = "69d669cf0017ac725ee9";