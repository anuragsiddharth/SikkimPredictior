const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path');

let model;
let accuracyHistory = [];
const MODEL_PATH = path.join(__dirname, 'model.json');

// Encode colors to numerical values
const encodeColor = {
  'Red': 0,
  'Green': 1,
  'Violet': 2
};

const decodeColor = ['Red', 'Green', 'Violet'];

// Create and train model
async function createModel() {
  const model = tf.sequential();
  
  model.add(tf.layers.dense({
    units: 64,
    activation: 'relu',
    inputShape: [10] // Last 10 colors as input
  }));
  
  model.add(tf.layers.dropout({ rate: 0.2 }));
  
  model.add(tf.layers.dense({
    units: 32,
    activation: 'relu'
  }));
  
  model.add(tf.layers.dense({
    units: 3, // Output for 3 colors
    activation: 'softmax'
  }));
  
  model.compile({
    optimizer: 'adam',
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy']
  });
  
  return model;
}

// Prepare training data
function prepareData(data) {
  const sequences = [];
  const labels = [];
  
  for (let i = 10; i < data.length; i++) {
    const sequence = data.slice(i - 10, i).map(d => encodeColor[d.color]);
    sequences.push(sequence);
    labels.push(encodeColor[data[i].color]);
  }
  
  return {
    xs: tf.tensor2d(sequences),
    ys: tf.oneHot(tf.tensor1d(labels, 'int32'), 3)
  };
}

// Train the model
async function trainModel(data) {
  if (!model) {
    model = await createModel();
  }
  
  const { xs, ys } = prepareData(data);
  const history = await model.fit(xs, ys, {
    epochs: 50,
    batchSize: 32,
    validationSplit: 0.2,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}, accuracy = ${logs.acc.toFixed(4)}`);
        accuracyHistory.push(logs.acc);
      }
    }
  });
  
  // Update global accuracy (use validation accuracy)
  modelAccuracy = history.history.val_acc[history.history.val_acc.length - 1];
  
  // Save model
  await model.save(`file://${MODEL_PATH}`);
  
  return model;
}

// Predict next color
async function predictNextColor(data) {
  try {
    // Load or create model
    if (fs.existsSync(MODEL_PATH)) {
      model = await tf.loadLayersModel(`file://${MODEL_PATH}`);
    } else {
      model = await createModel();
    }
    
    // Retrain periodically or when accuracy drops
    if (accuracyHistory.length === 0 || modelAccuracy < 0.85) {
      await trainModel(data);
    }
    
    // Prepare input (last 10 results)
    const lastSequence = data.slice(0, 10).map(d => encodeColor[d.color]);
    const input = tf.tensor2d([lastSequence]);
    
    // Make prediction
    const prediction = model.predict(input);
    const values = await prediction.data();
    prediction.dispose();
    
    // Get probabilities
    const probabilities = {
      Red: values[0],
      Green: values[1],
      Violet: values[2]
    };
    
    // Get most likely color
    const predictedIndex = values.indexOf(Math.max(...values));
    const predictedColor = decodeColor[predictedIndex];
    
    return {
      color: predictedColor,
      probability: probabilities[predictedColor],
      probabilities
    };
  } catch (error) {
    console.error('Prediction error:', error);
    throw error;
  }
}

module.exports = { predictNextColor };