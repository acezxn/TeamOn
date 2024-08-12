import { httpsCallable } from "firebase/functions";
import { Octokit } from "@octokit/core";
import { functions } from "./firebase";


export default class DatabaseManager {
    static #octokit = null;
    static initializeOctokit(token) {
        DatabaseManager.#octokit = new Octokit({ auth: token });
    }

    static getOctokit() {
        return DatabaseManager.#octokit;
    }
}

DatabaseManager.UserManager = class {
    /**
     * Creates user data, including both public and private user data
     *
     * @static
     * @memberof Database
     */
    static async createUserData() {
        const callCloudFunction = httpsCallable(functions, "userManager-createUserData");
        await callCloudFunction();
    }

    static async getGithubAccessToken() {
        const callCloudFunction = httpsCallable(functions, "userManager-getGithubAccessToken");
        return (await callCloudFunction()).data;
    }

    static async updateGithubAccessToken(ghToken) {
        const callCloudFunction = httpsCallable(functions, "userManager-updateGithubAccessToken");
        await callCloudFunction({ ghToken: ghToken });
    }

    static async checkIsMember(teamId) {
        const callCloudFunction = httpsCallable(functions, "userManager-checkIsMember");
        return (await callCloudFunction({ teamId: teamId })).data;
    }
}

DatabaseManager.TeamManager = class {
    static async createTeam() {
        const callCloudFunction = httpsCallable(functions, "teamManager-createTeam");
        return (await callCloudFunction()).data;
    }

    static async removeTeam(teamId) {
        const callCloudFunction = httpsCallable(functions, "teamManager-removeTeam");
        return (await callCloudFunction({teamId: teamId})).data;
    }
}

DatabaseManager.TeamManager.MessageManager = class {
    static async deleteMessage(id) {
        const callCloudFunction = httpsCallable(functions, "teamManager-messageManager-removeTeam");
        return (await callCloudFunction({messageId: id})).data;
    }

    static async removeMessageAttachment(url, messageId) {
        const callCloudFunction = httpsCallable(functions, "teamManager-messageManager-removeMessageAttachment");
        await callCloudFunction({ url: url, messageId: messageId });
    }
}
