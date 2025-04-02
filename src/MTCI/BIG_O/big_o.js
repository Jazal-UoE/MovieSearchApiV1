let array_test = ["first", "second", "third", 1, 2, 3];

function find_number(array) {
  return array.filter((value) => typeof value == "number");
}

console.log(find_number(array_test));

function findString(array, string) {
  for (let i = 0; i < array.length; i++) {
    if (array[i] === string) {
      var output = "found " + string;
      return output;
    }
  }
  var error_output = "not found";
  return error_output;
}
let input_string = 3;
console.log(findString(array_test, input_string));
