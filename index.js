import inquirer from "inquirer";
import { Chalk } from "chalk";
import { exec } from "child_process";
import * as fs from "fs";

const chalk = new Chalk({ level: 3 });

const questions = [
    {
        type: "input",
        name: "version",
        message: "New version: ",
    }, // new version
    {
        type: "confirm",
        name: "gitConfirm",
        message: "Would you like to create a git tag along with this version?",
    }, // use make git tag
    {
        type: "confirm",
        name: "npmConfirm",
        message: "Would you like to publish this version to npm?",
    }
];

const gitQuestions = [
    {
        type: "confirm",
        name: "tagSign",
        message: "Would you like to sign this git tag?",
    }, // sign git tag
    {
        type: "confirm",
        name: "tagPush",
        message: "Would you like to push this git tag?",
    }, // push git tag
];

const run = async () => {
    const { version, gitConfirm, npmConfirm } = await inquirer.prompt(questions);
    const data = JSON.parse(fs.readFileSync("./package.json", "utf8"));
    data.version = version;
    fs.writeFileSync("./package.json", JSON.stringify(data, null, 2));
    console.log(chalk.green(`Updated package.json to v${version}`));
    if (npmConfirm) {
        console.log(`Publishing to npm...`);
        exec(`npm publish`);
    }
    if (gitConfirm) {
        exec(`git add package.json && git commit -am "update to v${version}"`)
        const { tagSign, tagPush } = await inquirer.prompt(gitQuestions);
        const versionString = chalk.green(`v${version}`);
        console.log(`Creating git tag ${versionString}...`);
        exec(`git tag ${tagSign ? "-s" : ""} v${version}`);
        if (tagPush) {
            console.log(`Pushing git tag ${versionString}...`);
            exec(`git push --tags`);
        }
    }
}

run();
