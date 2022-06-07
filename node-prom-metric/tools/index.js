exports.genRandomInteger = (int) => Math.floor(Math.random() * int);
exports.delay = (milliseconds) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("delay");
    }, milliseconds);
  });
};
