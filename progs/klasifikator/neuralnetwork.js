class NeuralNetwork {

    constructor(neuronCountsByLayer /* sprejme array številk */) {
        this.levels = [];
        for (let i = 0; i < neuronCountsByLayer.length - 1; i++) {
            const isFirstLevel = i == 0 ? true : false;
            this.levels.push(
                new Level(neuronCountsByLayer[i], neuronCountsByLayer[i + 1], isFirstLevel)
            );
        }
    }

    // to feeda od začetnih inputov, potem skozi levele in do končnih outputov;
    static feedForward(givenInputs, network) {
        let outputs = Level.feedForward(givenInputs, network.levels[0]);
        for (let i = 1; i < network.levels.length; i++) {
            outputs = Level.feedForward(outputs, network.levels[i]);
        }
        /* izvirno tako: */ return outputs;
        // /*to je bla ena moja varianta */ return network.levels[network.levels.length - 1].sums;
    }

    static mutate(network, amount /* od 0 do 1: 0 - ostane isto, 1 - povsem random */) {
        network.levels.forEach(level => {
            for (let i = 0; i < level.biases.length; i++) {
                level.biases[i] = lerp(
                    level.biases[i],
                    Math.random() * 2 - 1,
                    amount
                )
            }
            for (let i = 0; i < level.weights.length; i++) {
                for (let j = 0; j < level.weights[i].length; j++) {
                    level.weights[i][j] = lerp(
                        level.weights[i][j],
                        Math.random() * 2 - 1,
                        amount
                    )
                }
            }
        });
    }

    // dejmo rečt, da bo:
    // - 1 skrit layer
    // - število nevronov na skritem layerju bo: sqrt(input layer nodes * output layer nodes);

}

class Level {
    constructor(inputCount, ouputCount, isFirstLevel) {
        this.inputs = new Array(inputCount);
        this.outputs = new Array(ouputCount);
        this.sums = new Array(ouputCount);
        this.biases = new Array(ouputCount);

        this.weights = [];
        for (let i = 0; i < inputCount; i++) {
            this.weights[i] = new Array(ouputCount);
        }

        Level.#randomize(this, isFirstLevel);
    }

    static #randomize(level, isFirstLevel) {
        // za izdelavo uteži;
        for (let i = 0; i < level.inputs.length; i++) {
            for (let j = 0; j < level.outputs.length; j++) {
                if (isFirstLevel) {
                    if (i != 0) {
                        // vzamemo vrednost iz prvega elementa, da bojo imeli vsi enako;
                        level.weights[i][j] = level.weights[0][j];
                    } else {    // če je i == 0;
                        // *2, da rata obseg od 0 do 2, in potem -1, da je obseg od -1 do +1;
                        level.weights[0][j] = Math.random() * 2 - 1;
                    }
                } else {    // pri levelih, ki niso prvi level, so uteži vseh inputov random (inputi imajo različne uteži);
                    level.weights[i][j] = Math.random() * 2 - 1;
                }
            }
        }

        // za izdelavo biasov;
        for (let i = 0; i < level.biases.length; i++) {
            level.biases[i] = Math.random() * 2 - 1;
        }
    }

    // to feeda od inputov nekega levela do outputov istega levela;
    // given inputs so na prvem nivoju readings od besede;
    static feedForward(
        givenInputs /* array readingov oz. inputi */,
        level /* to poda arhitekturo oz. logiko networka*/) {
        for (let i = 0; i < level.inputs.length; i++) {
            level.inputs[i] = givenInputs[i];
        }

        for (let i = 0; i < level.outputs.length; i++) {
            let sum = 0;
            for (let j = 0; j < level.inputs.length; j++) {
                sum += level.inputs[j] * level.weights[j][i];
            }

            // to se shrani samo za referenco oz za vpogled;
            level.sums[i] = sum;

            if (sum + level.biases[i] >= 0) {
                level.outputs[i] = 1;
            } else {
                level.outputs[i] = 0;
            }
        }
        return level.outputs;
    }

}