/**
 * Module dependencies.
 */
console.error(1);
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto');
   console.error(2);
/**
 * User Schema
 */
var UserSchema = new Schema({
    uid: Number,
    account: String,
    hashed_password: String,
    salt: String
});
console.error(3);
UserSchema.index({account:1},{ unique: true });
UserSchema.index({uid:1},{ unique: true });
/**
 * Virtuals
 */
UserSchema.virtual('password').set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.encryptPassword(password);
}).get(function() {
    return this._password;
});
console.error(4);
/**
 * Validations
 */
var validatePresenceOf = function(value) {
    return value && value.length;
};

UserSchema.path('account').validate(function(account) {
    return account.length;
}, 'Account cannot be blank');

UserSchema.path('hashed_password').validate(function(hashed_password) {
    return hashed_password.length;
}, 'Password cannot be blank');

console.error(5);
/**
 * Pre-save hook
 */
UserSchema.pre('save', function(next) {
    if (!this.isNew) return next();

    if (!validatePresenceOf(this.password)){
        return next(new Error('Invalid password'))
    }

    if (!this.created) this.created = new Date;
    var self=this;
    User
        .find({uid:{$gt:0}},{uid:1})
        .sort({uid:-1})
        .limit(1)
        .exec(function(err, user){
            self.uid= (user[0]?user[0].uid:0)+1;
            next(err);
        });
});
console.error(6);
/**
 * Methods
 */
UserSchema.methods = {
    /**
     * Authenticate - check if the passwords are the same
     *
     * @param {String} plainText
     * @return {Boolean}
     * @api public
     */
    authenticate: function(plainText) {
        return this.encryptPassword(plainText) === this.hashed_password;
    },

    /**
     * Make salt
     *
     * @return {String}
     * @api public
     */
    makeSalt: function() {
        return Math.round((new Date().valueOf() * Math.random())) + '';
    },

    /**
     * Encrypt password
     *
     * @param {String} password
     * @return {String}
     * @api public
     */
    encryptPassword: function(password) {
        if (!password) return '';
        return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
    }
};
console.error(7);
var User = module.exports = mongoose.model('User', UserSchema);