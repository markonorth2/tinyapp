
const arrayToObject = function(arr) {
  const arrayToObject = function(arr) {
    let result_obj = {}
    for (let item of arr){
      result_obj[item[0]] = item[1]
    }
    return result_obj
  };
  
};

console.log(arrayToObject([['a', 1], ['b', 2], ['c', 3]]))
