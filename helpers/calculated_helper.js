/**
 * https://math.stackexchange.com/questions/22348/how-to-add-and-subtract-values-from-an-average/1567345
 *  Sub value from average=> (average*N / (const-x)) / (N-1)
 *  Ex.
 *  N = 2  const = 5
 *  3 + 2 = 5=>  5/N = 2.5
 *  2.5, 2 => (total, oldRate)
 *  (2.5*2 / const-2 ) / 2-1
 * 
*/


editBookRate = function(bookRate, NUsers, userOldRate, userNewRate){
    sub = deleteRateFromBook(bookRate, NUsers, userOldRate)
    newAvg = addRateToBook(bookRate, NUsers, userNewRate)

    // console.log(bookRate, NUsers, userOldRate)

    // subAv = (bookRate*NUsers / (5-userOldRate<=1?1:userOldRate-1)) / (NUsers<=1?1:NUsers-1)
    // console.log(subAv)
    // updatedBookRate = subAv + ((userOldRate - subAv) / (NUsers===0?1:NUsers))

    // console.log(subAv, updatedBookRate)
    return newAvg
}

/**
 * Ex1:
 *  totalRate = 5, Nuser = 1, oldRate = 5
 * (5*1 / (5-5<=1?1:5-1)) / (1<=1?1:1-1)
 * > (5/1)
 * 
 * (average * nValues - value) / (nValues - 1)
 * (5*1 - 5) / (1<=1?1:1-1)
 * Ex2:
 * Nuser=2, oldRate = 4, totalRate = 3.5
 * (3.5*2 - 4)/(2-1)
 *  newAvg = 3
*/

deleteRateFromBook = function(bookRate, NUsers, userOldRate){
    console.log(bookRate, NUsers, userOldRate)
    // subAv = (bookRate*NUsers / (5-userOldRate<=1?1:userOldRate-1)) / (NUsers<=1?1:NUsers-1)
    subAv = ((bookRate*NUsers) - userOldRate) / (NUsers<=1?1:NUsers-1)
    return subAv
}


addRateToBook = function(bookRate, NUsers, userStars){
    console.log(bookRate, NUsers, userStars)
            // 0 + (4-0)/
    bookRate = bookRate + ( (userStars - bookRate) / (NUsers===0?1:NUsers))

    console.log(bookRate)
    return bookRate

}


editBookRate = function(bookRate, NUsers, userOldRate, userNewRate){
    sub = deleteRateFromBook(bookRate, NUsers, userOldRate)
    newAvg = addRateToBook(sub, NUsers, userNewRate)

    // console.log(bookRate, NUsers, userOldRate)

    // subAv = (bookRate*NUsers / (5-userOldRate<=1?1:userOldRate-1)) / (NUsers<=1?1:NUsers-1)
    // console.log(subAv)
    // updatedBookRate = subAv + ((userOldRate - subAv) / (NUsers===0?1:NUsers))

    // console.log(subAv, updatedBookRate)
    return newAvg
}

module.exports = {editBookRate,deleteRateFromBook,addRateToBook}

