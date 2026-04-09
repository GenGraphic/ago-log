import { Account, Client, Functions, ID, Query, Storage, TablesDB } from "react-native-appwrite";

const client = new Client()
    .setProject("68ba4c3f002c9e51046a")
    .setEndpoint("https://gengraphic.de/v1")
    .setPlatform("com.gengraphic.agolog");

export const db = new TablesDB(client);
export const auth = new Account(client);
export const functions = new Functions(client);
export const storage = new Storage(client);
export const idGen = ID;
export const query = Query;

//DB id's
export const DB_ID = "68ba4da4001145a3a851";

//Table id's
export const USERS_TABLE_ID = "697c28da000f3f78bafd";
export const ENTRIES_TABLE_ID = "69d5dbd80021364ce602";
export const NOTIFICATIONS_TABLE_ID = "69d78d63001584d54dc5";

//Storage bucket id's
export const ENTRIES_IMAGES_BUCKET_ID = "69d5e39f00247e5da26f";

//Functions id's
export const HANDLE_ENTRY_IMAGE = "69d669cf0017ac725ee9"; 

