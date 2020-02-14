// 校验学号
const verifyStuId = stuId => {
    if (stuId.length === 13 && // 校验学号长度
        stuId.slice(0, 4) <= new Date().getFullYear()) { // 校验学号年份
        return true
    } else {
        return false
    }
}

// 校验姓名
const verifyName = name => {
    return name.length >=2 ? true : false
}
  

module.exports = {
    verifyStuId: verifyStuId,
    verifyName: verifyName
}