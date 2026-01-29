import { Account, Client, Databases, Functions, ID, Query } from "react-native-appwrite";

const client = new Client()
    .setProject("68ba4c3f002c9e51046a")
    .setEndpoint("https://gengraphic.de/v1")
    .setPlatform("com.gengraphic.agolog");

export const db = new Databases(client);
export const auth = new Account(client);
export const functions = new Functions(client);
export const idGen = ID;
export const query = Query;

//DB id's
const DB_ID = "68ba4da4001145a3a851";

//Collections id's
