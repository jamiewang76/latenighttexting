const IGNORED_PROPERTIES = ['calibration', 'orientationMatrix', 'receivedAt'];

const BAR_WIDTH = 25;
const SUBGRAPH_HEIGHT = 300;

const PALETTE = ['red', 'green', 'blue', 'gray', 'orange', 'pink'];

let sensorData = {};
let ranges = {}; // sensor name => [min, max] observed range
let freeze = false;
let step = false;

function setup() {
    createCanvas(windowWidth, windowHeight);
    imuConnection.onSensorData(({ data }) => {
        sensorData = { ...data };
    });
    const button = createButton('Freeze');
    button.position(100, 0);
    button.mousePressed(() => {
        freeze = !freeze;
        if (freeze) {
            button.elt.innerText = 'Resume';
            stepButton.show();
        } else {
            button.elt.innerText = 'Freeze';
            stepButton.hide();
        }
    });
    const stepButton = createButton('Sample');
    stepButton.position(170, 0);
    stepButton.mousePressed(() => {
        step = true;
    });
    stepButton.hide();
}

function draw() {
    //console.log(sensorData);
    background('white');
    noStroke();

    let subgraphX = 10;
    let subgraphY = 10;
    const keys = Object.keys(sensorData)
        .filter((name) => !IGNORED_PROPERTIES.includes(name))
        .sort();
    //console.log(keys);
   if(sensorData.euler!=undefined){
    if (sensorData.euler[0]>=-65){
        console.log("texting");
    }else{
        console.log("sleep");
    }
   }
    

    keys.forEach((key, i) => {
        let values = sensorData[key];
        if (!Array.isArray(values)) {
            values = [values];
        }

        const subgraphWidth = values.length * (BAR_WIDTH + 2);
        if (subgraphX + subgraphWidth > width) {
            subgraphX = 10;
            subgraphY += SUBGRAPH_HEIGHT + 85;
        }
        push();
        translate(subgraphX, subgraphY);
        barChart(key, values, PALETTE[i % PALETTE.length]);
        pop();

        subgraphX += subgraphWidth + 50;
    });
    // if (sensorData.euler[0]>=-65){
    //     console.log("texting");
    // }else{
    //     console.log("sleep");
    // }
}

function barChart(key, values, barColor) {
    //console.log(values);
    //console.log(values[0]);
    const label = capitalize(key);

    // update the running max and min from the new values
    let [min, max] = ranges[key] || [0, 0];
    min = Math.min.apply(null, values.concat([min]));
    max = Math.max.apply(null, values.concat([max]));
    ranges[key] = [min, max];

    fill('gray');
    textSize(9);
    text(`${formatPrecision(min)}…${formatPrecision(max)}`, 0, 25);

    fill(barColor);
    textSize(14);
    text(label, 0, SUBGRAPH_HEIGHT + 80);
    textSize(9);
    values.forEach((v, i) => {
        //console.log(v);
       
        const x = i * (BAR_WIDTH + 2);
        const yMid = SUBGRAPH_HEIGHT / 2 + 25;
        const height = (v * SUBGRAPH_HEIGHT) / 2 / Math.max(-min, max);
        rect(x, yMid - 0.5, BAR_WIDTH, 1);
        rect(x, yMid, BAR_WIDTH, height);
        push();
        translate(x, SUBGRAPH_HEIGHT + 40);
        angleMode(DEGREES);
        rotate(60);
        text(formatPrecision(v), 0, 0);
        pop();
    });
}

/** Capitalize the first letter, e.g. "euler" => "Euler" */
function capitalize(str) {
    return str && str[0].toUpperCase() + str.slice(1);
}

/** Format to two decimals, e.g. 123.345 => "123.45" */
function formatPrecision(n) {
    return String(n).replace(/(\.\d\d)\d+/, '$1');
}
