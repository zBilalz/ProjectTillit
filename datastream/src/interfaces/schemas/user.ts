import DbLink from "./dbLink";

export default interface User {
    username:string,
    email:string,
    password:string,
    dbLinks:DbLink,
    salt: CryptoJS.lib.WordArray
}