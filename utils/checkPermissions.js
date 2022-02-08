const customErrors = require('../errors')

const checkPermissions = (requestor, resourceUserId) => {
    //if the requestor's role is admin, it's okay to proceed
    if(requestor.userRole === 'admin') return;
    //if the requestor is requesting their own user ID, Okay to proceed
    if(requestor.userId === resourceUserId.toString()) return;
    //else we trow an error for the requestor is trying to approach other people's info
    throw new customErrors.UnauthorizedError('Not authorized to this route')
}


module.exports = checkPermissions