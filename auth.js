const sql = require('mssql');

const auth = {
    checkAuthentication: function(req, res) {
        let authenticated = false;
    
        if (req.session.authenticatedUser) {
            authenticated = true;
        }
    
        if (!authenticated) {
            let url = req.protocol + '://' + req.get('host') + req.originalUrl;
            let loginMessage = "You have not been authorized to access the URL " + url;
            req.session.loginMessage = loginMessage;
            res.redirect('/login');
        }
    
        return authenticated;
    },

    administrator: function (req, res) {
        const isAdmin = false;
        
        if (req.session.isAdmin) {
            isAdmin = true;
        } else if (!isAdmin) {
            const notAdminMessage = "Sorry, you do not have authorization for admin access."
            req.session.notAdminMessage = loginMessage;
            res.redirect('/login');
        }

    }
}

module.exports = auth;