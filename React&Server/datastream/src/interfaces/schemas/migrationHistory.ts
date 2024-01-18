import { ObjectId } from 'mongodb';

export default interface MigrationHistory {
userId?: ObjectId,
startedAt:Date,
endedAt:Date,
sourceDb:string,
destinationDb:string
}