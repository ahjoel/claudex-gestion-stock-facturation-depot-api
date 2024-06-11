const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SCRET.toString();

class JWTUtilities {
    //This method help us to check if the token provided is valid or not
    async checkTokenValidity(token) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, jwtSecret, (err, decoded) => {
                if (err) {
                    resolve({isOk: false});
                }
                resolve({isOk: true, userId: decoded.id});
            });
        });
    }

    //generate the token that will be returned after sign in
    generateToken(userId, expiresIn) {
        //encoding the connected userId + the secret + the delay of expiration
        return jwt.sign({id: userId}, jwtSecret, {
            expiresIn: expiresIn
        })
    }
}

module.exports = new JWTUtilities();
