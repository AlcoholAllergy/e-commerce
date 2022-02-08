const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const User = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'Please provide the name'],
        minlength: 4,
        maxlength: 50
    },
    email:{
        type: String,
        required: [true, 'Please provide the email'],
        validate:{
            validator:validator.isEmail,
            message:'Please provide valid email address',
        },
        unique:true,
    },
    password:{
        type: String,
        required: [true, 'Please provide the password'],
        minlength: 6,
        maxlength: 150,
    },
    role:{
        type:String,
        enum:['admin','user'],
        default:'user',
    }
})

//use schema's pre save property to hash the password
User.pre('save', async function(){
    // console.log(this.modifiedPaths());  modifiedPaths tells every field been updated
    // console.log(this.isModified('name')); isModified function returns Boolean

    //lets check if the password has been updated. If not, just return to prevent the password been hashed again when we use the document pre save property to update the user instance.
    // console.log(this.isModified('password'));
    if(!this.isModified('password')) return;
    
    //get the salt 1st
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
})

//create a compare password function for the User instance
User.methods.comparePassword = async function(notHashedPassword){
    const isMatch = await bcrypt.compare(notHashedPassword,this.password)
    return isMatch
}

module.exports = mongoose.model('Users',User)