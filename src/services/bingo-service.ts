export const shuffleBingoBoard = () => {
  const el = generateRandomArray();

  let x = 0;
  return Array.from(Array(5), _ => {
    return Array.from(Array(5), __ => {
      return {
        active: false,
        value: el[x++]
      };
    })
  });
}

export const generateRandomArray = () => {
  const el = Array.from(Array(25), (_, j) => j + 1);
  return shuffleArrayElement(el);
}

export const shuffleArrayElement = (arr: Array<number>) => {
  let currentIndex = arr.length, randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
  }

  return arr;
}