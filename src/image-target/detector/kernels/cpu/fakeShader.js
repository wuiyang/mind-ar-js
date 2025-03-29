import { memoize } from "../../../utils/memo";

function deepFlatten(arr, out = []) {
  for (let i = 0; i < arr.length; i++) {
    const val = arr[i];
    if (Array.isArray(val)) {
      deepFlatten(val, out);
    } else {
      out.push(val);
    }
  }
  return out;
}

const getAllDimensionIndexInternal = memoize(
  (dimensions, index = 0) => {
    const output = [];
    const dimension = dimensions[index];

    if (index >= dimensions.length - 1) {
      for (let i = 0; i < dimension; i++) {
        output[i] = [i];
      }
    } else {
      const restDimension = getAllDimensionIndexInternal(dimensions, index + 1);
      for (let i = 0; i < dimension; i++) {
        for (let ri = 0; ri < restDimension.length; ri++) {
          output.push([i].concat(restDimension[ri]));
        }
      }
    }

    return output;
  },
  (dimension, index) => dimension.slice(index).join("-"),
);

function getAllDimensionIndex(dimensions) {
  const result = getAllDimensionIndexInternal(dimensions);
  // make a copy to prevent overwritten cache
  return result.map(value => value.slice());
}

/**
 * @typedef {Object} Kernel
 * @property {string[]} variableNames
 * @property {number[]} outputShape
 * @property {Function} userCode
 */

/**
 *
 * @param {MathBackendCPU} backend
 * @param {Kernel} kernel
 * @param {Array<.TensorInfo>} inputs
 * @param {DataType} dtype
 * @returns {Tensor}
 */
function runCode(backend, kernel, inputs, dtype) {
  const inputData = inputs.map(value => backend.data.get(value.dataId).values);

  // create getter functions for every variable name, clamping the input.
  const tempData = {};
  kernel.variableNames.forEach((name, index) => {
    const funName = `get${capFirstLetter(name)}`;
    // console.log("Making function:",funName,inputs[index].shape);
    tempData[funName] = function (...args) {
      const inputIndex = index;
      for (let i = 0; i < args.length; i++) {
        args[i] = clampInt(args[i], 0, inputs[inputIndex].shape[i]);
      }
      return inputData[index][flatten(args, inputs[inputIndex].shape)];
    };
  });
  tempData.int = Math.trunc;
  tempData.atan = Math.atan2;
  const output = getAllDimensionIndex(kernel.outputShape).map((index) => {
    tempData.getOutputCoords = () => index;
    let out;

    tempData.setOutput = (newValue) => {
      out = Number.isNaN(newValue) ? 0 : Math.fround(newValue);
    };
    // bind the method calls and run the code
    kernel.userCode.bind(tempData)();
    return out;
  });

  // output.flat()
  // convert the output from a matrix into a tensor

  return backend.makeOutput(deepFlatten(output), kernel.outputShape, dtype);
}

/**
 *
 * @param {string} word
 * @returns
 */
function capFirstLetter(word) {
  return word[0].toUpperCase() + word.substring(1);
}

function clampInt(n, min, max) {
  return Math.min(Math.max(n, min), max - 1);
}
/**
 *
 * @param {number[]} input
 * @param {number[]} max
 * @returns
 */
function flatten(input, max) {
  return input.reduce((prev, current, index) => {
    for (let i = index + 1; i < max.length; i++) {
      current *= max[i];
    }
    return prev + current;
  }, 0);
}

export { runCode };
