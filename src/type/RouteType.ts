import { RouteRecordRaw } from 'vue-router';
interface isSubDirectory {
    isSubDirectory?: string;
}
export declare type RouteRecordRawWithSubDirectory = RouteRecordRaw & isSubDirectory
