import { CommunicationControl } from "../External/communication.js";
import { Configurations } from "../config.js";
import { CredentialsModule } from "../External/credentials.js";
import { PivotType } from "../Generic/render.js";
import { TextElement } from "../Ui/ui-elements.js";
import { Vector, VectorSpeed } from "../Generic/vector.js";

export interface ScoreboardParameters {
    userData: CredentialsModule.UserData;
    position: Vector;
}

export class Scoreboard {
    public async buildBoard(parameters: ScoreboardParameters): Promise<Array<TextElement>> {
        let texts = [] as TextElement[];
        let usersScore = [];

        if (Configurations.Game.enableCredentials) {
            usersScore = await CommunicationControl.getScores();
        } else {
            usersScore = hardScores;
        }

        let x =
            parameters.position.x -
            (Configurations.Scoreboard.collumn1 +
                Configurations.Scoreboard.collumn2 +
                Configurations.Scoreboard.collumn3 +
                Configurations.Scoreboard.collumnSpace * 2) /
                2;
        let y = parameters.position.y;

        const fontFamily = "Arial";
        const fontSize = 18;

        const coll1 = x;
        const coll2 = coll1 + Configurations.Scoreboard.collumn1 + Configurations.Scoreboard.collumnSpace;
        const coll3 = coll2 + Configurations.Scoreboard.collumn2 + Configurations.Scoreboard.collumnSpace;

        for (let i = 0; i < usersScore.length; i++) {
            const score = usersScore[i];
            let fontColor = "white";

            if (score.self || i == 10) {
                fontColor = "yellow";
                if (i == 10) {
                    y += Configurations.Scoreboard.lineSpace;
                }
            }

            //Index / Collumn 1
            texts.push(
                new TextElement({
                    position: { x: coll1, y: y },
                    velocity: new VectorSpeed({ x: 0, y: 0 }, 0),
                    color: fontColor,
                    size: fontSize,
                    font: fontFamily,
                    pivotType: PivotType.origin,
                    content: `${score.index}.`,
                })
            );

            //Name / Collumn 2
            texts.push(
                new TextElement({
                    position: { x: coll2, y: y },
                    velocity: new VectorSpeed({ x: 0, y: 0 }, 0),
                    color: fontColor,
                    size: fontSize,
                    font: fontFamily,
                    pivotType: PivotType.origin,
                    content: score.userName,
                })
            );

            //Amount / Collumn 3
            texts.push(
                new TextElement({
                    position: { x: coll3, y: y },
                    velocity: new VectorSpeed({ x: 0, y: 0 }, 0),
                    color: fontColor,
                    size: fontSize,
                    font: fontFamily,
                    pivotType: PivotType.origin,
                    content: score.amount.toString(),
                })
            );

            y += Configurations.Scoreboard.lineSpace;
        }

        return texts;
    }
}

const hardScores = [
    { index: 1, userName: "AAA", amount: "99999", self: false },
    { index: 2, userName: "BBB", amount: "88888", self: false },
    { index: 3, userName: "CCC", amount: "77777", self: false },
    { index: 4, userName: "DDD", amount: "66666", self: false },
    { index: 5, userName: "EEE", amount: "55555", self: false },
    { index: 6, userName: "FFF", amount: "44444", self: false },
    { index: 7, userName: "GGG", amount: "33333", self: false },
    { index: 8, userName: "HHH", amount: "2222", self: false },
    { index: 9, userName: "III", amount: "1111", self: false },
    { index: 10, userName: "JJJ", amount: "1100", self: false },
    { index: 99, userName: "???", amount: "100", self: true },
];
