function reverse(s){
    return s.split("").reverse().join("");
}

exports.shorten = function(id){
	var base_dict = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
	var shortened;
	if (id==0){
		return shortened = 0;
	}else{
		var code = ""
		while (id > 0){
			var base = 62;
			var remainder = id % base;
			// console.log(remainder)
			id = id / base;
			// this floors it to the nearest integer
			// this sucks for negatives which we wont
			// deal with.
			id = Math.floor(id);
			code = code + base_dict.charAt(remainder)
			}
			return reverse(code)
	}

};

exports.expand = function(code){
		var base_dict = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
	var base = 62;
	var decr = 0;
	var num = 0;
	// console.log('length of code ' + code.length)

	for (i=0; i<code.length; i++){
		var char1 = code.charAt(i);
		// console.log('char at index is ' + char1)
		exponent = (code.length - (decr +1));
		// console.log(exponent);
		var index_number =  base_dict.indexOf(char1)
		// console.log(index_number) 
		num  += index_number * (Math.pow(base, exponent))
		decr += 1

	}
	 return num




};