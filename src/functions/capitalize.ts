export default function capitalizeFirstLetter(sentence: string) {
  let words = sentence.split(" ");
  for (let i = 0; i < words.length; i++) {
    let firstLetter = words[i].charAt(0).toUpperCase();
    words[i] = firstLetter + words[i].slice(1);
  }
  let result = words.join(" ");
  return result;
}