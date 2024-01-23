
export default interface DbLink {
    [dbTypeName: string]: {
        [connectionName: string]: {connectionLink:string, server:string};
    };
}

;