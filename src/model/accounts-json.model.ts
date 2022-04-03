import {Account} from "./account.model";

export class AccountsJson {

    public readonly accounts: Account[];

    constructor(accounts: Account[]) {
        this.accounts = accounts;
    }
}
