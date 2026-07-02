import sodium from "libsodium-wrappers";
import { Octokit } from "@octokit/rest";

export async function updateSessionSecret(session){

    await sodium.ready;

    const octokit = new Octokit({
        auth: process.env.GITHUB_PAT
    });

    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;

    const key = await octokit.actions.getRepoPublicKey({
        owner,
        repo
    });

    const encrypted = sodium.crypto_box_seal(
        Buffer.from(session),
        Buffer.from(key.data.key, "base64")
    );

    await octokit.actions.createOrUpdateRepoSecret({

        owner,

        repo,

        secret_name: "SESSION",

        encrypted_value: Buffer.from(encrypted).toString("base64"),

        key_id: key.data.key_id

    });

    console.log("SESSION Secret 已更新");
}
