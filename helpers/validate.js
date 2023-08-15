const validator = require('validator');

const validate = (params) => {
    let name = !validator.isEmpty(params.name) &&
        validator.isLength(params.name, { min: 3, max: undefined }) &&
        validator.isAlpha(params.name, "es-ES");

    let nick = !validator.isEmpty(params.nick) &&
        validator.isLength(params.nick, { min: 3, max: undefined });

    let email = !validator.isEmpty(params.email) &&
        validator.isEmail(params.email);
    
    let password = !validator.isEmpty(params.password)

    if(params.bio){
        let bio = validator.isLength(params.bio, { min: undefined, max: 255 });

        if(!bio){
            throw new Error('Error validate');
        }
    }

    if (!name || !nick || !email || !password) {
        throw new Error('Error validate');
    }

}

module.exports = validate
