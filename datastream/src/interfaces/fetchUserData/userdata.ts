import DbLink from "../schemas/dbLink";

export default interface UserData {
    userName:string | undefined,
    databaseConnections: DbLink
}