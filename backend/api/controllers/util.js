const checkEmail = (str) => {
  var re = /^[a-zA-Z0-9_.-]+@[^\s@]+\.[^\s@]+$/;
  return re.test(str);
};

const checkCharacters = (str) => {
  var re = /^[a-zA-Z\s]+$/;
  return re.test(str);
};
const checkNumbers = (str) => {
  var re = /[0-9]/;
  return re.test(str);
};

const checkSpecialChar = (str) => {
  var re = /[!@#$%^&*(),.?":{}|<>]/;
  return re.test(str);
};

const checkNumbersAndSpecialChar = (str) => {
  const numberRe = /[0-9]/;
  const specialCharRe = /[!@#$%^&*(),.?";:{}|<>]/;
  return numberRe.test(str) || specialCharRe.test(str);
};

const checkPassword = (str) => {
  const hasDigit = /[0-9]/.test(str);
  const hasUppercase = /[A-Z]/.test(str);
  const hasLowercase = /[a-z]/.test(str);
  const hasSpecialChar = /[!@#$%^&*()_+{}\[\]:;"'<>,.?/~`\-|]/.test(str);
  const isValidLength = str.length >= 8;
  return (
    hasDigit && hasUppercase && hasLowercase && hasSpecialChar && isValidLength
  );
};
const checkContactNumber = (str) => {
  const isValidFormat = /^09\d{9}$/.test(str);
  return isValidFormat;
};
const checkMiddleInitial = (str) => {
  if (str === null || str === "") {
    return true;
  }
  var re = /^[a-zA-Z]$/;
  return re.test(str);
};
const checkNumbersWithHyphen = (str) => {
  var re = /^[0-9-]+$/;
  return re.test(str);
};

const calculateAge = (birthDate) => {
  const today = new Date();
  const birthDateObj = new Date(birthDate);
  let age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDiff = today.getMonth() - birthDateObj.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDateObj.getDate())
  ) {
    age--;
  }
  return age;
};

const checkPwdIdFormat = (str) => {
  const re = /^\d{2}-\d{4}-\d{3}-\d{7}$/;
  return re.test(str);
};

module.exports = {
  checkEmail,
  checkCharacters,
  checkSpecialChar,
  checkNumbers,
  checkNumbersAndSpecialChar,
  checkPassword,
  checkContactNumber,
  checkMiddleInitial,
  checkNumbersWithHyphen,
  calculateAge,
  checkPwdIdFormat,
};
